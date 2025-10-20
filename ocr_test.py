#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Teste do Tesseract OCR instalado
Verifica se está funcionando corretamente
"""

import sys
import os
import subprocess
import tempfile
from PIL import Image, ImageDraw, ImageFont

def test_tesseract_installation():
    """Testa se o Tesseract está instalado e funcionando"""
    print("🔍 Testando instalação do Tesseract...")
    
    tesseract_path = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
    
    if not os.path.exists(tesseract_path):
        print("❌ Tesseract não encontrado em:", tesseract_path)
        return False
    
    try:
        # Testa a versão do Tesseract
        result = subprocess.run([tesseract_path, '--version'], 
                              capture_output=True, text=True, timeout=10)
        
        if result.returncode == 0:
            print("✅ Tesseract encontrado!")
            print("📋 Versão:", result.stdout.strip())
            return True
        else:
            print("❌ Erro ao executar Tesseract:", result.stderr)
            return False
            
    except subprocess.TimeoutExpired:
        print("❌ Timeout ao executar Tesseract")
        return False
    except Exception as e:
        print("❌ Erro:", str(e))
        return False

def create_test_image():
    """Cria uma imagem de teste com texto"""
    print("🖼️ Criando imagem de teste...")
    
    # Criar uma imagem branca
    img = Image.new('RGB', (800, 600), color='white')
    draw = ImageDraw.Draw(img)
    
    # Texto de teste (simulando um RG)
    test_text = [
        "REPUBLICA FEDERATIVA DO BRASIL",
        "ESTADO DE SAO PAULO",
        "CARTEIRA DE IDENTIDADE",
        "",
        "NOME: JOAO DA SILVA SANTOS",
        "FILIACAO: JOSE DA SILVA SANTOS",
        "MARIA DA SILVA SANTOS",
        "",
        "NASCIMENTO: 15/03/1985",
        "NATURALIDADE: SAO PAULO/SP",
        "SEXO: MASCULINO",
        "ESTADO CIVIL: SOLTEIRO",
        "",
        "RG: 12.345.678-9",
        "CPF: 123.456.789-00",
        "",
        "ENDERECO: RUA DAS FLORES, 123",
        "BAIRRO: CENTRO",
        "CIDADE: SAO PAULO",
        "CEP: 01234-567",
        "",
        "PROFISSAO: ENGENHEIRO"
    ]
    
    # Tentar usar uma fonte do sistema
    try:
        font = ImageFont.truetype("arial.ttf", 20)
    except:
        try:
            font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 20)
        except:
            font = ImageFont.load_default()
    
    # Desenhar o texto na imagem
    y_position = 50
    for line in test_text:
        if line:  # Se não for linha vazia
            draw.text((50, y_position), line, fill='black', font=font)
        y_position += 30
    
    return img

def test_ocr_with_image():
    """Testa OCR com uma imagem criada"""
    print("🔍 Testando OCR com imagem...")
    
    tesseract_path = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
    
    try:
        # Criar imagem de teste
        test_img = create_test_image()
        
        # Salvar imagem temporária
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as temp_file:
            test_img.save(temp_file.name)
            temp_image_path = temp_file.name
        
        # Arquivo de saída temporário
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as temp_output:
            temp_output_path = temp_output.name
        
        print("📄 Imagem salva em:", temp_image_path)
        print("📄 Saída será salva em:", temp_output_path)
        
        # Executar Tesseract
        cmd = [
            tesseract_path,
            temp_image_path,
            temp_output_path.replace('.txt', ''),  # Tesseract adiciona .txt automaticamente
            '-l', 'por',  # Português
            '--oem', '1',  # LSTM OCR Engine
            '--psm', '1'   # Segmentação automática
        ]
        
        print("🚀 Executando comando:", ' '.join(cmd))
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            print("✅ OCR executado com sucesso!")
            
            # Ler resultado
            output_file = temp_output_path.replace('.txt', '') + '.txt'
            if os.path.exists(output_file):
                with open(output_file, 'r', encoding='utf-8') as f:
                    ocr_text = f.read()
                
                print("📋 Texto extraído:")
                print("-" * 50)
                print(ocr_text)
                print("-" * 50)
                
                # Verificar se extraiu dados importantes
                extracted_data = analyze_extracted_text(ocr_text)
                print("🎯 Dados extraídos:")
                for key, value in extracted_data.items():
                    if value:
                        print(f"  ✅ {key}: {value}")
                    else:
                        print(f"  ❌ {key}: Não encontrado")
                
                # Limpar arquivos temporários
                os.unlink(temp_image_path)
                os.unlink(output_file)
                
                return True
            else:
                print("❌ Arquivo de saída não encontrado")
                return False
        else:
            print("❌ Erro ao executar OCR:", result.stderr)
            return False
            
    except subprocess.TimeoutExpired:
        print("❌ Timeout ao executar OCR")
        return False
    except Exception as e:
        print("❌ Erro:", str(e))
        return False

def analyze_extracted_text(text):
    """Analisa o texto extraído e identifica dados"""
    import re
    
    data = {}
    
    # Nome
    nome_match = re.search(r'NOME[:\s]+([A-Z][A-Z\s]+)', text)
    if nome_match:
        data['Nome'] = nome_match.group(1).strip()
    
    # CPF
    cpf_match = re.search(r'CPF[:\s]*(\d{3}\.?\d{3}\.?\d{3}-?\d{2})', text)
    if cpf_match:
        data['CPF'] = cpf_match.group(1)
    
    # RG
    rg_match = re.search(r'RG[:\s]*(\d{1,2}\.?\d{3}\.?\d{3}-?\d{1,2})', text)
    if rg_match:
        data['RG'] = rg_match.group(1)
    
    # Data de nascimento
    nasc_match = re.search(r'NASCIMENTO[:\s]*(\d{1,2}/\d{1,2}/\d{4})', text)
    if nasc_match:
        data['Nascimento'] = nasc_match.group(1)
    
    # Sexo
    if 'MASCULINO' in text:
        data['Sexo'] = 'MASCULINO'
    elif 'FEMININO' in text:
        data['Sexo'] = 'FEMININO'
    
    # Estado civil
    if 'SOLTEIRO' in text:
        data['Estado Civil'] = 'SOLTEIRO'
    elif 'CASADO' in text:
        data['Estado Civil'] = 'CASADO'
    
    # Naturalidade
    nat_match = re.search(r'NATURALIDADE[:\s]+([A-Z][A-Z\s/]+)', text)
    if nat_match:
        data['Naturalidade'] = nat_match.group(1).strip()
    
    # Profissão
    prof_match = re.search(r'PROFISSAO[:\s]+([A-Z][A-Z\s]+)', text)
    if prof_match:
        data['Profissão'] = prof_match.group(1).strip()
    
    # CEP
    cep_match = re.search(r'CEP[:\s]*(\d{5}-?\d{3})', text)
    if cep_match:
        data['CEP'] = cep_match.group(1)
    
    return data

def main():
    """Função principal"""
    print("=" * 60)
    print("    TESTE DO TESSERACT OCR - SISTEMA CARTÓRIO")
    print("=" * 60)
    print()
    
    # Teste 1: Verificar instalação
    if not test_tesseract_installation():
        print("❌ Tesseract não está funcionando corretamente!")
        print("💡 Soluções:")
        print("   1. Reinstale o Tesseract")
        print("   2. Verifique o caminho de instalação")
        print("   3. Execute como administrador")
        return False
    
    print()
    
    # Teste 2: Testar OCR com imagem
    if test_ocr_with_image():
        print()
        print("🎉 SUCESSO! Tesseract está funcionando perfeitamente!")
        print("✅ O sistema OCR está pronto para uso!")
        print()
        print("🚀 Próximos passos:")
        print("   1. Execute: TESTAR-OCR.bat")
        print("   2. Acesse: http://localhost:3000")
        print("   3. Vá para: Cadastro > Cliente")
        print("   4. Clique no ícone da câmera para testar!")
        return True
    else:
        print("❌ OCR não está funcionando corretamente!")
        return False

if __name__ == '__main__':
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n⏹️ Teste interrompido pelo usuário")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Erro inesperado: {e}")
        sys.exit(1)

