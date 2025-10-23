#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Processador OCR específico para impressoras multifuncionais
Otimizado para documentos brasileiros (RG/CNH)
Suporte para HP, Canon, Epson, Brother, Samsung, etc.
"""

import sys
import json
import base64
import pytesseract
from PIL import Image, ImageEnhance, ImageFilter
import io
import re
import cv2
import numpy as np

# Configuração do Tesseract
TESSERACT_PATH = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
TESSDATA_PREFIX = r'C:\Program Files\Tesseract-OCR\tessdata'
pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH

# Configurar variável de ambiente para tessdata
import os
os.environ['TESSDATA_PREFIX'] = TESSDATA_PREFIX

def preprocess_for_multifunctional(image):
    """Pré-processamento específico para imagens de impressoras multifuncionais"""
    # Converter para OpenCV
    img_array = np.array(image)
    
    # Converter RGB para BGR (OpenCV usa BGR)
    if len(img_array.shape) == 3:
        img_bgr = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR@Override
    else:
        img_bgr = img_array
    
    # Redimensionar para melhor qualidade
    height, width = img_bgr.shape[:2]
    scale_factor = 2.5  # Maior fator para multifuncionais
    new_width = int(width * scale_factor)
    new_height = int(height * scale_factor)
    img_resized = cv2.resize(img_bgr, (new_width, new_height), interpolation=cv2.INTER_CUBIC)
    
    # Converter para escala de cinza
    gray = cv2.cvtColor(img_resized, cv2.COLOR_BGR2GRAY)
    
    # Aplicar filtros específicos para multifuncionais
    # Desfoque gaussiano mais suave
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # Aplicar threshold adaptativo com parâmetros otimizados
    thresh = cv2.adaptiveThreshold(
        blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 15, 2
    )
    
    # Morfologia para limpar a imagem
    kernel = np.ones((2, 2), np.uint8)
    cleaned = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
    
    # Aplicar filtro de mediana para reduzir ruído
    cleaned = cv2.medianBlur(cleaned, 3)
    
    # Converter de volta para PIL
    processed_image = Image.fromarray(cleaned)
    
    return processed_image

def enhance_multifunctional_image(image):
    """Melhorar a qualidade da imagem de impressora multifuncional"""
    # Aumentar contraste (menos agressivo para multifuncionais)
    enhancer = ImageEnhance.Contrast(image)
    image = enhancer.enhance(1.3)
    
    # Aumentar nitidez (mais suave)
    enhancer = ImageEnhance.Sharpness(image)
    image = enhancer.enhance(1.5)
    
    # Ajustar brilho
    enhancer = ImageEnhance.Brightness(image)
    image = enhancer.enhance(1.05)
    
    # Ajustar saturação se for colorida
    if image.mode == 'RGB':
        enhancer = ImageEnhance.Color(image)
        image = enhancer.enhance(1.1)
    
    return image

def extract_document_data_multifunctional(image_data):
    """Extrai dados de documentos usando OCR otimizado para impressoras multifuncionais"""
    try:
        # Decodificar imagem base64
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        
        print(f"🖨️ Imagem original: {image.size[0]}x{image.size[1]} pixels")
        
        # Pré-processar para impressora multifuncional
        processed_image = preprocess_for_multifunctional(image)
        
        # Melhorar qualidade
        enhanced_image = enhance_multifunctional_image(processed_image)
        
        print(f"🖨️ Imagem processada: {enhanced_image.size[0]}x{enhanced_image.size[1]} pixels")
        
        # Configurações otimizadas para impressoras multifuncionais
        custom_config = r'--oem 3 --psm 6 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ÁÉÍÓÚÂÊÎÔÛÃÕÇáéíóúâêîôûãõç.,-/:()@ '
        
        # Tentar português primeiro, fallback para inglês
        try:
            text = pytesseract.image_to_string(enhanced_image, lang='por', config=custom_config)
            print("✅ OCR em português realizado com sucesso")
        except:
            text = pytesseract.image_to_string(enhanced_image, lang='eng', config=custom_config)
            print("⚠️ Fallback para OCR em inglês")
        
        # Analisar texto e extrair dados
        data = parse_document_text_multifunctional(text)
        
        return {
            'success': True,
            'data': data,
            'raw_text': text,
            'confidence': calculate_confidence_multifunctional(data),
            'device_type': 'multifunctional'
        }
        
    except Exception as e:
        print(f"❌ Erro no processamento OCR: {str(e)}")
        return {
            'success': False,
            'error': str(e),
            'data': {},
            'raw_text': '',
            'confidence': 0,
            'device_type': 'multifunctional'
        }

def parse_document_text_multifunctional(text):
    """Análise avançada do texto extraído para impressoras multifuncionais"""
    data = {}
    
    # Normalizar texto
    normalized_text = re.sub(r'\s+', ' ', text).strip()
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    
    print(f"🔍 Texto normalizado: {normalized_text[:200]}...")
    print(f"📄 Total de linhas: {len(lines)}")
    
    # Padrões específicos para documentos brasileiros (otimizados para multifuncionais)
    patterns = {
        'cpf': [
            r'\b(\d{3}\.?\d{3}\.?\d{3}-?\d{2})\b',
            r'CPF[:\s]*(\d{3}\.?\d{3}\.?\d{3}-?\d{2})',
            r'CPF[:\s]*(\d{11})',
            r'DOCUMENTO[:\s]*(\d{3}\.?\d{3}\.?\d{3}-?\d{2})',
            r'DOC[:\s]*(\d{3}\.?\d{3}\.?\d{3}-?\d{2})'
        ],
        'rg': [
            r'\b(\d{1,2}\.?\d{3}\.?\d{3}-?\d{1,2})\b',
            r'RG[:\s]*(\d{1,2}\.?\d{3}\.?\d{3}-?\d{1,2})',
            r'REGISTRO[:\s]*(\d{1,2}\.?\d{3}\.?\d{3}-?\d{1,2})',
            r'IDENTIDADE[:\s]*(\d{1,2}\.?\d{3}\.?\d{3}-?\d{1,2})',
            r'DOC[:\s]*(\d{1,2}\.?\d{3}\.?\d{3}-?\d{1,2})'
        ],
        'nascimento': [
            r'NASCIMENTO[:\s]*(\d{1,2}\/\d{1,2}\/\d{4})',
            r'NASC[:\s]*(\d{1,2}\/\d{1,2}\/\d{4})',
            r'DATA[:\s]*(\d{1,2}\/\d{1,2}\/\d{4})',
            r'NASCIDO[:\s]*(\d{1,2}\/\d{1,2}\/\d{4})',
            r'\b(\d{1,2}\/\d{1,2}\/\d{4})\b',
            r'DATA\s+DE\s+NASCIMENTO[:\s]*(\d{1,2}\/\d{1,2}\/\d{4})',
            r'DT\s+NASC[:\s]*(\d{1,2}\/\d{1,2}\/\d{4})'
        ],
        'nome': [
            r'NOME[:\s]+([A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s]+)',
            r'NOME\s+COMPLETO[:\s]+([A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s]+)',
            r'IDENTIDADE[:\s]+([A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s]+)',
            r'CIDADÃO[:\s]+([A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s]+)',
            r'PORTADOR[:\s]+([A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s]+)',
            r'TITULAR[:\s]+([A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s]+)'
        ]
    }
    
    # Extrair CPF
    for pattern in patterns['cpf']:
        match = re.search(pattern, normalized_text, re.IGNORECASE)
        if match:
            cpf = re.sub(r'[^\d]', '', match.group(1))
            if len(cpf) == 11 and is_valid_cpf(cpf):
                data['cpf'] = format_cpf(cpf)
                print(f"📋 CPF encontrado: {data['cpf']}")
                break
    
    # Extrair RG
    for pattern in patterns['rg']:
        match = re.search(pattern, normalized_text, re.IGNORECASE)
        if match:
            data['rg'] = match.group(1)
            print(f"📋 RG encontrado: {data['rg']}")
            break
    
    # Extrair data de nascimento
    for pattern in patterns['nascimento']:
        match = re.search(pattern, normalized_text, re.IGNORECASE)
        if match:
            data['nascimento'] = match.group(1)
            print(f"📋 Data de nascimento encontrada: {data['nascimento']}")
            break
    
    # Extrair nome
    for pattern in patterns['nome']:
        match = re.search(pattern, normalized_text, re.IGNORECASE)
        if match:
            data['nome'] = match.group(1).strip()
            print(f"📋 Nome encontrado: {data['nome']}")
            break
    
    # Extrair informações adicionais (otimizadas para multifuncionais)
    extract_additional_info_multifunctional(normalized_text, data)
    
    return data

def extract_additional_info_multifunctional(text, data):
    """Extrai informações adicionais do documento (otimizado para multifuncionais)"""
    
    # Sexo
    if re.search(r'\b(MASCULINO|M)\b', text, re.IGNORECASE):
        data['sexo'] = 'MASCULINO'
    elif re.search(r'\b(FEMININO|F)\b', text, re.IGNORECASE):
        data['sexo'] = 'FEMININO'
    
    # Estado civil
    if re.search(r'\b(SOLTEIRO|SOLTEIRA)\b', text, re.IGNORECASE):
        data['estadoCivil'] = 'SOLTEIRO'
    elif re.search(r'\b(CASADO|CASADA)\b', text, re.IGNORECASE):
        data['estadoCivil'] = 'CASADO'
    elif re.search(r'\b(DIVORCIADO|DIVORCIADA)\b', text, re.IGNORECASE):
        data['estadoCivil'] = 'DIVORCIADO'
    elif re.search(r'\b(VIÚVO|VIUVA|VIUVO)\b', text, re.IGNORECASE):
        data['estadoCivil'] = 'VIUVO'
    
    # Naturalidade
    naturalidade_patterns = [
        r'NATURAL\s+DE[:\s]+([A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s]+)',
        r'NATURALIDADE[:\s]+([A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s]+)',
        r'NAT[:\s]+([A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s]+)'
    ]
    
    for pattern in naturalidade_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            data['naturalidade'] = match.group(1).strip()
            print(f"📋 Naturalidade encontrada: {data['naturalidade']}")
            break
    
    # Profissão
    profissao_patterns = [
        r'PROFISSÃO[:\s]+([A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s]+)',
        r'PROF[:\s]+([A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s]+)',
        r'OCUPAÇÃO[:\s]+([A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s]+)'
    ]
    
    for pattern in profissao_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            data['profissao'] = match.group(1).strip()
            print(f"📋 Profissão encontrada: {data['profissao']}")
            break
    
    # Nome do pai
    pai_patterns = [
        r'PAI[:\s]+([A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s]+)',
        r'FILIAÇÃO[:\s]+([A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s]+)',
        r'PATERNO[:\s]+([A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s]+)'
    ]
    
    for pattern in pai_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            data['pai'] = match.group(1).strip()
            print(f"📋 Nome do pai encontrado: {data['pai']}")
            break
    
    # Nome da mãe
    mae_patterns = [
        r'(MÃE|MAE)[:\s]+([A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s]+)',
        r'FILIAÇÃO[:\s]+([A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s]+)[:\s]+([A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s]+)',
        r'MÃE[:\s]+([A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s]+)',
        r'MATERNO[:\s]+([A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s]+)'
    ]
    
    for pattern in mae_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            data['mae'] = match.group(2) if len(match.groups()) > 1 else match.group(1)
            data['mae'] = data['mae'].strip()
            print(f"📋 Nome da mãe encontrado: {data['mae']}")
            break
    
    # Endereço
    endereco_patterns = [
        r'(RUA|AVENIDA|ALAMEDA|TRAVESSA|R\.|AV\.|R\.|AVENIDA|AL\.|TRAV\.)\s+([A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s]+)',
        r'ENDEREÇO[:\s]+([A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s]+)',
        r'LOGRADOURO[:\s]+([A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s]+)',
        r'R[:\s]+([A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s]+)'
    ]
    
    for pattern in endereco_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            data['logradouro'] = match.group(1).upper() if len(match.groups()) > 1 else 'RUA'
            data['endereco'] = match.group(2).strip() if len(match.groups()) > 1 else match.group(1).strip()
            print(f"📋 Endereço encontrado: {data['logradouro']} {data['endereco']}")
            break
    
    # CEP
    cep_match = re.search(r'\b(\d{5}-?\d{3})\b', text)
    if cep_match:
        data['cep'] = format_cep(cep_match.group(1))
        print(f"📋 CEP encontrado: {data['cep']}")
    
    # Telefone
    telefone_match = re.search(r'\b(\d{2}\s?\d{4,5}-?\d{4})\b', text)
    if telefone_match:
        data['telefone'] = telefone_match.group(1)
        print(f"📋 Telefone encontrado: {data['telefone']}")
    
    # Email
    email_match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text)
    if email_match:
        data['email'] = email_match.group(0)
        print(f"📋 Email encontrado: {data['email']}")

def is_valid_cpf(cpf):
    """Valida CPF"""
    if len(cpf) != 11 or cpf == cpf[0] * 11:
        return False
    
    # Calcular dígitos verificadores
    sum1 = sum(int(cpf[i]) * (10 - i) for i in range(9))
    digit1 = 0 if sum1 % 11 < 2 else 11 - (sum1 % 11)
    
    sum2 = sum(int(cpf[i]) * (11 - i) for i in range(10))
    digit2 = 0 if sum2 % 11 < 2 else 11 - (sum2 % 11)
    
    return cpf[9] == str(digit1) and cpf[10] == str(digit2)

def format_cpf(cpf):
    """Formata CPF"""
    return f"{cpf[:3]}.{cpf[3:6]}.{cpf[6:9]}-{cpf[9:]}"

def format_cep(cep):
    """Formata CEP"""
    cep = re.sub(r'[^\d]', '', cep)
    return f"{cep[:5]}-{cep[5:]}" if len(cep) == 8 else cep

def calculate_confidence_multifunctional(data):
    """Calcula confiança baseada nos campos extraídos (otimizado para multifuncionais)"""
    fields = ['nome', 'cpf', 'rg', 'nascimento', 'pai', 'mae', 'naturalidade', 'sexo', 'estadoCivil']
    extracted_fields = sum(1 for field in fields if data.get(field))
    
    # Bonificação para multifuncionais (geralmente têm melhor qualidade)
    base_confidence = (extracted_fields / len(fields)) * 100
    bonus = 5 if extracted_fields >= 5 else 0
    
    return min(100, base_confidence + bonus)

def main():
    """Função principal para processar OCR via linha de comando"""
    if len(sys.argv) != 2:
        print(json.dumps({
            'success': False,
            'error': 'Uso: python multifunctional_scanner_ocr.py <imagem_base64>'
        }))
        sys.exit(1)
    
    try:
        image_data = sys.argv[1]
        result = extract_document_data_multifunctional(image_data)
        print(json.dumps(result, ensure_ascii=False, indent=2))
        
    except Exception as e:
        print(json.dumps({
            'success': False,
            'error': str(e)
        }))
        sys.exit(1)

if __name__ == '__main__':
    main()
