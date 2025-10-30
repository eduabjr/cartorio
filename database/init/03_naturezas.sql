-- ========================================
-- Tabela de Naturezas de Serviços
-- ========================================
-- Criada para gerenciar as naturezas dos serviços
-- com suas respectivas alíquotas de ISS

CREATE TABLE IF NOT EXISTS naturezas (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    codigo VARCHAR(20) UNIQUE NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    percentual_iss DECIMAL(4,2) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    observacoes TEXT,
    tabela_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_naturezas_codigo (codigo),
    INDEX idx_naturezas_descricao (descricao),
    INDEX idx_naturezas_ativo (ativo),
    INDEX idx_naturezas_percentual (percentual_iss)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mensagem de sucesso
SELECT 'Tabela de naturezas criada com sucesso!' as status;

