# Natureza e Serviços de Cartório - Service

Microserviço para gerenciamento de Naturezas e Serviços de Cartório.

## 📋 Descrição

Este serviço gerencia:
1. **Naturezas**: Diferentes alíquotas de ISS (Imposto Sobre Serviços) de acordo com as tabelas da ARPENSP
2. **Serviços de Cartório**: Cadastro completo de cada item da tabela de custas com valores configuráveis manualmente

## 🚀 Características

- **Cadastro de Naturezas**: Criação, edição e exclusão de naturezas de serviços
- **Configuração de Alíquotas**: Suporte para alíquotas de 0% a 5% de ISS
- **Links para Tabelas**: Armazenamento de URLs das tabelas de custas da ARPENSP
- **Busca Avançada**: Busca por código, descrição ou filtro de status
- **API RESTful**: Endpoints bem definidos seguindo padrões REST

## 📊 Alíquotas Suportadas

- 0% (Sem ISS)
- 1,0%
- 1,5%
- 2,0%
- 2,5%
- 3,0%
- 3,5%
- 4,0%
- 4,5%
- 5,0%

## 🔧 Tecnologias

- **NestJS**: Framework Node.js
- **Prisma**: ORM para banco de dados
- **MySQL**: Banco de dados
- **TypeScript**: Linguagem de programação
- **Docker**: Containerização

## 📡 API Endpoints

### Naturezas

#### Listar Naturezas
```
GET /naturezas
GET /naturezas?search=termo
GET /naturezas?page=1&limit=10
```

### Buscar Natureza
```
GET /naturezas/:id
GET /naturezas/codigo/:codigo
```

### Listar Ativas
```
GET /naturezas/ativas
```

### Criar Natureza
```
POST /naturezas
Body: {
  "codigo": "ISS-1.0",
  "descricao": "Descrição",
  "percentualIss": 1.00,
  "ativo": true,
  "observacoes": "...",
  "tabelaUrl": "https://..."
}
```

### Atualizar Natureza
```
PATCH /naturezas/:id
Body: {
  "descricao": "Nova descrição",
  "percentualIss": 2.00
}
```

### Excluir Natureza
```
DELETE /naturezas/:id
```

---

### Serviços de Cartório

#### Listar Serviços
```
GET /servicos-cartorio
GET /servicos-cartorio?search=termo
GET /servicos-cartorio?naturezaId=uuid
GET /servicos-cartorio?page=1&limit=10
```

#### Buscar Serviço
```
GET /servicos-cartorio/:id
GET /servicos-cartorio/codigo/:codigo
GET /servicos-cartorio/natureza/:naturezaId
```

#### Listar Ativos
```
GET /servicos-cartorio/ativos
```

#### Criar Serviço
```
POST /servicos-cartorio
Body: {
  "codigoServico": "1.1",
  "descricao": "Registro de nascimento",
  "naturezaId": "uuid",
  "valorEmolumento": 150.00,
  "valorFerc": 30.00,
  "valorFundos": 20.00,
  "tipoServico": "NASCIMENTO",
  "unidadeReferencia": "UFR",
  "observacoes": "...",
  "ativo": true
}
```

**Cálculo Automático:**
- Base de Cálculo = Emolumento + FERC + Fundos
- ISS = Base × (% da Natureza) / 100
- Total = Base + ISS

#### Atualizar Serviço
```
PATCH /servicos-cartorio/:id
Body: {
  "descricao": "Nova descrição",
  "valorEmolumento": 200.00
}
```

#### Excluir Serviço
```
DELETE /servicos-cartorio/:id
```

## 🗄️ Modelo de Dados

### Natureza

```prisma
model Natureza {
  id            String   @id @default(uuid())
  codigo        String   @unique
  descricao     String
  percentualIss Decimal  @db.Decimal(4, 2)
  ativo         Boolean  @default(true)
  observacoes   String?
  tabelaUrl     String?
  criadoEm      DateTime @default(now())
  atualizadoEm  DateTime @updatedAt
}
```

### Serviço de Cartório

```prisma
model ServicoCartorio {
  id                String
  naturezaId        String?
  codigoServico     String
  descricao         String
  valorEmolumento   Decimal
  valorFerc         Decimal
  valorFundos       Decimal
  baseCalculo       Decimal  // Calculado automaticamente
  valorIss          Decimal  // Calculado automaticamente
  valorTotal        Decimal  // Calculado automaticamente
  tipoServico       String   // NASCIMENTO, CASAMENTO, etc.
  unidadeReferencia String?
  observacoes       String?
  ativo             Boolean
  criadoEm          DateTime
  atualizadoEm      DateTime
}
```

## 🔌 Porta

O serviço roda na porta **3006** por padrão.

## 🚀 Como Executar

### Com Docker
```bash
docker-compose up natureza-service
```

### Modo Desenvolvimento
```bash
cd services/natureza-service
npm install
npx prisma generate
npm run dev
```

## 📚 Dados Iniciais

O serviço já vem pré-configurado com as 10 naturezas principais baseadas nas tabelas da ARPENSP 2025:

1. ISS-1.0 - Tabela 1%
2. ISS-1.5 - Tabela 1,5%
3. ISS-2.0 - Tabela 2%
4. ISS-2.5 - Tabela 2,5%
5. ISS-3.0 - Tabela 3%
6. ISS-3.5 - Tabela 3,5%
7. ISS-4.0 - Tabela 4%
8. ISS-4.5 - Tabela 4,5%
9. ISS-5.0 - Tabela 5%
10. SEM-ISS - Tabela sem ISS

## 📖 Referências

- [Tabelas de Custas ARPENSP 2025](https://arpensp.org.br/)
- Todas as tabelas incluem links diretos para os PDFs oficiais

## 🛡️ Segurança

- Validação de dados de entrada
- Circuit breaker para resiliência
- Retry automático em caso de falhas
- Health check endpoint

## 💡 Como Usar

### 1. Criar Naturezas (Alíquotas de ISS)

Primeiro, crie as naturezas com as diferentes alíquotas de ISS:
- ISS 1%, 1.5%, 2%, etc.

### 2. Cadastrar Serviços

Para cada serviço da tabela de custas:
1. Selecione a Natureza (alíquota de ISS)
2. Preencha o código do serviço
3. Informe a descrição
4. Configure os valores:
   - Emolumento
   - FERC
   - Outros Fundos
5. O sistema calcula automaticamente:
   - Base de Cálculo
   - Valor do ISS
   - Valor Total

### 3. Tipos de Serviços Disponíveis

- NASCIMENTO
- CASAMENTO  
- OBITO
- CERTIDAO
- RECONHECIMENTO
- AVERBACAO
- DIVERSOS
- OUTROS

## 📝 Notas

- Os percentuais são armazenados com 2 casas decimais
- Valores monetários com precisão de 2 casas decimais
- Códigos de serviço únicos no sistema
- Cálculos automáticos baseados na natureza selecionada
- Suporte a ativação/desativação de naturezas e serviços
- Histórico automático de criação e atualização
- Relacionamento entre serviços e naturezas

