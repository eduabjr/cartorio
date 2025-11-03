import { Senha, ServicoSenha, Guiche, ConfiguracaoSenha, StatusAtendimento, EstatisticasSenha } from '../types/senha'
import { senhaEventService } from './SenhaEventService'

class SenhaServiceClass {
  private readonly STORAGE_KEYS = {
    SERVICOS: 'senha-servicos',
    GUICHES: 'senha-guiches',
    SENHAS: 'senha-senhas',
    CONFIGURACAO: 'senha-configuracao',
    CONTADOR_DIA: 'senha-contador-dia',
    ULTIMA_DATA: 'senha-ultima-data'
  }

  // ==================== SERVIÇOS ====================
  
  getServicos(): ServicoSenha[] {
    const saved = localStorage.getItem(this.STORAGE_KEYS.SERVICOS)
    if (saved) {
      return JSON.parse(saved)
    }
    
    // Serviços padrão
    const servicosPadrao: ServicoSenha[] = [
      {
        id: 'preferencial',
        nome: 'Atendimento Preferencial',
        sigla: 'P',
        cor: '#3b82f6',
        ativo: true,
        ordem: 1,
        tipoSenha: 'preferencial',
        tempoMedioAtendimento: 10
      },
      {
        id: 'comum',
        nome: 'Atendimento Comum',
        sigla: 'C',
        cor: '#10b981',
        ativo: true,
        ordem: 2,
        tipoSenha: 'comum',
        tempoMedioAtendimento: 15
      }
    ]
    
    localStorage.setItem(this.STORAGE_KEYS.SERVICOS, JSON.stringify(servicosPadrao))
    return servicosPadrao
  }

  salvarServicos(servicos: ServicoSenha[]): void {
    localStorage.setItem(this.STORAGE_KEYS.SERVICOS, JSON.stringify(servicos))
    this.dispatchEvent('servicos-updated')
    
    // Emitir evento para outras abas/páginas
    senhaEventService.emit('config_atualizada', servicos, 'ConfiguracaoSenha')
  }

  // ==================== GUICHÊS ====================
  
  getGuiches(): Guiche[] {
    const saved = localStorage.getItem(this.STORAGE_KEYS.GUICHES)
    if (saved) {
      return JSON.parse(saved)
    }
    return []
  }

  salvarGuiches(guiches: Guiche[]): void {
    localStorage.setItem(this.STORAGE_KEYS.GUICHES, JSON.stringify(guiches))
    this.dispatchEvent('guiches-updated')
    
    // Emitir evento para outras abas/páginas
    senhaEventService.emit('guiche_atualizado', guiches, 'GerenciamentoGuiches')
  }

  criarGuiche(dados: Omit<Guiche, 'id'>): Guiche {
    const guiches = this.getGuiches()
    const novoGuiche: Guiche = {
      ...dados,
      id: `guiche-${Date.now()}`
    }
    guiches.push(novoGuiche)
    this.salvarGuiches(guiches)
    return novoGuiche
  }

  // ==================== SENHAS ====================
  
  getSenhas(): Senha[] {
    this.verificarReinicioDiario()
    const saved = localStorage.getItem(this.STORAGE_KEYS.SENHAS)
    if (saved) {
      const senhas = JSON.parse(saved)
      // Converter strings de data para objetos Date
      return senhas.map((s: any) => ({
        ...s,
        horaEmissao: new Date(s.horaEmissao),
        horaChamada: s.horaChamada ? new Date(s.horaChamada) : undefined,
        horaAtendimento: s.horaAtendimento ? new Date(s.horaAtendimento) : undefined,
        horaFinalizacao: s.horaFinalizacao ? new Date(s.horaFinalizacao) : undefined
      }))
    }
    return []
  }

  salvarSenhas(senhas: Senha[]): void {
    localStorage.setItem(this.STORAGE_KEYS.SENHAS, JSON.stringify(senhas))
    this.dispatchEvent('senhas-updated')
  }

  emitirSenha(servicoId: string, prioridade: boolean = false): Senha {
    const servicos = this.getServicos()
    const servico = servicos.find(s => s.id === servicoId)
    
    if (!servico) {
      throw new Error('Serviço não encontrado')
    }

    if (!servico.ativo) {
      throw new Error('Serviço inativo')
    }

    const senhas = this.getSenhas()
    
    // Obter próximo número para o serviço
    const senhasDoServico = senhas.filter(s => s.servicoId === servicoId)
    const proximoNumero = senhasDoServico.length + 1
    const numeroCompleto = `${servico.sigla}${proximoNumero.toString().padStart(3, '0')}`

    const novaSenha: Senha = {
      id: `senha-${Date.now()}-${Math.random()}`,
      numero: proximoNumero,
      numeroCompleto,
      servicoId,
      servico,
      status: 'aguardando',
      horaEmissao: new Date(),
      prioridade,
      tempoEspera: 0
    }

    senhas.push(novaSenha)
    this.salvarSenhas(senhas)
    
    // Emitir evento para outras abas/páginas
    senhaEventService.emit('senha_emitida', novaSenha, 'TerminalSenha')
    
    console.log(`🎫 Senha emitida: ${numeroCompleto}`)
    return novaSenha
  }

