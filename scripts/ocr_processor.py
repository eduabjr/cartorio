#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Processador OCR usando Tesseract nativo
Configurado para documentos brasileiros (RG/CNH)
"""

import sys
import json
import base64
import pytesseract
from PIL import Image
import io
import re

# Configuração do Tesseract
TESSERACT_PATH = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
TESSDATA_PREFIX = r'C:\Program Files\Tesseract-OCR\tessdata'
pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH

# Configurar variável de ambiente para tessdata
import os
os.environ['TESSDATA_PREFIX'] = TESSDATA_PREFIX

def preprocess_image(image):
    """Pré-processa a imagem para melhorar a qualidade do OCR"""
    # Converter para escala de cinza
    if image.mode != 'L':
        image = image.convert('L')
    
    # Aumentar o tamanho da imagem para melhor resolução
    width, height = image.size
    new_width = width * 2
    new_height = height * 2
    image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
    
    return image

def extract_document_data(image_data):
    """Extrai dados de documentos brasileiros usando OCR"""
    try:
        # Decodificar imagem base64
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        
        # Pré-processar imagem
        processed_image = preprocess_image(image)
        
                # Configurações do Tesseract para português brasileiro
                custom_config = r'--oem 1 --psm 1 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,-/:()@ '
                
                # Usar inglês por enquanto (português requer instalação manual)
                text = pytesseract.image_to_string(processed_image, lang='eng', config=custom_config)
        
        # Analisar texto e extrair dados
        data = parse_document_text(text)
        
        return {
            'success': True,
            'data': data,
            'raw_text': text
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'data': {}
        }

def parse_document_text(text):
    """Analisa o texto extraído e identifica campos específicos"""
    data = {}
    
    # Normalizar texto
    normalized_text = re.sub(r'\s+', ' ', text).strip()
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    
    # Padrões para extração de dados
    patterns = {
        'cpf': [
            r'\b(\d{3}\.?\d{3}\.?\d{3}-?\d{2})\b',
            r'CPF[:\s]*(\d{3}\.?\d{3}\.?\d{3}-?\d{2})',
            r'CPF[:\s]*(\d{11})'
        ],
        'rg': [
            r'\b(\d{1,2}\.?\d{3}\.?\d{3}-?\d{1,2})\b',
            r'RG[:\s]*(\d{1,2}\.?\d{3}\.?\d{3}-?\d{1,2})',
            r'REGISTRO[:\s]*(\d{1,2}\.?\d{3}\.?\d{3}-?\d{1,2})'
        ],
        'nascimento': [
            r'NASCIMENTO[:\s]*(\d{1,2}\/\d{1,2}\/\d{4})',
            r'NASC[:\s]*(\d{1,2}\/\d{1,2}\/\d{4})',
            r'DATA[:\s]*(\d{1,2}\/\d{1,2}\/\d{4})',
            r'\b(\d{1,2}\/\d{1,2}\/\d{4})\b'
        ],
        'nome': [
            r'NOME[:\s]+([A-Z][A-Z\s]+)',
            r'NOME\s+COMPLETO[:\s]+([A-Z][A-Z\s]+)',
            r'IDENTIDADE[:\s]+([A-Z][A-Z\s]+)'
        ]
    }
    
    # Extrair CPF
    for pattern in patterns['cpf']:
        match = re.search(pattern, normalized_text, re.IGNORECASE)
        if match:
            cpf = re.sub(r'[^\d]', '', match.group(1))
            if len(cpf) == 11:
                data['cpf'] = format_cpf(cpf)
                break
    
    # Extrair RG
    for pattern in patterns['rg']:
        match = re.search(pattern, normalized_text, re.IGNORECASE)
        if match:
            data['rg'] = match.group(1)
            break
    
    # Extrair data de nascimento
    for pattern in patterns['nascimento']:
        match = re.search(pattern, normalized_text, re.IGNORECASE)
        if match:
            data['nascimento'] = match.group(1)
            break
    
    # Extrair nome
    for pattern in patterns['nome']:
        match = re.search(pattern, normalized_text, re.IGNORECASE)
        if match:
            data['nome'] = match.group(1).strip()
            break
    
    # Extrair sexo
    if 'MASCULINO' in normalized_text.upper() or 'M' in normalized_text:
        data['sexo'] = 'MASCULINO'
    elif 'FEMININO' in normalized_text.upper() or 'F' in normalized_text:
        data['sexo'] = 'FEMININO'
    
    # Extrair estado civil
    if 'SOLTEIRO' in normalized_text.upper():
        data['estadoCivil'] = 'SOLTEIRO'
    elif 'CASADO' in normalized_text.upper():
        data['estadoCivil'] = 'CASADO'
    elif 'DIVORCIADO' in normalized_text.upper():
        data['estadoCivil'] = 'DIVORCIADO'
    elif 'VIUVO' in normalized_text.upper():
        data['estadoCivil'] = 'VIUVO'
    
    # Extrair naturalidade
    naturalidade_match = re.search(r'NATURAL\s+DE[:\s]+([A-Z][A-Z\s]+)', normalized_text, re.IGNORECASE)
    if naturalidade_match:
        data['naturalidade'] = naturalidade_match.group(1).strip()
    
    # Extrair profissão
    profissao_match = re.search(r'PROFISSÃO[:\s]+([A-Z][A-Z\s]+)', normalized_text, re.IGNORECASE)
    if profissao_match:
        data['profissao'] = profissao_match.group(1).strip()
    
    # Extrair nome do pai
    pai_match = re.search(r'PAI[:\s]+([A-Z][A-Z\s]+)', normalized_text, re.IGNORECASE)
    if pai_match:
        data['pai'] = pai_match.group(1).strip()
    
    # Extrair nome da mãe
    mae_match = re.search(r'MÃE[:\s]+([A-Z][A-Z\s]+)', normalized_text, re.IGNORECASE)
    if mae_match:
        data['mae'] = mae_match.group(1).strip()
    
    # Extrair CEP
    cep_match = re.search(r'\b(\d{5}-?\d{3})\b', normalized_text)
    if cep_match:
        data['cep'] = format_cep(cep_match.group(1))
    
    # Extrair endereço
    endereco_patterns = [
        r'(RUA|AVENIDA|ALAMEDA|TRAVESSA|R\.|AV\.)\s+([A-Z][A-Z\s]+)',
        r'ENDEREÇO[:\s]+([A-Z][A-Z\s]+)'
    ]
    
    for pattern in endereco_patterns:
        match = re.search(pattern, normalized_text, re.IGNORECASE)
        if match:
            data['endereco'] = match.group(2).strip() if len(match.groups()) > 1 else match.group(1).strip()
            break
    
    # Extrair telefone
    telefone_match = re.search(r'\b(\d{2}\s?\d{4,5}-?\d{4})\b', normalized_text)
    if telefone_match:
        data['telefone'] = telefone_match.group(1)
    
    # Extrair email
    email_match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', normalized_text)
    if email_match:
        data['email'] = email_match.group(0)
    
    return data

def format_cpf(cpf):
    """Formata CPF"""
    return f"{cpf[:3]}.{cpf[3:6]}.{cpf[6:9]}-{cpf[9:]}"

def format_cep(cep):
    """Formata CEP"""
    cep = re.sub(r'[^\d]', '', cep)
    return f"{cep[:5]}-{cep[5:]}" if len(cep) == 8 else cep

def main():
    """Função principal para processar OCR via linha de comando"""
    if len(sys.argv) != 2:
        print(json.dumps({
            'success': False,
            'error': 'Uso: python ocr_processor.py <imagem_base64>'
        }))
        sys.exit(1)
    
    try:
        image_data = sys.argv[1]
        result = extract_document_data(image_data)
        print(json.dumps(result, ensure_ascii=False, indent=2))
        
    except Exception as e:
        print(json.dumps({
            'success': False,
            'error': str(e)
        }))
        sys.exit(1)

if __name__ == '__main__':
    main()
