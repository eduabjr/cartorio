// Tipos e interfaces para o sistema de senhas

export type CategoriaSenha = 'preferencial' | 'comum'
export type TipoAudio = 'voz' | 'som' | 'ambos' | 'nenhum'
export type GeneroVoz = 'feminino' | 'masculino'

export type StatusAtendimento = 'aguardando' | 'chamando' | 'atendendo' | 'finalizado' | 'ausente'

// Tipo de serviço (ex: Casamento, Certidão, Protocolo)
export interface TipoServico {
  id: string
  nome: string // Ex: Casamento, Certidão, Protocolo
  sigla: string // Ex: C, CT, P
  cor: string
  ativo: boolean
  ordem: number
}

// Categoria de Serviço (P ou C)
export interface CategoriaServico {
  id: string
  nome: string // "Preferencial" ou "Comum"
  tipo: CategoriaSenha // 'preferencial' ou 'comum'
  sigla: string // "P" ou "C"
  cor: string
  ativo: boolean
  ordem: number
}

// Serviço completo = Categoria + Tipo
// Ex: "Casamento Preferencial" ou "Certidão Comum"
export interface ServicoSenha {
  id: string
  tipoServicoId?: string // Referência ao TipoServico (opcional por compatibilidade)
  categoriaId?: string // ID da categoria pai
  categoria: CategoriaSenha // preferencial ou comum
  nome: string // Nome completo: "Casamento Preferencial"
  sigla: string // Ex: CP (Casamento Preferencial), CC (Casamento Comum)
  cor: string
  ativo: boolean
  ordem: number
  tempoMedioAtendimento: number // em minutos
  // Mantém compatibilidade com código antigo
  tipoSenha?: CategoriaSenha
  prioridade?: boolean // Computed: true se categoria === 'preferencial'
}

export interface Senha {
  id: string
  numero: number // Número sequencial do dia
  numeroCompleto: string // Ex: P001, C042
  servicoId: string
  servico: ServicoSenha
  status: StatusAtendimento
  guicheId?: string
  guicheNumero?: number
  funcionarioNome?: string
  horaEmissao: Date
  horaChamada?: Date
  horaAtendimento?: Date
  horaFinalizacao?: Date
  tempoEspera?: number // em minutos
  prioridade: boolean
  observacoes?: string
}

export interface Guiche {
  id: string
  numero: number
  nome: string
  ativo: boolean
  funcionarioId?: string
  funcionarioNome?: string
  servicosAtendidos: string[] // IDs dos serviços que o guichê atende
  senhaAtual?: Senha
  statusGuiche: 'livre' | 'ocupado' | 'pausado'
}

export type FormatoSenha = 'padrao' | 'compacto' | 'extenso' | 'personalizado'
export type LayoutPainelPublico = 'senha-esquerda' | 'senha-direita' | 'senha-cima' | 'senha-baixo'

export interface ConfiguracaoSenha {
  reiniciarSenhasDiariamente: boolean
  horarioReinicio: string // HH:mm
  
  // Configuração de Áudio
  tipoAudio: TipoAudio // 'voz', 'som', 'ambos', 'nenhum'
  emitirSom: boolean
  volumeSom: number // 0-100
  usarVoz: boolean
  velocidadeVoz: number // 0.5 - 2.0
  volumeVoz: number // 0-100
  generoVoz: GeneroVoz // 'feminino' | 'masculino'
  pitchVoz: number // 0.5 - 2.0 (tom: grave a agudo)
  
  mensagemBoasVindas: string
  mensagemChamada: string // Ex: "Senha {senha}, Guichê {guiche}"
  exibirTempoEspera: boolean
  tempoAtualizacaoTela: number // segundos
  quantidadeSenhasExibidas: number
  avisoSenhaAusente: boolean
  tempoEsperaAusencia: number // segundos
  
  // Priorização de Senhas Preferenciais
  bloquearComumSePreferencialEsperando: boolean
  tempoEsperaPreferencialParaBloquear: number // minutos
  
  // Formato de Exibição de Senhas
  formatoSenha: FormatoSenha
  formatoPersonalizado: string // Ex: "{categoria}{numero:4}" -> C0001
  
  // Layout do Painel Público
  layoutPainelPublico: LayoutPainelPublico
}

export interface EstatisticasSenha {
  data: Date
  totalEmitidas: number
  totalAtendidas: number
  totalAusentes: number
  tempoMedioEspera: number
  tempoMedioAtendimento: number
  porServico: {
    [servicoId: string]: {
      emitidas: number
      atendidas: number
      tempoMedio: number
    }
  }
  porGuiche: {
    [guicheId: string]: {
      atendimentos: number
      tempoMedio: number
    }
  }
}