  chamarSenha(senhaId: string, guicheId: string): Senha {
    const senhas = this.getSenhas()
    const guiches = this.getGuiches()
    
    const senha = senhas.find(s => s.id === senhaId)
    const guiche = guiches.find(g => g.id === guicheId)
    
    if (!senha) throw new Error('Senha não encontrada')
    if (!guiche) throw new Error('Guichê não encontrado')

    senha.status = 'chamando'
    senha.horaChamada = new Date()
    senha.guicheId = guicheId
    senha.guicheNumero = guiche.numero
    senha.funcionarioNome = guiche.funcionarioNome

    // Calcular tempo de espera
    senha.tempoEspera = Math.floor((senha.horaChamada.getTime() - senha.horaEmissao.getTime()) / 1000 / 60)

    this.salvarSenhas(senhas)
    this.dispatchEvent('senha-chamada', senha)
    
    // Emitir evento para outras abas/páginas
    senhaEventService.emit('senha_chamada', senha, 'Controlador')
    
    console.log(`📢 Senha chamada: ${senha.numeroCompleto} no Guichê ${guiche.numero}`)
    return senha
  }

  iniciarAtendimento(senhaId: string): Senha {
    const senhas = this.getSenhas()
    const senha = senhas.find(s => s.id === senhaId)
    
    if (!senha) throw new Error('Senha não encontrada')

    senha.status = 'atendendo'
    senha.horaAtendimento = new Date()

    this.salvarSenhas(senhas)
    this.dispatchEvent('senha-atendimento-iniciado', senha)
    
    // Emitir evento para outras abas/páginas
    senhaEventService.emit('senha_atendendo', senha, 'Controlador')
    
    return senha
  }

  finalizarAtendimento(senhaId: string): Senha {
    const senhas = this.getSenhas()
    const senha = senhas.find(s => s.id === senhaId)
    
    if (!senha) throw new Error('Senha não encontrada')

    senha.status = 'finalizado'
    senha.horaFinalizacao = new Date()

    this.salvarSenhas(senhas)
    this.dispatchEvent('senha-finalizada', senha)
    
    // Emitir evento para outras abas/páginas
    senhaEventService.emit('senha_finalizada', senha, 'Controlador')
    
    console.log(`✅ Atendimento finalizado: ${senha.numeroCompleto}`)
    return senha
  }

  marcarAusente(senhaId: string): Senha {
    const senhas = this.getSenhas()
    const senha = senhas.find(s => s.id === senhaId)
    
    if (!senha) throw new Error('Senha não encontrada')

    senha.status = 'ausente'

    this.salvarSenhas(senhas)
    this.dispatchEvent('senha-ausente', senha)
    
    // Emitir evento para outras abas/páginas
    senhaEventService.emit('senha_cancelada', senha, 'Controlador')
    
    return senha
  }

  // ==================== PRÓXIMA SENHA ====================
  
  obterProximaSenha(guicheId: string): Senha | null {
    const senhas = this.getSenhas()
    const guiches = this.getGuiches()
    const guiche = guiches.find(g => g.id === guicheId)
    
    if (!guiche) return null

    // Filtrar senhas aguardando que o guichê pode atender
    const senhasDisponiveis = senhas.filter(s => 
      s.status === 'aguardando' && 
      guiche.servicosAtendidos.includes(s.servicoId)
    )

    if (senhasDisponiveis.length === 0) return null

    // Priorizar senhas preferenciais
    const preferenciais = senhasDisponiveis.filter(s => s.prioridade)
    if (preferenciais.length > 0) {
      return preferenciais[0]
    }

    // Retornar a primeira senha comum
    return senhasDisponiveis[0]
  }

  // ==================== CONFIGURAÇÃO ====================
  
