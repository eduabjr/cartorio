-- ========================================
-- Tabela de Serviços de Cartório
-- ========================================
-- Criada para gerenciar cada serviço/item da tabela de custas
-- com seus respectivos valores configuráveis

CREATE TABLE IF NOT EXISTS servicos_cartorio (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    natureza_id VARCHAR(36),
    codigo_servico VARCHAR(20) NOT NULL,
    descricao VARCHAR(500) NOT NULL,
    
    -- Valores conforme tabela de custas
    ao_oficial DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Valor base (83,3333%)',
    
    -- Cálculos automáticos (baseados no AO OFICIAL)
    iss DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'ISS 2,0% do AO OFICIAL',
    a_sec_faz DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'A SEC. FAZ. 16,6667% do AO OFICIAL',
    total DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Total = AO OFICIAL + ISS + A SEC. FAZ.',
    
    -- Informações adicionais
    tipo_servico ENUM('NASCIMENTO', 'CASAMENTO', 'OBITO', 'DIVERSOS', 'CERTIDAO', 'RECONHECIMENTO', 'AVERBACAO', 'OUTROS') DEFAULT 'OUTROS',
    unidade_referencia VARCHAR(50),
    observacoes TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (natureza_id) REFERENCES naturezas(id) ON DELETE SET NULL,
    INDEX idx_servicos_natureza (natureza_id),
    INDEX idx_servicos_codigo (codigo_servico),
    INDEX idx_servicos_descricao (descricao),
    INDEX idx_servicos_tipo (tipo_servico),
    INDEX idx_servicos_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mensagem de sucesso
SELECT 'Tabela de serviços de cartório criada com sucesso!' as status;