  getConfiguracao(): ConfiguracaoSenha {
    const saved = localStorage.getItem(this.STORAGE_KEYS.CONFIGURACAO)
    if (saved) {
      return JSON.parse(saved)
    }

    const configuracaoPadrao: ConfiguracaoSenha = {
      reiniciarSenhasDiariamente: true,
      horarioReinicio: '00:00',
      tipoAudio: 'voz',
      emitirSom: true,
      volumeSom: 90,
      usarVoz: true,
      velocidadeVoz: 1.0,
      volumeVoz: 100,
      generoVoz: 'feminino',
      pitchVoz: 1.2,
      mensagemBoasVindas: 'Bem-vindo ao Sistema de Atendimento',
      mensagemChamada: 'Senha {senha}, Guichê {guiche}',
      exibirTempoEspera: true,
      tempoAtualizacaoTela: 5,
      quantidadeSenhasExibidas: 3,
      avisoSenhaAusente: true,
      tempoEsperaAusencia: 60,
      bloquearComumSePreferencialEsperando: false,
      tempoEsperaPreferencialParaBloquear: 20,
      formatoSenha: 'padrao',
      formatoPersonalizado: '{categoria}{numero:3}',
      layoutPainelPublico: 'senha-esquerda'
    }

    localStorage.setItem(this.STORAGE_KEYS.CONFIGURACAO, JSON.stringify(configuracaoPadrao))
    return configuracaoPadrao
  }

  salvarConfiguracao(config: ConfiguracaoSenha): void {
    localStorage.setItem(this.STORAGE_KEYS.CONFIGURACAO, JSON.stringify(config))
    this.dispatchEvent('configuracao-updated')
    
    // Emitir evento para outras abas/páginas
    senhaEventService.emit('config_atualizada', config, 'ConfiguracaoSenha')
    console.log('✅ Configuração salva e evento emitido para outras abas')
  }

  // ==================== REINÍCIO DIÁRIO ====================
  
  private verificarReinicioDiario(): void {
    const config = this.getConfiguracao()
    if (!config.reiniciarSenhasDiariamente) return

    const ultimaData = localStorage.getItem(this.STORAGE_KEYS.ULTIMA_DATA)
    const hoje = new Date().toDateString()

    // Se nunca foi definida, apenas definir sem limpar
    if (!ultimaData) {
      console.log('📅 Primeira execução - definindo data inicial')
      localStorage.setItem(this.STORAGE_KEYS.ULTIMA_DATA, hoje)
      return
    }

    if (ultimaData !== hoje) {
      console.log('🔄 Novo dia detectado - reiniciando senhas!')
      localStorage.setItem(this.STORAGE_KEYS.SENHAS, JSON.stringify([]))
      localStorage.setItem(this.STORAGE_KEYS.CONTADOR_DIA, JSON.stringify({}))
      localStorage.setItem(this.STORAGE_KEYS.ULTIMA_DATA, hoje)
    }
  }

  reiniciarSenhas(): void {
    localStorage.setItem(this.STORAGE_KEYS.SENHAS, JSON.stringify([]))
    localStorage.setItem(this.STORAGE_KEYS.CONTADOR_DIA, JSON.stringify({}))
    localStorage.setItem(this.STORAGE_KEYS.ULTIMA_DATA, new Date().toDateString())
    this.dispatchEvent('senhas-reiniciadas')
    console.log('🔄 Senhas reiniciadas manualmente!')
  }

  // ==================== ESTATÍSTICAS ====================
  
  getEstatisticasDia(data?: Date): EstatisticasSenha {
    const senhas = this.getSenhas()
    const dataReferencia = data || new Date()
    const dataStr = dataReferencia.toDateString()

    const senhasDoDia = senhas.filter(s => 
      new Date(s.horaEmissao).toDateString() === dataStr
    )

    const totalEmitidas = senhasDoDia.length
    const totalAtendidas = senhasDoDia.filter(s => s.status === 'finalizado').length
    const totalAusentes = senhasDoDia.filter(s => s.status === 'ausente').length

    const senhasComTempo = senhasDoDia.filter(s => s.tempoEspera !== undefined)
    const tempoMedioEspera = senhasComTempo.length > 0
      ? senhasComTempo.reduce((acc, s) => acc + (s.tempoEspera || 0), 0) / senhasComTempo.length
      : 0

    const senhasFinalizadas = senhasDoDia.filter(s => s.status === 'finalizado' && s.horaAtendimento && s.horaFinalizacao)
    const tempoMedioAtendimento = senhasFinalizadas.length > 0
      ? senhasFinalizadas.reduce((acc, s) => {
          const inicio = new Date(s.horaAtendimento!).getTime()
          const fim = new Date(s.horaFinalizacao!).getTime()
          return acc + ((fim - inicio) / 1000 / 60)
        }, 0) / senhasFinalizadas.length
      : 0

    // Estatísticas por serviço
    const porServico: any = {}
    const servicos = this.getServicos()
    servicos.forEach(servico => {
      const senhasServico = senhasDoDia.filter(s => s.servicoId === servico.id)
      porServico[servico.id] = {
        emitidas: senhasServico.length,
        atendidas: senhasServico.filter(s => s.status === 'finalizado').length,
        tempoMedio: senhasServico.filter(s => s.tempoEspera).reduce((acc, s) => acc + (s.tempoEspera || 0), 0) / senhasServico.length || 0
      }
    })

    // Estatísticas por guichê
    const porGuiche: any = {}
    const guiches = this.getGuiches()
    guiches.forEach(guiche => {
      const atendimentosGuiche = senhasDoDia.filter(s => s.guicheId === guiche.id && s.status === 'finalizado')
      porGuiche[guiche.id] = {
        atendimentos: atendimentosGuiche.length,
        tempoMedio: atendimentosGuiche.length > 0
          ? atendimentosGuiche.reduce((acc, s) => {
              if (s.horaAtendimento && s.horaFinalizacao) {
                return acc + ((new Date(s.horaFinalizacao).getTime() - new Date(s.horaAtendimento).getTime()) / 1000 / 60)
              }
              return acc
            }, 0) / atendimentosGuiche.length
          : 0
      }
    })

    return {
      data: dataReferencia,
      totalEmitidas,
      totalAtendidas,
      totalAusentes,
      tempoMedioEspera,
      tempoMedioAtendimento,
      porServico,
      porGuiche
    }
  }

  // ==================== EVENTOS ====================
  
  private dispatchEvent(eventName: string, detail?: any): void {
    window.dispatchEvent(new CustomEvent(`senha-${eventName}`, { detail }))
  }

  addEventListener(eventName: string, callback: (event: CustomEvent) => void): void {
    window.addEventListener(`senha-${eventName}`, callback as EventListener)
  }

  removeEventListener(eventName: string, callback: (event: CustomEvent) => void): void {
    window.removeEventListener(`senha-${eventName}`, callback as EventListener)
  }

  // ==================== UTILIDADES ====================
  
  getSenhasAguardando(): Senha[] {
    return this.getSenhas().filter(s => s.status === 'aguardando')
  }

  getSenhasChamando(): Senha[] {
    return this.getSenhas().filter(s => s.status === 'chamando')
  }

  getSenhasAtendendo(): Senha[] {
    return this.getSenhas().filter(s => s.status === 'atendendo')
  }

  getUltimasSenhasChamadas(quantidade: number = 10): Senha[] {
    const senhas = this.getSenhas()
      .filter(s => s.horaChamada)
      .sort((a, b) => new Date(b.horaChamada!).getTime() - new Date(a.horaChamada!).getTime())
    
    return senhas.slice(0, quantidade)
  }

  // ==================== FORMATAÇÃO DE SENHAS ====================
  
  formatarSenha(senha: Senha): string {
    const config = this.getConfiguracao()
    
    switch (config.formatoSenha) {
      case 'padrao':
        // Formato padrão: P001, C042
        return senha.numeroCompleto
      
      case 'compacto':
        // Formato compacto: P1, C42 (sem zeros à esquerda)
        return `${senha.servico.sigla[0]}${senha.numero}`
      
      case 'extenso':
        // Formato extenso: Preferencial-0001, Comum-0042
        const categoria = senha.prioridade ? 'Preferencial' : 'Comum'
        return `${categoria}-${String(senha.numero).padStart(4, '0')}`
      
      case 'personalizado':
        // Formato personalizado usando template
        return this.formatarSenhaPersonalizada(senha, config.formatoPersonalizado)
      
      default:
        return senha.numeroCompleto
    }
  }

  private formatarSenhaPersonalizada(senha: Senha, template: string): string {
    let resultado = template
    
    // Substituir {categoria} por P ou C
    resultado = resultado.replace(/\{categoria\}/g, senha.servico.sigla[0] || (senha.prioridade ? 'P' : 'C'))
    
    // Substituir {numero} ou {numero:X} onde X é a quantidade de dígitos
    resultado = resultado.replace(/\{numero(?::(\d+))?\}/g, (match, digitos) => {
      const numDigitos = digitos ? parseInt(digitos) : 3
      return String(senha.numero).padStart(numDigitos, '0')
    })
    
    // Substituir {servico} pelo nome do serviço
    resultado = resultado.replace(/\{servico\}/g, senha.servico.nome)
    
    // Substituir {sigla} pela sigla do serviço
    resultado = resultado.replace(/\{sigla\}/g, senha.servico.sigla)
    
    return resultado
  }
}

export const senhaService = new SenhaServiceClass()

