import { useState, useEffect } from 'react'
import { BasePage } from '../components/BasePage'
import { useAccessibility } from '../hooks/useAccessibility'
import { useModal } from '../hooks/useModal'
import { useTempoReal } from '../hooks/useTempoReal'
import { TempoEsperaReal } from '../components/TempoEsperaReal'
import { senhaService } from '../services/SenhaService'
import { senhaEventService } from '../services/SenhaEventService'
import { Senha, Guiche, EstatisticasSenha } from '../types/senha'

interface PainelSenhasPageProps {
  onClose: () => void
}

export function PainelSenhasPage({ onClose }: PainelSenhasPageProps) {
  const { getTheme, currentTheme } = useAccessibility()
  const theme = getTheme()
  const modal = useModal()
  const agora = useTempoReal()
  
  const headerColor = currentTheme === 'dark' ? '#FF8C00' : '#008080'
  
  const [abaAtiva, setAbaAtiva] = useState<'monitoramento' | 'estatisticas' | 'guiches'>('monitoramento')
  const [senhas, setSenhas] = useState<Senha[]>([])
  const [guiches, setGuiches] = useState<Guiche[]>([])
  const [estatisticas, setEstatisticas] = useState<EstatisticasSenha | null>(null)
  const [filtroTipoSenha, _setFiltroTipoSenha] = useState<string>('todas')
  const [filtroServico, _setFiltroServico] = useState<string>('todos')
  const [guicheSelecionado, setGuicheSelecionado] = useState<string | null>(null)
  const [mostrarSeletorSenha, setMostrarSeletorSenha] = useState<string | null>(null)
  const [filtroStatusMonitoramento, setFiltroStatusMonitoramento] = useState<'todos' | 'aguardando' | 'atendendo' | 'finalizado' | 'ausente'>('todos')
  const [buscaTexto, setBuscaTexto] = useState<string>('')
  const [filtroCategoriaDetalhes, setFiltroCategoriaDetalhes] = useState<'todas' | 'preferencial' | 'comum'>('todas')
  const [filtroServicoEstatisticas, setFiltroServicoEstatisticas] = useState<string>('todos')
  const [buscaServicoEstatisticas, setBuscaServicoEstatisticas] = useState<string>('')
  const [servicosExpandidos, setServicosExpandidos] = useState<Set<string>>(new Set())
  const [dropdownEstatisticasPreferencial, setDropdownEstatisticasPreferencial] = useState<boolean>(false)
  const [dropdownEstatisticasComum, setDropdownEstatisticasComum] = useState<boolean>(false)
  const [paginaServicoCategoria, setPaginaServicoCategoria] = useState<number>(1)
  const [mostrarRelatorioGuiche, setMostrarRelatorioGuiche] = useState<string | null>(null)
  const [diasRelatorioGuiche, setDiasRelatorioGuiche] = useState<number>(1)
  const itensPorPagina = 4

  useEffect(() => {
    carregarDados()
    
    const interval = setInterval(() => {
      carregarDados()
    }, 2000)

    const unsubscribeEmitida = senhaEventService.on('senha_emitida', () => {
      carregarDados()
    })
    
    const unsubscribeChamada = senhaEventService.on('senha_chamada', () => {
      carregarDados()
    })
    
    const unsubscribeFinalizada = senhaEventService.on('senha_finalizada', () => {
      carregarDados()
    })
    
    const unsubscribeCancelada = senhaEventService.on('senha_cancelada', () => {
      carregarDados()
    })

    return () => {
      clearInterval(interval)
      unsubscribeEmitida()
      unsubscribeChamada()
      unsubscribeFinalizada()
      unsubscribeCancelada()
    }
  }, [])

  // Resetar página quando busca ou filtro mudarem
  useEffect(() => {
    setPaginaServicoCategoria(1)
  }, [buscaServicoEstatisticas, filtroServicoEstatisticas])


  const carregarDados = () => {
    setSenhas(senhaService.getSenhas())
    setGuiches(senhaService.getGuiches())
    setEstatisticas(senhaService.getEstatisticasDia())
  }

  const excluirSenha = async (senha: Senha) => {
    const confirmar = await modal.confirm(
      `Tem certeza que deseja excluir a senha ${senha.numeroCompleto}?\n\nEsta ação não pode ser desfeita!`,
      'Confirmar Exclusão',
      '⚠️'
    )

    if (confirmar) {
      try {
        senhaService.excluirSenha(senha.id)
        carregarDados()
        await modal.alert('✅ Senha excluída com sucesso!', 'Sucesso', '✅')
      } catch (error) {
        console.error('❌ Erro ao excluir senha:', error)
        await modal.alert('❌ Erro ao excluir senha. Tente novamente.', 'Erro', '❌')
      }
    }
  }

  const chamarSenhaPeloAdmin = async (guicheId: string, senhaId: string) => {
    try {
      const guiche = guiches.find(g => g.id === guicheId)
      const senha = senhas.find(s => s.id === senhaId)
      
      if (!guiche || !senha) {
        await modal.alert('❌ Guichê ou senha não encontrada!', 'Erro', '❌')
        return
      }

      if (senha.status !== 'aguardando') {
        await modal.alert('⚠️ Esta senha não está mais aguardando.', 'Aviso', '⚠️')
        return
      }

      const senhaChamada = senhaService.chamarSenha(senha.id, guicheId)
      await modal.alert(`✅ Senha ${senhaChamada.numeroCompleto} chamada para o ${guiche.nome}!`, 'Sucesso', '✅')
      setMostrarSeletorSenha(null)
      carregarDados()
    } catch (error) {
      console.error('❌ Erro ao chamar senha:', error)
      await modal.alert('❌ Erro ao chamar senha. Tente novamente.', 'Erro', '❌')
    }
  }

  const calcularTempoOcioso = (guiche: Guiche): string => {
    const senhasDoGuiche = senhas.filter(s => s.guicheId === guiche.id)
    const ultimaSenhaFinalizada = senhasDoGuiche
      .filter(s => s.status === 'finalizado' && s.horaFinalizacao)
      .sort((a, b) => {
        const dataA = a.horaFinalizacao ? new Date(a.horaFinalizacao).getTime() : 0
        const dataB = b.horaFinalizacao ? new Date(b.horaFinalizacao).getTime() : 0
        return dataB - dataA
      })[0]

    if (!ultimaSenhaFinalizada || !ultimaSenhaFinalizada.horaFinalizacao) {
      // Se não há senhas finalizadas, verifica se há senhas em atendimento
      const senhaAtual = senhasDoGuiche.find(s => s.status === 'chamando' || s.status === 'atendendo')
      if (senhaAtual) return '0s' // Está atendendo agora
      
      // Se não há nenhuma senha, tempo ocioso desde o início do dia
      const inicioDia = new Date()
      inicioDia.setHours(0, 0, 0, 0)
      const diffMs = agora.getTime() - inicioDia.getTime()
      const diffSegundos = Math.floor(diffMs / 1000)
      return formatarTempoCompleto(diffSegundos)
    }

    const fim = new Date(ultimaSenhaFinalizada.horaFinalizacao)
    const agora2 = new Date()
    const diffMs = agora2.getTime() - fim.getTime()
    const diffSegundos = Math.floor(diffMs / 1000)
    
    // Se está atendendo agora, tempo ocioso é 0
    const senhaAtual = senhasDoGuiche.find(s => s.status === 'chamando' || s.status === 'atendendo')
    if (senhaAtual) return '0s'
    
    return formatarTempoCompleto(diffSegundos)
  }

  const calcularTempoTotalAtendimento = (guiche: Guiche): string => {
    const senhasDoGuiche = senhas.filter(s => s.guicheId === guiche.id)
    const senhasFinalizadas = senhasDoGuiche.filter(s => 
      s.status === 'finalizado' && s.horaAtendimento && s.horaFinalizacao
    )

    if (senhasFinalizadas.length === 0) {
      // Se está em atendimento agora, calcular tempo da senha atual
      const senhaAtual = senhasDoGuiche.find(s => s.status === 'chamando' || s.status === 'atendendo')
      if (senhaAtual && senhaAtual.horaAtendimento) {
        const diffMs = agora.getTime() - new Date(senhaAtual.horaAtendimento).getTime()
        const diffSegundos = Math.floor(diffMs / 1000)
        return formatarTempoCompleto(diffSegundos)
      }
      return '0s'
    }

    // Somar tempo de todas as senhas finalizadas
    let totalMs = 0
    senhasFinalizadas.forEach(senha => {
      if (senha.horaAtendimento && senha.horaFinalizacao) {
        const diffMs = new Date(senha.horaFinalizacao).getTime() - new Date(senha.horaAtendimento).getTime()
        totalMs += diffMs
      }
    })

    // Se está em atendimento agora, adicionar tempo da senha atual
    const senhaAtual = senhasDoGuiche.find(s => s.status === 'chamando' || s.status === 'atendendo')
    if (senhaAtual && senhaAtual.horaAtendimento) {
      const diffMs = agora.getTime() - new Date(senhaAtual.horaAtendimento).getTime()
      totalMs += diffMs
    }

    const totalSegundos = Math.floor(totalMs / 1000)
    return formatarTempoCompleto(totalSegundos)
  }

  // Gerar relatório do guichê
  const gerarRelatorioGuiche = (guicheId: string) => {
    const guiche = guiches.find(g => g.id === guicheId)
    if (!guiche) return null

    const agoraData = new Date()
    const dataInicio = new Date(agoraData)
    
    // Se for 0 dias, considera apenas hoje
    if (diasRelatorioGuiche === 0 || diasRelatorioGuiche === 1) {
      dataInicio.setHours(0, 0, 0, 0)
    } else {
      dataInicio.setDate(agoraData.getDate() - diasRelatorioGuiche)
      dataInicio.setHours(0, 0, 0, 0)
    }

    // Buscar todas as senhas do período
    const senhasDoGuiche = senhas.filter(s => {
      const dataEmissao = new Date(s.horaEmissao)
      return s.guicheId === guiche.id && dataEmissao >= dataInicio && dataEmissao <= agoraData
    })

    const senhasChamadas = senhasDoGuiche.filter(s => s.status !== 'aguardando')
    const senhasFinalizadas = senhasDoGuiche.filter(s => s.status === 'finalizado')
    const senhasAusentes = senhasDoGuiche.filter(s => s.status === 'ausente')
    const senhasPreferenciaisAtendidas = senhasFinalizadas.filter(s => s.prioridade)
    const senhasComunsAtendidas = senhasFinalizadas.filter(s => !s.prioridade)

    // Calcular tempo médio de atendimento
    let tempoMedioAtendimento = '0min'
    if (senhasFinalizadas.length > 0) {
      const temposAtendimento = senhasFinalizadas.map(s => {
        if (!s.horaAtendimento || !s.horaFinalizacao) return 0
        return new Date(s.horaFinalizacao).getTime() - new Date(s.horaAtendimento).getTime()
      }).filter(t => t > 0)

      if (temposAtendimento.length > 0) {
        const mediaMs = temposAtendimento.reduce((a, b) => a + b, 0) / temposAtendimento.length
        const minutos = Math.floor(mediaMs / 60000)
        const segundos = Math.floor((mediaMs % 60000) / 1000)
        tempoMedioAtendimento = `${minutos}min ${segundos}s`
      }
    }

    return {
      guiche,
      diasPeriodo: diasRelatorioGuiche,
      dataInicio,
      dataFim: agoraData,
      totalChamadas: senhasChamadas.length,
      totalFinalizadas: senhasFinalizadas.length,
      totalAusentes: senhasAusentes.length,
      preferenciais: senhasPreferenciaisAtendidas.length,
      comuns: senhasComunsAtendidas.length,
      tempoMedioAtendimento,
      senhas: senhasDoGuiche
    }
  }

  // Exportar relatório do guichê para Excel
  const exportarExcelGuiche = () => {
    const relatorio = mostrarRelatorioGuiche ? gerarRelatorioGuiche(mostrarRelatorioGuiche) : null
    if (!relatorio) return

    const periodoTexto = diasRelatorioGuiche === 1 
      ? 'Hoje' 
      : `Últimos ${diasRelatorioGuiche} dias`

    // Cabeçalho CSV
    let csv = 'RELATÓRIO DO GUICHÊ - SISTEMA DE SENHAS\n'
    csv += `Guichê:,${relatorio.guiche.numero} - ${relatorio.guiche.nome}\n`
    csv += `Funcionário:,${relatorio.guiche.funcionarioNome || 'Não atribuído'}\n`
    csv += `Período:,${periodoTexto}\n`
    csv += `Data Inicial:,${relatorio.dataInicio.toLocaleDateString('pt-BR')}\n`
    csv += `Data Final:,${relatorio.dataFim.toLocaleDateString('pt-BR')}\n`
    csv += `Gerado em:,${new Date().toLocaleString('pt-BR')}\n`
    csv += '\n'

    // Resumo Geral
    csv += 'RESUMO GERAL\n'
    csv += `Total de Chamadas:,${relatorio.totalChamadas}\n`
    csv += `Finalizadas:,${relatorio.totalFinalizadas}\n`
    csv += `Ausentes:,${relatorio.totalAusentes}\n`
    csv += `Tempo Médio de Atendimento:,${relatorio.tempoMedioAtendimento}\n`
    csv += '\n'

    // Por Categoria
    csv += 'POR CATEGORIA\n'
    csv += `Preferenciais Atendidas:,${relatorio.preferenciais}\n`
    csv += `Comuns Atendidas:,${relatorio.comuns}\n`
    csv += '\n'

    // Detalhamento de Senhas
    csv += 'DETALHAMENTO DE SENHAS\n'
    csv += 'Senha,Serviço,Categoria,Status,Emissão,Chamada,Atendimento,Finalização,Duração\n'
    
    relatorio.senhas.forEach(senha => {
      const categoria = senha.prioridade ? 'Preferencial' : 'Comum'
      const emissao = new Date(senha.horaEmissao).toLocaleString('pt-BR')
      const chamada = senha.horaChamada ? new Date(senha.horaChamada).toLocaleString('pt-BR') : '-'
      const atendimento = senha.horaAtendimento ? new Date(senha.horaAtendimento).toLocaleString('pt-BR') : '-'
      const finalizacao = senha.horaFinalizacao ? new Date(senha.horaFinalizacao).toLocaleString('pt-BR') : '-'
      
      // Calcular duração
      let duracao = '-'
      if (senha.horaAtendimento && senha.horaFinalizacao) {
        const diffMs = new Date(senha.horaFinalizacao).getTime() - new Date(senha.horaAtendimento).getTime()
        const minutos = Math.floor(diffMs / 60000)
        const segundos = Math.floor((diffMs % 60000) / 1000)
        duracao = `${minutos}min ${segundos}s`
      }

      const status = senha.status === 'finalizado' ? 'Finalizado' 
        : senha.status === 'ausente' ? 'Ausente'
        : senha.status === 'atendendo' ? 'Atendendo'
        : senha.status === 'chamando' ? 'Chamando'
        : 'Aguardando'

      csv += `${senha.numeroCompleto},"${senha.servico.nome}",${categoria},${status},"${emissao}","${chamada}","${atendimento}","${finalizacao}",${duracao}\n`
    })

    // Download
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    const dataHora = new Date().toISOString().slice(0, 16).replace('T', '_').replace(/:/g, '-')
    link.setAttribute('href', url)
    link.setAttribute('download', `Relatorio_Guiche_${relatorio.guiche.numero}_${periodoTexto.replace(/\s/g, '_')}_${dataHora}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const calcularDuracaoAtendimento = (senha: Senha): string => {
    if (!senha.horaChamada && !senha.horaAtendimento) return '-'
    
    const inicio = senha.horaAtendimento 
      ? new Date(senha.horaAtendimento)
      : senha.horaChamada 
        ? new Date(senha.horaChamada)
        : null
    
    if (!inicio) return '-'
    
    const fim = senha.horaFinalizacao ? new Date(senha.horaFinalizacao) : new Date()
    const diffMs = fim.getTime() - inicio.getTime()
    const diffSegundos = Math.floor(diffMs / 1000)
    
    const horas = Math.floor(diffSegundos / 3600)
    const minutos = Math.floor((diffSegundos % 3600) / 60)
    const segundos = diffSegundos % 60
    
    // Formatar com horas, minutos e segundos
    if (horas > 0) {
      if (minutos === 0 && segundos === 0) return `${horas}h`
      if (segundos === 0) return `${horas}h ${minutos}min`
      return `${horas}h ${minutos}min ${segundos}s`
    }
    
    if (minutos > 0) {
      if (segundos === 0) return `${minutos}min`
      return `${minutos}min ${segundos}s`
    }
    
    return `${segundos}s`
  }

  const toggleServicoExpandido = (servicoId: string) => {
    setServicosExpandidos(prev => {
      const novo = new Set(prev)
      if (novo.has(servicoId)) {
        novo.delete(servicoId)
      } else {
        novo.add(servicoId)
      }
      return novo
    })
  }

  const formatarTempo = (minutos: number): string => {
    if (minutos < 1) return '< 1 min'
    if (minutos < 60) return `${Math.floor(minutos)} min`
    const horas = Math.floor(minutos / 60)
    const mins = Math.floor(minutos % 60)
    return `${horas}h${mins > 0 ? ` ${mins}min` : ''}`
  }

  const formatarTempoCompleto = (totalSegundos: number): string => {
    if (totalSegundos < 1) return '0s'
    
    const horas = Math.floor(totalSegundos / 3600)
    const minutos = Math.floor((totalSegundos % 3600) / 60)
    const segundos = Math.floor(totalSegundos % 60)
    
    if (horas > 0) {
      if (minutos === 0 && segundos === 0) return `${horas}h`
      if (segundos === 0) return `${horas}h ${minutos}min`
      return `${horas}h ${minutos}min ${segundos}s`
    }
    
    if (minutos > 0) {
      if (segundos === 0) return `${minutos}min`
      return `${minutos}min ${segundos}s`
    }
    
    return `${segundos}s`
  }

  const gerarRelatorioHTML = (): string => {
    const agora = new Date()
    const dataHora = agora.toLocaleString('pt-BR')

    // Calcular estatísticas adicionais
    const senhasPreferenciais = senhas.filter(s => s.prioridade)
    const senhasComuns = senhas.filter(s => !s.prioridade)
    const senhasAusentes = senhas.filter(s => s.status === 'ausente')
    
    // Estatísticas por serviço
    const porServico: Record<string, { emitidas: number, atendidas: number }> = {}
    senhas.forEach(senha => {
      const servicoNome = senha.servico.nome
      if (!porServico[servicoNome]) {
        porServico[servicoNome] = { emitidas: 0, atendidas: 0 }
      }
      porServico[servicoNome].emitidas++
      if (senha.status === 'finalizado') {
        porServico[servicoNome].atendidas++
      }
    })

    // Ranking de serviços (top 5)
    const rankingServicos = Object.entries(porServico)
      .filter(([nome]) => nome !== 'Atendimento Preferencial' && nome !== 'Atendimento Comum')
      .sort(([, a], [, b]) => b.emitidas - a.emitidas)
      .slice(0, 5)

    // Performance dos guichês
    const performanceGuiches = guiches
      .map(guiche => {
        const senhasDoGuiche = senhas.filter(s => s.guicheId === guiche.id)
        const atendidas = senhasDoGuiche.filter(s => s.status === 'finalizado').length
        return {
          guiche,
          atendidas
        }
      })
      .sort((a, b) => b.atendidas - a.atendidas)
      .slice(0, 5)

    // Calcular tempo máximo de espera
    let tempoMaxEspera = 0
    senhas.forEach(senha => {
      if (senha.status === 'aguardando') {
        const esperaMs = agora.getTime() - new Date(senha.horaEmissao).getTime()
        const esperaMin = Math.floor(esperaMs / 1000 / 60)
        if (esperaMin > tempoMaxEspera) tempoMaxEspera = esperaMin
      }
    })

    // Taxa de ausência
    const taxaAusencia = senhas.length > 0 
      ? ((senhasAusentes.length / senhas.length) * 100).toFixed(1)
      : '0.0'

    let html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Relatório Resumo - ${agora.toLocaleDateString('pt-BR')}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #008080; text-align: center; }
        h2 { color: #333; border-bottom: 2px solid #008080; padding-bottom: 5px; margin-top: 30px; }
        .header { text-align: center; margin-bottom: 30px; }
        .stats { display: flex; justify-content: space-around; margin: 20px 0; flex-wrap: wrap; }
        .stat-box { border: 2px solid #008080; border-radius: 8px; padding: 15px; text-align: center; min-width: 140px; margin: 10px; }
        .stat-value { font-size: 32px; font-weight: bold; color: #008080; }
        .stat-label { color: #666; margin-top: 5px; font-size: 13px; }
        .summary-section { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
        .summary-box { border: 1px solid #ddd; border-radius: 8px; padding: 15px; background-color: #f9f9f9; }
        .summary-box h3 { margin-top: 0; color: #008080; font-size: 16px; }
        .summary-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .summary-item:last-child { border-bottom: none; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; page-break-before: avoid; }
        @media print { button { display: none; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 Relatório Resumo de Atendimento por Senhas</h1>
        <p>Gerado em: ${dataHora}</p>
    </div>
`

    if (estatisticas) {
      html += `
    <h2>Resumo Geral</h2>
    <div class="stats">
        <div class="stat-box">
            <div class="stat-value">${estatisticas.totalEmitidas}</div>
            <div class="stat-label">Total Emitidas</div>
        </div>
        <div class="stat-box">
            <div class="stat-value">${estatisticas.totalAtendidas}</div>
            <div class="stat-label">Total Atendidas</div>
        </div>
        <div class="stat-box">
            <div class="stat-value">${formatarTempo(estatisticas.tempoMedioEspera)}</div>
            <div class="stat-label">Tempo Médio de Espera</div>
        </div>
        <div class="stat-box">
            <div class="stat-value">${senhasAusentes.length}</div>
            <div class="stat-label">Total Ausentes</div>
        </div>
        <div class="stat-box">
            <div class="stat-value" style="color: #ef4444;">${formatarTempo(tempoMaxEspera)}</div>
            <div class="stat-label">⏰ Tempo Máx. Espera</div>
        </div>
        <div class="stat-box">
            <div class="stat-value" style="color: #ef4444;">${taxaAusencia}%</div>
            <div class="stat-label">📊 Taxa de Ausência</div>
        </div>
    </div>

    <div class="summary-section">
        <div class="summary-box">
            <h3>⭐ Senhas Preferenciais</h3>
            <div class="summary-item">
                <span>Emitidas:</span>
                <strong>${senhasPreferenciais.length}</strong>
            </div>
            <div class="summary-item">
                <span>Atendidas:</span>
                <strong>${senhasPreferenciais.filter(s => s.status === 'finalizado').length}</strong>
            </div>
            <div class="summary-item">
                <span>Aguardando:</span>
                <strong>${senhasPreferenciais.filter(s => s.status === 'aguardando').length}</strong>
            </div>
            <div class="summary-item">
                <span>Ausentes:</span>
                <strong>${senhasPreferenciais.filter(s => s.status === 'ausente').length}</strong>
            </div>
        </div>

        <div class="summary-box">
            <h3>📋 Senhas Comuns</h3>
            <div class="summary-item">
                <span>Emitidas:</span>
                <strong>${senhasComuns.length}</strong>
            </div>
            <div class="summary-item">
                <span>Atendidas:</span>
                <strong>${senhasComuns.filter(s => s.status === 'finalizado').length}</strong>
            </div>
            <div class="summary-item">
                <span>Aguardando:</span>
                <strong>${senhasComuns.filter(s => s.status === 'aguardando').length}</strong>
            </div>
            <div class="summary-item">
                <span>Ausentes:</span>
                <strong>${senhasComuns.filter(s => s.status === 'ausente').length}</strong>
            </div>
        </div>
    </div>

    <div class="summary-section">
        <div class="summary-box">
            <h3>🏆 Ranking de Serviços (Top 5)</h3>
`

      rankingServicos.forEach(([nome, stats], index) => {
        const posicao = index + 1
        const medalha = posicao === 1 ? '🥇' : posicao === 2 ? '🥈' : posicao === 3 ? '🥉' : `${posicao}°`
        html += `
            <div class="summary-item">
                <span><strong>${medalha} ${nome}</strong></span>
                <span>${stats.emitidas} senhas (${stats.atendidas} atendidas)</span>
            </div>
`
      })

      html += `
        </div>

        <div class="summary-box">
            <h3>🏢 Performance dos Guichês (Top 5)</h3>
`

      performanceGuiches.forEach(({ guiche, atendidas }, index) => {
        const posicao = index + 1
        const medalha = posicao === 1 ? '🥇' : posicao === 2 ? '🥈' : posicao === 3 ? '🥉' : `${posicao}°`
        const totalSenhas = senhas.filter(s => s.guicheId === guiche.id).length
        html += `
            <div class="summary-item">
                <span><strong>${medalha} Guichê ${guiche.numero}</strong> - ${guiche.funcionarioNome || 'Não atribuído'}</span>
                <span>${atendidas} de ${totalSenhas}</span>
            </div>
`
      })

      html += `
        </div>
    </div>
`
    }

    html += `
    <div class="footer">
        <p><strong>Sistema de Atendimento por Senhas - Cartório</strong></p>
        <p>📄 Relatório Simplificado em PDF - Gerado automaticamente</p>
        <p><em>Para relatório completo com detalhamento por funcionário e todas as senhas, utilize a exportação "📊 Relatório Completo em Excel"</em></p>
    </div>

    <script>
        window.onload = function() {
            window.print();
        }
    </script>
</body>
</html>
`
    return html
  }

  const exportarPDF = () => {
    const html = gerarRelatorioHTML()
    const printWindow = window.open('', '', 'width=1024,height=768')
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
    }
  }

  const exportarExcel = () => {
    const agora = new Date()
    const dataHora = agora.toLocaleString('pt-BR')
    
    // Cabeçalho com informações gerais
    let csv = `RELATÓRIO COMPLETO DE SENHAS\n`
    csv += `Gerado em: ${dataHora}\n`
    csv += `\n`
    
    // Resumo geral
    if (estatisticas) {
      csv += `RESUMO GERAL\n`
      csv += `Total Emitidas;${estatisticas.totalEmitidas}\n`
      csv += `Total Atendidas;${estatisticas.totalAtendidas}\n`
      csv += `Tempo Médio de Espera;${formatarTempo(estatisticas.tempoMedioEspera)}\n`
      csv += `\n`
    }
    
    // Estatísticas por categoria
    const preferenciais = senhas.filter(s => s.prioridade)
    const comuns = senhas.filter(s => !s.prioridade)
    
    csv += `ESTATÍSTICAS POR CATEGORIA\n`
    csv += `Tipo;Emitidas;Atendidas;Aguardando;Ausentes\n`
    csv += `Preferencial;${preferenciais.length};${preferenciais.filter(s => s.status === 'finalizado').length};${preferenciais.filter(s => s.status === 'aguardando').length};${preferenciais.filter(s => s.status === 'ausente').length}\n`
    csv += `Comum;${comuns.length};${comuns.filter(s => s.status === 'finalizado').length};${comuns.filter(s => s.status === 'aguardando').length};${comuns.filter(s => s.status === 'ausente').length}\n`
    csv += `\n`
    
    // Estatísticas por serviço
    const porServico: Record<string, { emitidas: number, atendidas: number, preferenciais: number, comuns: number }> = {}
    senhas.forEach(senha => {
      const servicoNome = senha.servico.nome
      if (!porServico[servicoNome]) {
        porServico[servicoNome] = { emitidas: 0, atendidas: 0, preferenciais: 0, comuns: 0 }
      }
      porServico[servicoNome].emitidas++
      if (senha.status === 'finalizado') {
        porServico[servicoNome].atendidas++
      }
      if (senha.prioridade) {
        porServico[servicoNome].preferenciais++
      } else {
        porServico[servicoNome].comuns++
      }
    })
    
    csv += `ESTATÍSTICAS POR SERVIÇO\n`
    csv += `Serviço;Emitidas;Atendidas;Preferenciais;Comuns\n`
    Object.entries(porServico)
      .filter(([nome]) => nome !== 'Atendimento Preferencial' && nome !== 'Atendimento Comum')
      .sort(([, a], [, b]) => b.emitidas - a.emitidas)
      .forEach(([nome, stats]) => {
        csv += `${nome};${stats.emitidas};${stats.atendidas};${stats.preferenciais};${stats.comuns}\n`
      })
    csv += `\n`
    
    // Estatísticas por funcionário/guichê
    const porFuncionario: Record<string, {
      funcionario: string,
      guiche: string,
      totalChamadas: number,
      totalFinalizadas: number,
      totalAusentes: number,
      preferenciais: number,
      comuns: number,
      tempoTotalAtendimento: number,
      senhas: typeof senhas
    }> = {}
    
    guiches.forEach(guiche => {
      const senhasDoGuiche = senhas.filter(s => s.guicheId === guiche.id)
      const senhasChamadas = senhasDoGuiche.filter(s => s.status !== 'aguardando')
      const senhasFinalizadas = senhasDoGuiche.filter(s => s.status === 'finalizado')
      const senhasAusentes = senhasDoGuiche.filter(s => s.status === 'ausente')
      const senhasPreferenciaisAtendidas = senhasFinalizadas.filter(s => s.prioridade)
      const senhasComunsAtendidas = senhasFinalizadas.filter(s => !s.prioridade)
      
      // Calcular tempo total de atendimento
      let tempoTotalMs = 0
      senhasFinalizadas.forEach(senha => {
        if (senha.horaAtendimento && senha.horaFinalizacao) {
          tempoTotalMs += new Date(senha.horaFinalizacao).getTime() - new Date(senha.horaAtendimento).getTime()
        }
      })
      
      const chave = guiche.funcionarioNome || `Guichê ${guiche.numero} (Sem funcionário)`
      porFuncionario[chave] = {
        funcionario: guiche.funcionarioNome || 'Não atribuído',
        guiche: `${guiche.numero} - ${guiche.nome}`,
        totalChamadas: senhasChamadas.length,
        totalFinalizadas: senhasFinalizadas.length,
        totalAusentes: senhasAusentes.length,
        preferenciais: senhasPreferenciaisAtendidas.length,
        comuns: senhasComunsAtendidas.length,
        tempoTotalAtendimento: Math.floor(tempoTotalMs / 1000),
        senhas: senhasDoGuiche
      }
    })
    
    csv += `ESTATÍSTICAS POR FUNCIONÁRIO/GUICHÊ\n`
    csv += `Funcionário;Guichê;Chamadas;Finalizadas;Ausentes;Preferenciais;Comuns;Tempo Total Atendimento\n`
    Object.entries(porFuncionario)
      .sort(([, a], [, b]) => b.totalFinalizadas - a.totalFinalizadas)
      .forEach(([, stats]) => {
        const tempoFormatado = formatarTempoCompleto(stats.tempoTotalAtendimento)
        csv += `${stats.funcionario};${stats.guiche};${stats.totalChamadas};${stats.totalFinalizadas};${stats.totalAusentes};${stats.preferenciais};${stats.comuns};${tempoFormatado}\n`
      })
    csv += `\n`
    
    // Detalhamento por funcionário - Senhas atendidas
    csv += `DETALHAMENTO POR FUNCIONÁRIO\n`
    Object.entries(porFuncionario)
      .sort(([, a], [, b]) => b.totalFinalizadas - a.totalFinalizadas)
      .forEach(([, stats]) => {
        if (stats.senhas.length > 0) {
          csv += `\n${stats.funcionario} - ${stats.guiche}\n`
          csv += `Senha;Serviço;Categoria;Status;Emissão;Chamada;Atendimento;Finalização;Duração\n`
          
          stats.senhas.forEach(senha => {
            const categoria = senha.prioridade ? 'Preferencial' : 'Comum'
            const emissao = new Date(senha.horaEmissao).toLocaleString('pt-BR')
            const chamada = senha.horaChamada ? new Date(senha.horaChamada).toLocaleString('pt-BR') : '-'
            const atendimento = senha.horaAtendimento ? new Date(senha.horaAtendimento).toLocaleString('pt-BR') : '-'
            const finalizacao = senha.horaFinalizacao ? new Date(senha.horaFinalizacao).toLocaleString('pt-BR') : '-'
            
            let duracao = '-'
            if (senha.horaAtendimento && senha.horaFinalizacao) {
              const diffMs = new Date(senha.horaFinalizacao).getTime() - new Date(senha.horaAtendimento).getTime()
              const totalSegundos = Math.floor(diffMs / 1000)
              duracao = formatarTempoCompleto(totalSegundos)
            }
            
            const status = senha.status === 'finalizado' ? 'Finalizado' 
              : senha.status === 'ausente' ? 'Ausente'
              : senha.status === 'atendendo' ? 'Atendendo'
              : senha.status === 'chamando' ? 'Chamando'
              : 'Aguardando'
            
            csv += `${senha.numeroCompleto};"${senha.servico.nome}";${categoria};${status};"${emissao}";"${chamada}";"${atendimento}";"${finalizacao}";${duracao}\n`
          })
        }
      })
    csv += `\n`
    
    // Detalhamento completo de todas as senhas
    csv += `DETALHAMENTO COMPLETO DE SENHAS\n`
    csv += `Número;Número Completo;Prioridade;Serviço;Sigla Serviço;Status;Guichê;Número Guichê;Funcionário;Data Emissão;Hora Emissão;Data Chamada;Hora Chamada;Data Atendimento;Hora Atendimento;Data Finalização;Hora Finalização;Tempo Espera (min);Duração Atendimento (min)\n`
    
    senhas.forEach(senha => {
      const agora = new Date()
      const espera = senha.tempoEspera || Math.floor((agora.getTime() - new Date(senha.horaEmissao).getTime()) / 1000 / 60)
      
      let duracao = '-'
      if (senha.horaFinalizacao && (senha.horaAtendimento || senha.horaChamada)) {
        const inicio = senha.horaAtendimento 
          ? new Date(senha.horaAtendimento)
          : senha.horaChamada 
            ? new Date(senha.horaChamada)
            : null
        if (inicio) {
          const fim = new Date(senha.horaFinalizacao)
          const diffMs = fim.getTime() - inicio.getTime()
          duracao = Math.floor(diffMs / 1000 / 60).toString()
        }
      }
      
      const status = senha.status === 'aguardando' ? 'Aguardando' :
                     senha.status === 'chamando' ? 'Chamando' :
                     senha.status === 'atendendo' ? 'Atendendo' :
                     senha.status === 'finalizado' ? 'Finalizado' : 'Ausente'
      
      const guiche = guiches.find(g => g.id === senha.guicheId)
      
      const dataEmissao = new Date(senha.horaEmissao).toLocaleDateString('pt-BR')
      const horaEmissao = new Date(senha.horaEmissao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      const dataChamada = senha.horaChamada ? new Date(senha.horaChamada).toLocaleDateString('pt-BR') : '-'
      const horaChamada = senha.horaChamada ? new Date(senha.horaChamada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-'
      const dataAtendimento = senha.horaAtendimento ? new Date(senha.horaAtendimento).toLocaleDateString('pt-BR') : '-'
      const horaAtendimento = senha.horaAtendimento ? new Date(senha.horaAtendimento).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-'
      const dataFinalizacao = senha.horaFinalizacao ? new Date(senha.horaFinalizacao).toLocaleDateString('pt-BR') : '-'
      const horaFinalizacao = senha.horaFinalizacao ? new Date(senha.horaFinalizacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-'
      
      csv += `${senha.numero};${senha.numeroCompleto};${senha.prioridade ? 'Sim' : 'Não'};${senha.servico.nome};${senha.servico.sigla};${status};${guiche?.nome || '-'};${guiche?.numero || '-'};${guiche?.funcionarioNome || '-'};${dataEmissao};${horaEmissao};${dataChamada};${horaChamada};${dataAtendimento};${horaAtendimento};${dataFinalizacao};${horaFinalizacao};${espera};${duracao}\n`
    })

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `relatorio_completo_senhas_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <>
      <BasePage
        title="Painel Administrativo de Senhas"
        onClose={onClose}
        width="1200px"
        height="750px"
        resizable={false}
        headerColor={headerColor}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Abas */}
          <div style={{
            display: 'flex',
            borderBottom: `2px solid ${theme.border}`,
            backgroundColor: theme.surface
          }}>
            <button
              onClick={() => setAbaAtiva('monitoramento')}
              style={{
                flex: 1,
                padding: '16px',
                border: 'none',
                backgroundColor: abaAtiva === 'monitoramento' ? headerColor : theme.surface,
                color: abaAtiva === 'monitoramento' ? '#fff' : theme.text,
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
            >
              📊 Monitoramento
            </button>
            <button
              onClick={() => setAbaAtiva('estatisticas')}
              style={{
                flex: 1,
                padding: '16px',
                border: 'none',
                backgroundColor: abaAtiva === 'estatisticas' ? headerColor : theme.surface,
                color: abaAtiva === 'estatisticas' ? '#fff' : theme.text,
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
            >
              📈 Estatísticas
            </button>
            <button
              onClick={() => setAbaAtiva('guiches')}
              style={{
                flex: 1,
                padding: '16px',
                border: 'none',
                backgroundColor: abaAtiva === 'guiches' ? headerColor : theme.surface,
                color: abaAtiva === 'guiches' ? '#fff' : theme.text,
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
            >
              🏢 Guichês
            </button>
          </div>

          {/* Conteúdo */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', backgroundColor: theme.background }}>
            {/* ABA: Monitoramento */}
            {abaAtiva === 'monitoramento' && (
              <div>
                {/* Botões de Filtro por Status */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '24px' }}>
                  <button
                    onClick={() => setFiltroStatusMonitoramento('todos')}
                    style={{
                    padding: '20px',
                      backgroundColor: filtroStatusMonitoramento === 'todos' ? headerColor : theme.surface,
                      border: `2px solid ${filtroStatusMonitoramento === 'todos' ? headerColor : theme.border}`,
                      borderRadius: '12px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: filtroStatusMonitoramento === 'todos' ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
                    }}
                  >
                    <div style={{ fontSize: '36px', fontWeight: '700', color: filtroStatusMonitoramento === 'todos' ? '#fff' : theme.text, marginBottom: '8px' }}>
                      {senhas.length}
                    </div>
                    <div style={{ fontSize: '13px', color: filtroStatusMonitoramento === 'todos' ? '#fff' : theme.textSecondary, fontWeight: '600' }}>
                      Todas
                    </div>
                  </button>

                  <button
                    onClick={() => setFiltroStatusMonitoramento('aguardando')}
                    style={{
                      padding: '20px',
                      backgroundColor: filtroStatusMonitoramento === 'aguardando' ? '#3b82f6' : theme.surface,
                    border: `2px solid #3b82f6`,
                    borderRadius: '12px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: filtroStatusMonitoramento === 'aguardando' ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none'
                    }}
                  >
                    <div style={{ fontSize: '36px', fontWeight: '700', color: filtroStatusMonitoramento === 'aguardando' ? '#fff' : '#3b82f6', marginBottom: '8px' }}>
                      {senhas.filter(s => s.status === 'aguardando').length}
                    </div>
                    <div style={{ fontSize: '13px', color: filtroStatusMonitoramento === 'aguardando' ? '#fff' : theme.textSecondary, fontWeight: '600' }}>
                      Aguardando
                    </div>
                  </button>

                  <button
                    onClick={() => setFiltroStatusMonitoramento('atendendo')}
                    style={{
                    padding: '20px',
                      backgroundColor: filtroStatusMonitoramento === 'atendendo' ? '#f59e0b' : theme.surface,
                    border: `2px solid #f59e0b`,
                    borderRadius: '12px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: filtroStatusMonitoramento === 'atendendo' ? '0 4px 12px rgba(245, 158, 11, 0.3)' : 'none'
                    }}
                  >
                    <div style={{ fontSize: '36px', fontWeight: '700', color: filtroStatusMonitoramento === 'atendendo' ? '#fff' : '#f59e0b', marginBottom: '8px' }}>
                      {senhas.filter(s => s.status === 'atendendo').length}
                    </div>
                    <div style={{ fontSize: '13px', color: filtroStatusMonitoramento === 'atendendo' ? '#fff' : theme.textSecondary, fontWeight: '600' }}>
                      Em Atendimento
                    </div>
                  </button>

                  <button
                    onClick={() => setFiltroStatusMonitoramento('finalizado')}
                    style={{
                    padding: '20px',
                      backgroundColor: filtroStatusMonitoramento === 'finalizado' ? '#10b981' : theme.surface,
                    border: `2px solid #10b981`,
                    borderRadius: '12px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: filtroStatusMonitoramento === 'finalizado' ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
                    }}
                  >
                    <div style={{ fontSize: '36px', fontWeight: '700', color: filtroStatusMonitoramento === 'finalizado' ? '#fff' : '#10b981', marginBottom: '8px' }}>
                      {senhas.filter(s => s.status === 'finalizado').length}
                    </div>
                    <div style={{ fontSize: '13px', color: filtroStatusMonitoramento === 'finalizado' ? '#fff' : theme.textSecondary, fontWeight: '600' }}>
                      Finalizadas
                    </div>
                  </button>

                  <button
                    onClick={() => setFiltroStatusMonitoramento('ausente')}
                    style={{
                    padding: '20px',
                      backgroundColor: filtroStatusMonitoramento === 'ausente' ? '#ef4444' : theme.surface,
                    border: `2px solid #ef4444`,
                    borderRadius: '12px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: filtroStatusMonitoramento === 'ausente' ? '0 4px 12px rgba(239, 68, 68, 0.3)' : 'none'
                    }}
                  >
                    <div style={{ fontSize: '36px', fontWeight: '700', color: filtroStatusMonitoramento === 'ausente' ? '#fff' : '#ef4444', marginBottom: '8px' }}>
                      {senhas.filter(s => s.status === 'ausente').length}
                    </div>
                    <div style={{ fontSize: '13px', color: filtroStatusMonitoramento === 'ausente' ? '#fff' : theme.textSecondary, fontWeight: '600' }}>
                      Ausentes
                    </div>
                  </button>
                </div>

                {/* Tabela de Senhas Filtradas */}
                <div style={{
                  backgroundColor: theme.surface,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    padding: '16px',
                    backgroundColor: headerColor,
                    color: '#fff',
                    fontWeight: '700',
                    fontSize: '15px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>
                      🎫 {filtroStatusMonitoramento === 'todos' ? 'Todas as Senhas' : 
                          filtroStatusMonitoramento === 'aguardando' ? '⏳ Senhas Aguardando' :
                          filtroStatusMonitoramento === 'atendendo' ? '💼 Senhas em Atendimento' :
                          filtroStatusMonitoramento === 'finalizado' ? '✅ Senhas Finalizadas' : '❌ Senhas Ausentes'}
                    </span>
                    <span>
                      ({senhas.filter(s => filtroStatusMonitoramento === 'todos' || s.status === filtroStatusMonitoramento).length})
                    </span>
                  </div>
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ backgroundColor: theme.background, position: 'sticky', top: 0 }}>
                        <tr>
                          <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: theme.textSecondary }}>Senha</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: theme.textSecondary }}>Serviço</th>
                          <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: theme.textSecondary }}>Status</th>
                          <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: theme.textSecondary }}>Guichê</th>
                          <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: theme.textSecondary }}>Emissão</th>
                          <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: theme.textSecondary }}>Espera</th>
                          <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: theme.textSecondary }}>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {senhas
                          .filter(s => filtroStatusMonitoramento === 'todos' || s.status === filtroStatusMonitoramento)
                          .slice().reverse().map((senha) => (
                            <tr key={senha.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                              <td style={{ padding: '12px' }}>
                                <div style={{
                                  padding: '6px 12px',
                                  backgroundColor: senha.servico.cor,
                                  color: '#fff',
                                  borderRadius: '6px',
                                  display: 'inline-block',
                                  fontWeight: '700',
                                  fontFamily: 'monospace'
                                }}>
                                  {senha.numeroCompleto}
                                </div>
                              </td>
                              <td style={{ padding: '12px', fontSize: '13px', color: theme.text }}>
                                {senha.servico.nome}
                                {senha.prioridade && <span style={{ color: '#ef4444', marginLeft: '8px' }}>★</span>}
                              </td>
                              <td style={{ padding: '12px', textAlign: 'center' }}>
                                <span style={{
                                  padding: '4px 12px',
                                  borderRadius: '12px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  backgroundColor: 
                                    senha.status === 'aguardando' ? '#dbeafe' :
                                    senha.status === 'chamando' ? '#fef3c7' :
                                    senha.status === 'atendendo' ? '#fef3c7' :
                                    senha.status === 'finalizado' ? '#d1fae5' : '#fee2e2',
                                  color:
                                    senha.status === 'aguardando' ? '#1e40af' :
                                    senha.status === 'chamando' ? '#92400e' :
                                    senha.status === 'atendendo' ? '#92400e' :
                                    senha.status === 'finalizado' ? '#065f46' : '#7f1d1d'
                                }}>
                                  {senha.status === 'aguardando' ? '⏳ Aguardando' :
                                   senha.status === 'chamando' ? '📢 Chamando' :
                                   senha.status === 'atendendo' ? '💼 Atendendo' :
                                   senha.status === 'finalizado' ? '✅ Finalizado' : '❌ Ausente'}
                                </span>
                              </td>
                              <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: theme.text, fontWeight: '600' }}>
                                {senha.guicheNumero || '-'}
                              </td>
                              <td style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: theme.textSecondary }}>
                                {new Date(senha.horaEmissao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: theme.text }}>
                                <TempoEsperaReal 
                                  dataInicial={senha.horaEmissao}
                                  style={{ fontWeight: senha.status === 'aguardando' ? '600' : 'normal' }}
                                />
                              </td>
                              <td style={{ padding: '12px', textAlign: 'center' }}>
                                <button
                                  onClick={() => excluirSenha(senha)}
                                  style={{
                                    padding: '6px 12px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    backgroundColor: '#ef4444',
                                    color: '#fff'
                                  }}
                                  title="Excluir senha"
                                >
                                  🗑️ Excluir
                                </button>
                              </td>
                            </tr>
                        ))}
                      </tbody>
                    </table>
                    {senhas.filter(s => filtroStatusMonitoramento === 'todos' || s.status === filtroStatusMonitoramento).length === 0 && (
                      <div style={{ padding: '40px', textAlign: 'center', color: theme.textSecondary }}>
                        <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.3 }}>
                          {filtroStatusMonitoramento === 'aguardando' ? '⏳' :
                           filtroStatusMonitoramento === 'atendendo' ? '💼' :
                           filtroStatusMonitoramento === 'finalizado' ? '✅' :
                           filtroStatusMonitoramento === 'ausente' ? '❌' : '📭'}
                        </div>
                        <div>
                          {filtroStatusMonitoramento === 'todos' ? 'Nenhuma senha emitida hoje' :
                           filtroStatusMonitoramento === 'aguardando' ? 'Nenhuma senha aguardando' :
                           filtroStatusMonitoramento === 'atendendo' ? 'Nenhuma senha em atendimento' :
                           filtroStatusMonitoramento === 'finalizado' ? 'Nenhuma senha finalizada' :
                           'Nenhuma senha ausente'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ABA: Estatísticas */}
            {abaAtiva === 'estatisticas' && estatisticas && (
              <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: theme.text }}>
                    📊 Estatísticas e Desempenho
                </h3>
                  <div style={{ fontSize: '13px', color: theme.textSecondary, marginTop: '4px' }}>
                    📅 {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>

                {/* Cards Principais - Grid 6 colunas */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '20px' }}>
                  {/* Total Emitidas */}
                <div style={{
                  padding: '16px',
                  backgroundColor: theme.surface,
                    border: `2px solid #3b82f6`,
                    borderRadius: '10px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#3b82f6', marginBottom: '4px' }}>
                      {estatisticas.totalEmitidas}
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: theme.text }}>
                      Emitidas
                    </div>
                  </div>

                  {/* Total Atendidas */}
                  <div style={{
                    padding: '16px',
                    backgroundColor: theme.surface,
                    border: `2px solid #10b981`,
                    borderRadius: '10px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#10b981', marginBottom: '4px' }}>
                      {estatisticas.totalAtendidas}
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: theme.text }}>
                      Atendidas
                    </div>
                  </div>

                  {/* Aguardando */}
                  <div style={{
                    padding: '16px',
                    backgroundColor: theme.surface,
                    border: `2px solid #f59e0b`,
                    borderRadius: '10px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#f59e0b', marginBottom: '4px' }}>
                      {senhas.filter(s => s.status === 'aguardando').length}
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: theme.text }}>
                      Aguardando
                    </div>
                  </div>

                  {/* Ausentes */}
                  <div style={{
                    padding: '16px',
                    backgroundColor: theme.surface,
                    border: `2px solid #ef4444`,
                    borderRadius: '10px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#ef4444', marginBottom: '4px' }}>
                      {estatisticas.totalAusentes || 0}
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: theme.text }}>
                      Ausentes
                    </div>
                  </div>

                  {/* Taxa de Atendimento */}
                  <div style={{
                    padding: '16px',
                    backgroundColor: theme.surface,
                    border: `2px solid ${theme.border}`,
                    borderRadius: '10px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: headerColor, marginBottom: '4px' }}>
                      {estatisticas.totalEmitidas > 0 ? Math.round((estatisticas.totalAtendidas / estatisticas.totalEmitidas) * 100) : 0}%
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: theme.text }}>
                      Taxa Atend.
                    </div>
                  </div>

                  {/* Tempo Médio */}
                  <div style={{
                    padding: '16px',
                    backgroundColor: theme.surface,
                    border: `2px solid ${theme.border}`,
                    borderRadius: '10px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: theme.text, marginBottom: '4px' }}>
                      {formatarTempo(estatisticas.tempoMedioEspera)}
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: theme.text }}>
                      Tempo Médio
                    </div>
                  </div>
                </div>

                {/* Comparativo P vs C */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  {/* Preferenciais */}
                  <div 
                    onClick={() => setDropdownEstatisticasPreferencial(!dropdownEstatisticasPreferencial)}
                      style={{
                      padding: '20px',
                      backgroundColor: '#eff6ff',
                      border: `2px solid #3b82f6`,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      userSelect: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#dbeafe'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#eff6ff'
                    }}
                  >
                    {!dropdownEstatisticasPreferencial ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ fontSize: '24px' }}>⭐</div>
                        <div>
                          <div style={{ fontSize: '16px', fontWeight: '700', color: '#1e40af' }}>
                            SENHAS PREFERENCIAIS
                          </div>
                          <div style={{ fontSize: '11px', color: theme.textSecondary }}>
                            Prioridade no atendimento
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e40af', textAlign: 'center', marginBottom: '8px' }}>
                          ⭐ ESTATÍSTICAS PREFERENCIAIS
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '16px' }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '32px', fontWeight: '700', color: '#3b82f6' }}>
                              {senhas.filter(s => s.prioridade).length}
                            </div>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: '#1e40af' }}>Emitidas</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>
                              {senhas.filter(s => s.prioridade && s.status === 'finalizado').length}
                            </div>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: '#065f46' }}>Atendidas</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b' }}>
                              {senhas.filter(s => s.prioridade && s.status === 'aguardando').length}
                            </div>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: '#92400e' }}>Aguardando</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '32px', fontWeight: '700', color: '#ef4444' }}>
                              {senhas.filter(s => s.prioridade && s.status === 'ausente').length}
                            </div>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: '#991b1b' }}>Ausentes</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Comuns */}
                  <div 
                    onClick={() => setDropdownEstatisticasComum(!dropdownEstatisticasComum)}
                      style={{
                      padding: '20px',
                      backgroundColor: '#f0fdf4',
                      border: `2px solid #10b981`,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      userSelect: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#d1fae5'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f0fdf4'
                    }}
                  >
                    {!dropdownEstatisticasComum ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ fontSize: '24px' }}>📋</div>
                        <div>
                          <div style={{ fontSize: '16px', fontWeight: '700', color: '#065f46' }}>
                            SENHAS COMUNS
                          </div>
                          <div style={{ fontSize: '11px', color: theme.textSecondary }}>
                            Atendimento por ordem de chegada
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#065f46', textAlign: 'center', marginBottom: '8px' }}>
                          📋 ESTATÍSTICAS COMUNS
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '16px' }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>
                              {senhas.filter(s => !s.prioridade).length}
                            </div>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: '#065f46' }}>Emitidas</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>
                              {senhas.filter(s => !s.prioridade && s.status === 'finalizado').length}
                            </div>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: '#065f46' }}>Atendidas</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b' }}>
                              {senhas.filter(s => !s.prioridade && s.status === 'aguardando').length}
                            </div>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: '#92400e' }}>Aguardando</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '32px', fontWeight: '700', color: '#ef4444' }}>
                              {senhas.filter(s => !s.prioridade && s.status === 'ausente').length}
                            </div>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: '#991b1b' }}>Ausentes</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Por Serviço e Categoria */}
                <div style={{
                  padding: '20px',
                  backgroundColor: theme.surface,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '12px',
                  marginBottom: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: '600px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexShrink: 0 }}>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: theme.text }}>
                      📋 Por Serviço e Categoria
                    </h4>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={buscaServicoEstatisticas}
                        onChange={(e) => {
                          setBuscaServicoEstatisticas(e.target.value)
                          if (e.target.value) {
                            setFiltroServicoEstatisticas('todos')
                          }
                        }}
                        placeholder="🔍 Buscar serviço (nome ou sigla)..."
                        style={{
                        padding: '8px 12px',
                          fontSize: '13px',
                        border: `1px solid ${theme.border}`,
                          borderRadius: '6px',
                        backgroundColor: theme.background,
                        color: theme.text,
                          width: '280px',
                          outline: 'none'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = headerColor
                          e.currentTarget.style.boxShadow = `0 0 0 2px ${headerColor}20`
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = theme.border
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                      />
                      {buscaServicoEstatisticas && (
                  <button
                    onClick={() => {
                            setBuscaServicoEstatisticas('')
                            setFiltroServicoEstatisticas('todos')
                    }}
                    style={{
                            padding: '8px 12px',
                            fontSize: '12px',
                      border: 'none',
                      borderRadius: '6px',
                            backgroundColor: '#6b7280',
                            color: '#fff',
                      cursor: 'pointer',
                            fontWeight: '600'
                    }}
                  >
                          ✕ Limpar
                  </button>
                      )}
                </div>
                  </div>
                  <div style={{
                    flex: 1, 
                    overflowY: 'auto', 
                    overflowX: 'hidden',
                    paddingRight: '8px',
                    maxHeight: '500px'
                  }}>
                    {(() => {
                      const servicosFiltrados = Object.entries(estatisticas.porServico)
                        .filter(([servicoId]) => {
                          const servico = senhaService.getServicos().find(s => s.id === servicoId)
                          if (!servico) return false
                          
                          // Filtrar categorias P e C
                          if (servico.nome === 'Atendimento Preferencial' || servico.nome === 'Atendimento Comum') return false
                          
                          // Filtrar por busca de texto
                          if (buscaServicoEstatisticas) {
                            const busca = buscaServicoEstatisticas.toLowerCase().trim()
                            return servico.nome.toLowerCase().includes(busca) || 
                                   servico.sigla.toLowerCase().includes(busca)
                          }
                          
                          // Filtrar por seleção específica (se ainda usado)
                          if (filtroServicoEstatisticas !== 'todos') {
                            return servicoId === filtroServicoEstatisticas
                          }
                          
                          return true
                        })
                      
                      const totalItens = servicosFiltrados.length
                      const totalPaginas = Math.ceil(totalItens / itensPorPagina)
                      const inicioIndice = (paginaServicoCategoria - 1) * itensPorPagina
                      const fimIndice = inicioIndice + itensPorPagina
                      const servicosPagina = servicosFiltrados.slice(inicioIndice, fimIndice)
                      
                      return (
                        <>
                          {servicosPagina.map(([servicoId, stats]) => {
                    const servico = senhaService.getServicos().find(s => s.id === servicoId)
                    if (!servico) return null
                    
                    // Filtrar categorias P e C (não são serviços, são tipos de atendimento)
                    if (servico.nome === 'Atendimento Preferencial' || servico.nome === 'Atendimento Comum') return null

                    // Calcular estatísticas por tipo (Preferencial/Comum)
                    const senhasDoServico = senhas.filter(s => s.servico.id === servicoId)
                    const preferenciais = senhasDoServico.filter(s => s.prioridade)
                    const comuns = senhasDoServico.filter(s => !s.prioridade)

                    const statsP = {
                      emitidas: preferenciais.length,
                      atendidas: preferenciais.filter(s => s.status === 'finalizado').length
                    }

                    const statsC = {
                      emitidas: comuns.length,
                      atendidas: comuns.filter(s => s.status === 'finalizado').length
                    }

                    const estaExpandido = servicosExpandidos.has(servicoId)
                    
                    return (
                      <div
                        key={servicoId}
                            style={{
                              backgroundColor: theme.background,
                          border: `2px solid ${servico.cor}`,
                          borderRadius: '10px',
                          marginBottom: '12px',
                          minWidth: 0,
                          flexShrink: 0,
                          overflow: 'hidden'
                        }}
                      >
                        {/* Header do Serviço - Clicável */}
                        <div 
                          onClick={() => toggleServicoExpandido(servicoId)}
                          style={{
                              display: 'flex',
                              alignItems: 'center',
                            gap: '12px',
                            padding: '16px',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease',
                            userSelect: 'none'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = `${servico.cor}10`
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                            }}
                          >
                            <div style={{
                            width: '48px',
                            height: '48px',
                            backgroundColor: servico.cor,
                              color: '#fff',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                              fontWeight: '700',
                            flexShrink: 0
                            }}>
                            {servico.sigla}
                            </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '16px', fontWeight: '700', color: theme.text }}>
                              {servico.nome}
                              </div>
                            <div style={{ fontSize: '12px', color: theme.textSecondary, display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                              <span>{stats.emitidas} emitidas • {stats.atendidas} atendidas</span>
                              {statsP.emitidas > 0 && (
                            <span style={{
                                  padding: '2px 8px', 
                                  backgroundColor: '#eff6ff', 
                                  color: '#1e40af',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: '600'
                                }}>
                                  ⭐ {statsP.emitidas}P
                            </span>
                              )}
                              {statsC.emitidas > 0 && (
                                <span style={{ 
                                  padding: '2px 8px', 
                                  backgroundColor: '#f0fdf4', 
                                  color: '#065f46',
                                  borderRadius: '4px',
                                fontSize: '11px',
                                  fontWeight: '600'
                                }}>
                                  📋 {statsC.emitidas}C
                                </span>
                              )}
                          </div>
                        </div>
                          <div style={{
                            fontSize: '24px',
                            color: servico.cor,
                            transition: 'transform 0.2s ease',
                            transform: estaExpandido ? 'rotate(180deg)' : 'rotate(0deg)',
                            flexShrink: 0
                          }}>
                            ▼
                          </div>
                        </div>

                        {/* Detalhes Expandidos - Estatísticas por Tipo */}
                        {estaExpandido && (
                          <div style={{ 
                            padding: '0 16px 16px 16px',
                            borderTop: `1px solid ${theme.border}`,
                            paddingTop: '12px'
                          }}>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                              {/* Preferencial */}
                              {statsP.emitidas > 0 && (
                                <div style={{
                                  flex: '1 1 200px',
                                  minWidth: '200px',
                                  padding: '12px',
                                  backgroundColor: '#eff6ff',
                                  border: '1px solid #3b82f6',
                                  borderRadius: '8px'
                                }}>
                                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#1e40af', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    ⭐ PREFERENCIAL
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-around', gap: '8px' }}>
                                    <div style={{ textAlign: 'center' }}>
                                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#3b82f6' }}>
                                        {statsP.emitidas}
                                      </div>
                                      <div style={{ fontSize: '10px', color: theme.textSecondary }}>
                                        Emitidas
                                      </div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#10b981' }}>
                                        {statsP.atendidas}
                                      </div>
                                      <div style={{ fontSize: '10px', color: theme.textSecondary }}>
                                        Atendidas
                                      </div>
                                    </div>
                    </div>
                  </div>
                )}

                              {/* Comum */}
                              {statsC.emitidas > 0 && (
                  <div style={{
                                  flex: '1 1 200px',
                                  minWidth: '200px',
                                  padding: '12px',
                                  backgroundColor: '#f0fdf4',
                                  border: '1px solid #10b981',
                                  borderRadius: '8px'
                                }}>
                                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#065f46', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    📋 COMUM
                    </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-around', gap: '8px' }}>
                                    <div style={{ textAlign: 'center' }}>
                                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#10b981' }}>
                                        {statsC.emitidas}
                    </div>
                                      <div style={{ fontSize: '10px', color: theme.textSecondary }}>
                                        Emitidas
                  </div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#10b981' }}>
                                        {statsC.atendidas}
                                      </div>
                                      <div style={{ fontSize: '10px', color: theme.textSecondary }}>
                                        Atendidas
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Se não tem nenhum P ou C */}
                              {statsP.emitidas === 0 && statsC.emitidas === 0 && (
                  <div style={{
                                  flex: 1, 
                                  padding: '20px', 
                                  textAlign: 'center', 
                                  color: theme.textSecondary,
                                  fontSize: '13px'
                                }}>
                                  Nenhuma senha emitida para este serviço
                    </div>
                              )}
                    </div>
                  </div>
                        )}
                      </div>
                    )
                          })}
                          
                          {totalItens === 0 && (
                            <div style={{ padding: '40px', textAlign: 'center', color: theme.textSecondary }}>
                              <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.3 }}>
                                📋
                              </div>
                              <div style={{ fontSize: '14px' }}>
                                {buscaServicoEstatisticas 
                                  ? `Nenhum serviço encontrado para "${buscaServicoEstatisticas}"`
                                  : filtroServicoEstatisticas === 'todos' 
                                    ? 'Nenhum serviço específico cadastrado' 
                                    : 'Nenhuma senha emitida para este serviço'}
                              </div>
                            </div>
                          )}
                          
                          {totalPaginas > 1 && (
                  <div style={{
                              display: 'flex', 
                              justifyContent: 'center', 
                              alignItems: 'center', 
                              gap: '8px', 
                              marginTop: '16px',
                              padding: '12px',
                              borderTop: `1px solid ${theme.border}`,
                              flexShrink: 0
                            }}>
                              <button
                                onClick={() => setPaginaServicoCategoria(prev => Math.max(1, prev - 1))}
                                disabled={paginaServicoCategoria === 1}
                                style={{
                                  padding: '6px 12px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  border: `1px solid ${theme.border}`,
                                  borderRadius: '6px',
                                  cursor: paginaServicoCategoria === 1 ? 'not-allowed' : 'pointer',
                                  backgroundColor: paginaServicoCategoria === 1 ? theme.border : theme.background,
                                  color: paginaServicoCategoria === 1 ? theme.textSecondary : theme.text,
                                  opacity: paginaServicoCategoria === 1 ? 0.5 : 1,
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                  if (paginaServicoCategoria > 1) {
                                    e.currentTarget.style.backgroundColor = headerColor
                                    e.currentTarget.style.color = '#fff'
                                    e.currentTarget.style.borderColor = headerColor
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (paginaServicoCategoria > 1) {
                                    e.currentTarget.style.backgroundColor = theme.background
                                    e.currentTarget.style.color = theme.text
                                    e.currentTarget.style.borderColor = theme.border
                                  }
                                }}
                              >
                                ← Anterior
                              </button>
                              
                              <div style={{ 
                                display: 'flex', 
                                gap: '4px', 
                                alignItems: 'center',
                                fontSize: '12px',
                                color: theme.textSecondary
                              }}>
                                {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                                  let paginaNum: number
                                  if (totalPaginas <= 5) {
                                    paginaNum = i + 1
                                  } else if (paginaServicoCategoria <= 3) {
                                    paginaNum = i + 1
                                  } else if (paginaServicoCategoria >= totalPaginas - 2) {
                                    paginaNum = totalPaginas - 4 + i
                                  } else {
                                    paginaNum = paginaServicoCategoria - 2 + i
                                  }
                                  
                                  return (
                                    <button
                                      key={paginaNum}
                                      onClick={() => setPaginaServicoCategoria(paginaNum)}
                                      style={{
                                        padding: '6px 10px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        border: `1px solid ${paginaServicoCategoria === paginaNum ? headerColor : theme.border}`,
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        backgroundColor: paginaServicoCategoria === paginaNum ? headerColor : theme.background,
                                        color: paginaServicoCategoria === paginaNum ? '#fff' : theme.text,
                                        transition: 'all 0.2s ease',
                                        minWidth: '32px'
                                      }}
                                      onMouseEnter={(e) => {
                                        if (paginaServicoCategoria !== paginaNum) {
                                          e.currentTarget.style.backgroundColor = `${headerColor}20`
                                          e.currentTarget.style.borderColor = headerColor
                                        }
                                      }}
                                      onMouseLeave={(e) => {
                                        if (paginaServicoCategoria !== paginaNum) {
                                          e.currentTarget.style.backgroundColor = theme.background
                                          e.currentTarget.style.borderColor = theme.border
                                        }
                                      }}
                                    >
                                      {paginaNum}
                                    </button>
                                  )
                                })}
                    </div>
                              
                              <button
                                onClick={() => setPaginaServicoCategoria(prev => Math.min(totalPaginas, prev + 1))}
                                disabled={paginaServicoCategoria === totalPaginas}
                                style={{
                                  padding: '6px 12px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  border: `1px solid ${theme.border}`,
                                  borderRadius: '6px',
                                  cursor: paginaServicoCategoria === totalPaginas ? 'not-allowed' : 'pointer',
                                  backgroundColor: paginaServicoCategoria === totalPaginas ? theme.border : theme.background,
                                  color: paginaServicoCategoria === totalPaginas ? theme.textSecondary : theme.text,
                                  opacity: paginaServicoCategoria === totalPaginas ? 0.5 : 1,
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                  if (paginaServicoCategoria < totalPaginas) {
                                    e.currentTarget.style.backgroundColor = headerColor
                                    e.currentTarget.style.color = '#fff'
                                    e.currentTarget.style.borderColor = headerColor
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (paginaServicoCategoria < totalPaginas) {
                                    e.currentTarget.style.backgroundColor = theme.background
                                    e.currentTarget.style.color = theme.text
                                    e.currentTarget.style.borderColor = theme.border
                                  }
                                }}
                              >
                                Próxima →
                              </button>
                              
                              <div style={{ 
                                fontSize: '11px', 
                                color: theme.textSecondary,
                                marginLeft: '8px'
                              }}>
                                Página {paginaServicoCategoria} de {totalPaginas}
                    </div>
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </div>
                </div>

                {/* Ranking e Performance em 2 Colunas */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  {/* Ranking de Serviços */}
                <div style={{
                  padding: '20px',
                  backgroundColor: theme.surface,
                  border: `1px solid ${theme.border}`,
                    borderRadius: '12px'
                }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '700', color: theme.text }}>
                      🏆 Ranking de Serviços
                  </h4>
                    {Object.entries(estatisticas.porServico)
                      .filter(([servicoId]) => {
                        const servico = senhaService.getServicos().find(s => s.id === servicoId)
                        // Filtrar categorias P e C (não são serviços reais)
                        return servico && servico.nome !== 'Atendimento Preferencial' && servico.nome !== 'Atendimento Comum'
                      })
                      .sort(([, a], [, b]) => b.emitidas - a.emitidas)
                      .slice(0, 5)
                      .map(([servicoId, stats], index) => {
                    const servico = senhaService.getServicos().find(s => s.id === servicoId)
                    if (!servico) return null

                    return (
                      <div
                        key={servicoId}
                        style={{
                              padding: '12px',
                          backgroundColor: theme.background,
                              borderLeft: `4px solid ${servico.cor}`,
                              borderRadius: '6px',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                              gap: '12px'
                        }}
                      >
                        <div style={{
                              fontSize: '24px', 
                              fontWeight: '700',
                              color: index === 0 ? '#f59e0b' : index === 1 ? '#9ca3af' : index === 2 ? '#d97706' : theme.textSecondary,
                              minWidth: '30px'
                            }}>
                              {index + 1}º
                            </div>
                            <div style={{
                              width: '28px',
                              height: '28px',
                          backgroundColor: servico.cor,
                          color: '#fff',
                              borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                              fontSize: '12px',
                          fontWeight: '700'
                        }}>
                          {servico.sigla}
                        </div>
                        <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '13px', fontWeight: '600', color: theme.text }}>
                            {servico.nome}
                          </div>
                              <div style={{ fontSize: '11px', color: theme.textSecondary }}>
                                {stats.emitidas} senhas ({stats.atendidas} atendidas)
                        </div>
                            </div>
                            <div style={{ fontSize: '20px', fontWeight: '700', color: servico.cor }}>
                            {stats.emitidas}
                          </div>
                          </div>
                        )
                      })}
                    {Object.entries(estatisticas.porServico)
                      .filter(([servicoId]) => {
                        const servico = senhaService.getServicos().find(s => s.id === servicoId)
                        return servico && servico.nome !== 'Atendimento Preferencial' && servico.nome !== 'Atendimento Comum'
                      }).length === 0 && (
                      <div style={{ padding: '30px', textAlign: 'center', color: theme.textSecondary }}>
                        <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.3 }}>
                          🏆
                        </div>
                        <div style={{ fontSize: '13px' }}>
                          Nenhum serviço específico ainda
                          </div>
                          </div>
                    )}
                        </div>

                  {/* Performance dos Guichês */}
                  <div style={{
                    padding: '20px',
                    backgroundColor: theme.surface,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '12px'
                  }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '700', color: theme.text }}>
                      🏢 Performance dos Guichês
                    </h4>
                    {guiches.filter(g => g.ativo).slice(0, 5).map((guiche) => {
                      const senhasDoGuiche = senhas.filter(s => s.guicheId === guiche.id)
                      const atendidas = senhasDoGuiche.filter(s => s.status === 'finalizado').length
                      const total = senhasDoGuiche.filter(s => s.status === 'finalizado' || s.status === 'atendendo' || s.status === 'chamando').length
                      
                      return (
                        <div
                          key={guiche.id}
                          style={{
                            padding: '12px',
                            backgroundColor: theme.background,
                            border: `1px solid ${theme.border}`,
                            borderRadius: '6px',
                            marginBottom: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                          }}
                        >
                          <div style={{
                            width: '36px',
                            height: '36px',
                            backgroundColor: headerColor,
                            color: '#fff',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px',
                            fontWeight: '700'
                          }}>
                            {guiche.numero}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: theme.text }}>
                              {guiche.nome}
                          </div>
                          <div style={{ fontSize: '11px', color: theme.textSecondary }}>
                              {guiche.funcionarioNome || 'Sem funcionário'}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '18px', fontWeight: '700', color: '#10b981' }}>
                              {atendidas}
                            </div>
                            <div style={{ fontSize: '10px', color: theme.textSecondary }}>
                              de {total}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                    {guiches.filter(g => g.ativo).length === 0 && (
                      <div style={{ padding: '20px', textAlign: 'center', color: theme.textSecondary, fontSize: '13px' }}>
                        Nenhum guichê ativo
                      </div>
                    )}
                  </div>
                </div>

                {/* Informações Adicionais */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
                  <div style={{
                    padding: '16px',
                    backgroundColor: theme.surface,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '10px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '13px', color: theme.textSecondary, marginBottom: '8px' }}>
                      ⏱️ Tempo Máx. Espera
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444' }}>
                      {senhas.length > 0 ? formatarTempo(Math.max(...senhas.map(s => {
                        if (!s.tempoEspera && s.status === 'aguardando') {
                          return Math.floor((new Date().getTime() - new Date(s.horaEmissao).getTime()) / 1000 / 60)
                        }
                        return s.tempoEspera || 0
                      }))) : '0 min'}
                    </div>
                  </div>

                  <div style={{
                    padding: '16px',
                    backgroundColor: theme.surface,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '10px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '13px', color: theme.textSecondary, marginBottom: '8px' }}>
                      📊 Taxa de Ausência
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444' }}>
                      {estatisticas.totalEmitidas > 0 ? Math.round(((estatisticas.totalAusentes || 0) / estatisticas.totalEmitidas) * 100) : 0}%
                    </div>
                  </div>

                  <div style={{
                    padding: '16px',
                    backgroundColor: theme.surface,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '10px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '13px', color: theme.textSecondary, marginBottom: '8px' }}>
                      🏢 Guichês Ativos
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: headerColor }}>
                      {guiches.filter(g => g.ativo).length}
                    </div>
                  </div>

                  <div style={{
                    padding: '16px',
                    backgroundColor: theme.surface,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '10px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '13px', color: theme.textSecondary, marginBottom: '8px' }}>
                      🎯 Serviços Ativos
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: headerColor }}>
                      {senhaService.getServicos().filter(s => s.ativo).length}
                    </div>
                  </div>
                </div>

                {/* Botões de Exportação */}
                <div style={{ 
                  display: 'flex', 
                  gap: '12px', 
                  justifyContent: 'center',
                  marginTop: '24px',
                  flexWrap: 'wrap'
                }}>
                  <button
                    onClick={exportarPDF}
                    style={{
                      padding: '14px 28px',
                      fontSize: '14px',
                      fontWeight: '600',
                      border: `2px solid #8b5cf6`,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      backgroundColor: theme.background,
                      color: '#8b5cf6',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#8b5cf6'
                      e.currentTarget.style.color = '#fff'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = theme.background
                      e.currentTarget.style.color = '#8b5cf6'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                    title="Gerar relatório em PDF (impressão)"
                  >
                    📄 Relatório Simplificado em PDF
                  </button>
                  <button
                    onClick={exportarExcel}
                    style={{
                      padding: '14px 28px',
                      fontSize: '14px',
                      fontWeight: '600',
                      border: `2px solid #10b981`,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      backgroundColor: theme.background,
                      color: '#10b981',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#10b981'
                      e.currentTarget.style.color = '#fff'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = theme.background
                      e.currentTarget.style.color = '#10b981'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                    title="Exportar dados para Excel (CSV)"
                  >
                    📊 Relatório Completo em Excel
                  </button>
                </div>
              </div>
            )}

            {/* ABA: Guichês */}
            {abaAtiva === 'guiches' && (
              <div>
                {/* Campo de Busca */}
                <div style={{
                  padding: '16px',
                  backgroundColor: theme.surface,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '12px',
                  marginBottom: '20px'
                }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: theme.text, display: 'block', marginBottom: '8px' }}>
                    🔍 Buscar Guichê
                  </label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={buscaTexto}
                      onChange={(e) => setBuscaTexto(e.target.value)}
                      placeholder="Digite o número do guichê, número da senha (Ordem Sinal Público) ou nome do funcionário..."
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: `2px solid ${theme.border}`,
                        backgroundColor: theme.background,
                        color: theme.text,
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = headerColor
                        e.currentTarget.style.boxShadow = `0 0 0 3px ${headerColor}20`
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = theme.border
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    />
                    {buscaTexto && (
                      <button
                        onClick={() => setBuscaTexto('')}
                        style={{
                          padding: '12px 20px',
                          fontSize: '13px',
                          fontWeight: '600',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          backgroundColor: '#6b7280',
                          color: '#fff',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#4b5563'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#6b7280'
                        }}
                      >
                        ✕ Limpar
                      </button>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', color: theme.textSecondary, marginTop: '6px' }}>
                    💡 Busque por: número do guichê (ex: 1, 2, 3), número da senha (ex: P001, C042) ou nome do funcionário
                  </div>
                </div>

                {/* Lista de Guichês */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {guiches
                    .filter(guiche => {
                      if (!buscaTexto) return true
                      const buscaLower = buscaTexto.toLowerCase().trim()
                      
                      // Busca por número do guichê
                      if (guiche.numero.toString().includes(buscaLower)) return true
                      
                      // Busca por nome do funcionário
                      if (guiche.funcionarioNome?.toLowerCase().includes(buscaLower)) return true
                      
                      // Busca por nome do guichê
                      if (guiche.nome.toLowerCase().includes(buscaLower)) return true
                      
                      // Busca por número de senha (Ordem Sinal Público)
                      const senhasDoGuiche = senhas.filter(s => s.guicheId === guiche.id)
                      const encontrouSenha = senhasDoGuiche.some(s => 
                        s.numeroCompleto.toLowerCase().includes(buscaLower) ||
                        s.numero.toString().includes(buscaLower)
                      )
                      if (encontrouSenha) return true
                      
                      return false
                    })
                    .map((guiche) => {
                    const senhaAtual = senhas.find(s => 
                      s.guicheId === guiche.id && (s.status === 'chamando' || s.status === 'atendendo')
                    )
                    
                    const senhasDoGuiche = senhas.filter(s => s.guicheId === guiche.id)
                    const senhasAtendidas = senhasDoGuiche.filter(s => s.status === 'finalizado')
                    const senhasAusentes = senhasDoGuiche.filter(s => s.status === 'ausente')
                    const senhasChamadas = senhasDoGuiche.filter(s => s.status === 'finalizado' || s.status === 'atendendo' || s.status === 'chamando' || s.status === 'ausente')

                    const estaAtendendo = senhaAtual !== undefined
                    const mostrarDetalhes = guicheSelecionado === guiche.id

                    // Filtrar senhas chamadas
                    let senhasFiltradas = senhasChamadas
                    if (filtroTipoSenha === 'preferencial') {
                      senhasFiltradas = senhasFiltradas.filter(s => s.prioridade)
                    } else if (filtroTipoSenha === 'comum') {
                      senhasFiltradas = senhasFiltradas.filter(s => !s.prioridade)
                    }
                    if (filtroServico !== 'todos') {
                      senhasFiltradas = senhasFiltradas.filter(s => s.servico.id === filtroServico)
                    }

                    // Agrupar por serviço
                    const porServico: Record<string, Senha[]> = {}
                    senhasFiltradas.forEach(senha => {
                      const key = senha.servico.nome
                      if (!porServico[key]) porServico[key] = []
                      porServico[key].push(senha)
                    })

                    return (
                      <div
                        key={guiche.id}
                        style={{
                          padding: '20px',
                          backgroundColor: theme.surface,
                          border: `2px solid ${estaAtendendo ? '#f59e0b' : guiche.ativo ? headerColor : theme.border}`,
                          borderRadius: '12px',
                          opacity: guiche.ativo ? 1 : 0.6
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: mostrarDetalhes ? '16px' : '0' }}>
                          <div style={{
                            width: '70px',
                            height: '70px',
                            backgroundColor: estaAtendendo ? '#f59e0b' : guiche.ativo ? headerColor : theme.border,
                            color: '#fff',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '28px',
                            fontWeight: '700'
                          }}>
                            {guiche.numero}
                          </div>

                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '18px', fontWeight: '700', color: theme.text, marginBottom: '4px' }}>
                              {guiche.nome}
                            </div>
                            <div style={{ fontSize: '13px', color: theme.textSecondary, marginBottom: '2px' }}>
                              👤 {guiche.funcionarioNome || 'Não atribuído'}
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: '600', marginTop: '6px' }}>
                              {estaAtendendo ? (
                                <span style={{ color: '#f59e0b' }}>🔴 Atendendo</span>
                              ) : (
                                <span style={{ color: '#10b981' }}>🟢 Livre</span>
                              )}
                            </div>
                          </div>

                          <div style={{ minWidth: '150px', textAlign: 'center' }}>
                            {senhaAtual ? (
                              <>
                                <div style={{
                                  padding: '10px 20px',
                                  backgroundColor: senhaAtual.servico.cor,
                                  color: '#fff',
                                  borderRadius: '10px',
                                  fontSize: '22px',
                                  fontWeight: '700',
                                  fontFamily: 'monospace',
                                  marginBottom: '6px'
                                }}>
                                  {senhaAtual.numeroCompleto}
                                </div>
                                <div style={{ fontSize: '11px', color: theme.textSecondary }}>
                                  {senhaAtual.status === 'chamando' ? '📢 Chamando' : '💼 Atendendo'}
                                </div>
                              </>
                            ) : (
                              <div style={{ fontSize: '13px', color: theme.textSecondary }}>
                                -
                              </div>
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: '12px', minWidth: '350px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <div style={{ textAlign: 'center', minWidth: '70px', alignSelf: 'center' }}>
                              <div style={{ fontSize: '22px', fontWeight: '700', color: '#3b82f6' }}>
                                {senhasChamadas.length}
                              </div>
                              <div style={{ fontSize: '10px', color: theme.textSecondary }}>
                                Chamadas
                              </div>
                            </div>
                            <div style={{ textAlign: 'center', minWidth: '70px', alignSelf: 'center' }}>
                              <div style={{ fontSize: '22px', fontWeight: '700', color: '#10b981' }}>
                                {senhasAtendidas.length}
                              </div>
                              <div style={{ fontSize: '10px', color: theme.textSecondary }}>
                                Atendidas
                              </div>
                            </div>
                            <div style={{ textAlign: 'center', minWidth: '70px', alignSelf: 'center' }}>
                              <div style={{ fontSize: '22px', fontWeight: '700', color: '#ef4444' }}>
                                {senhasAusentes.length}
                              </div>
                              <div style={{ fontSize: '10px', color: theme.textSecondary }}>
                                Ausentes
                              </div>
                            </div>
                            <div style={{ 
                              textAlign: 'center', 
                              minWidth: '90px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px',
                              alignSelf: 'center'
                            }}>
                              {/* Ocioso em cima */}
                              <div style={{
                                padding: '6px 8px',
                                backgroundColor: theme.background,
                                borderRadius: '6px',
                                border: `1px solid ${theme.border}`
                              }}>
                                <div style={{ fontSize: '16px', fontWeight: '700', color: estaAtendendo ? '#10b981' : '#ef4444' }}>
                                  {calcularTempoOcioso(guiche)}
                                </div>
                                <div style={{ fontSize: '9px', color: theme.textSecondary, marginTop: '2px' }}>
                                  {estaAtendendo ? 'Atendendo' : 'Ocioso'}
                                </div>
                              </div>
                              {/* Tempo Total embaixo */}
                              <div style={{
                                padding: '6px 8px',
                                backgroundColor: theme.background,
                                borderRadius: '6px',
                                border: `1px solid ${theme.border}`
                              }}>
                                <div style={{ fontSize: '16px', fontWeight: '700', color: '#8b5cf6' }}>
                                  {calcularTempoTotalAtendimento(guiche)}
                                </div>
                                <div style={{ fontSize: '9px', color: theme.textSecondary, marginTop: '2px' }}>
                                  Tempo Total
                                </div>
                              </div>
                            </div>
                            {senhaAtual && (
                              <div style={{ textAlign: 'center', minWidth: '70px' }}>
                                <div style={{ fontSize: '18px', fontWeight: '700', color: '#f59e0b' }}>
                                  {calcularDuracaoAtendimento(senhaAtual)}
                                </div>
                                <div style={{ fontSize: '10px', color: theme.textSecondary }}>
                                  Duração
                                </div>
                              </div>
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                            <button
                              onClick={() => setMostrarSeletorSenha(guiche.id)}
                              disabled={estaAtendendo}
                              onTouchStart={(e) => {
                                if (!estaAtendendo) {
                                  e.currentTarget.style.transform = 'scale(0.95)'
                                }
                              }}
                              onTouchEnd={(e) => {
                                e.currentTarget.style.transform = 'scale(1)'
                              }}
                              style={{
                                padding: '10px 20px',
                                fontSize: '13px',
                                fontWeight: '600',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: estaAtendendo ? 'not-allowed' : 'pointer',
                                backgroundColor: estaAtendendo ? theme.border : '#10b981',
                                color: '#fff',
                                opacity: estaAtendendo ? 0.5 : 1,
                                transition: 'all 0.2s ease',
                                WebkitTapHighlightColor: 'transparent',
                                userSelect: 'none'
                              }}
                              title={estaAtendendo ? 'Finalize o atendimento antes de chamar nova senha' : 'Selecionar senha para chamar'}
                            >
                              📞 Chamar Senha
                            </button>
                            <button
                              onClick={() => setMostrarRelatorioGuiche(guiche.id)}
                              onTouchStart={(e) => {
                                e.currentTarget.style.backgroundColor = '#7c3aed'
                                e.currentTarget.style.transform = 'scale(0.95)'
                              }}
                              onTouchEnd={(e) => {
                                e.currentTarget.style.backgroundColor = '#8b5cf6'
                                e.currentTarget.style.transform = 'scale(1)'
                              }}
                              style={{
                                padding: '10px 20px',
                                fontSize: '13px',
                                fontWeight: '600',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                backgroundColor: '#8b5cf6',
                                color: '#fff',
                                transition: 'all 0.2s ease',
                                WebkitTapHighlightColor: 'transparent',
                                userSelect: 'none'
                              }}
                              title="Ver relatório do guichê"
                            >
                              📊 Relatório
                            </button>
                            <button
                              onClick={() => setGuicheSelecionado(mostrarDetalhes ? null : guiche.id)}
                              onTouchStart={(e) => {
                                e.currentTarget.style.backgroundColor = theme.border
                                e.currentTarget.style.transform = 'scale(0.95)'
                              }}
                              onTouchEnd={(e) => {
                                e.currentTarget.style.backgroundColor = theme.background
                                e.currentTarget.style.transform = 'scale(1)'
                              }}
                              style={{
                                padding: '8px 20px',
                                fontSize: '12px',
                                fontWeight: '600',
                                border: `1px solid ${theme.border}`,
                                borderRadius: '8px',
                                cursor: 'pointer',
                                backgroundColor: theme.background,
                                color: theme.text,
                                transition: 'all 0.2s ease',
                                WebkitTapHighlightColor: 'transparent',
                                userSelect: 'none'
                              }}
                            >
                              {mostrarDetalhes ? '▲ Ocultar' : '▼ Detalhes'}
                            </button>
                          </div>
                        </div>

                        {mostrarDetalhes && (
                          <div style={{
                            paddingTop: '16px',
                            borderTop: `1px solid ${theme.border}`,
                            marginTop: '16px'
                          }}>
                            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: theme.text }}>
                              📊 Senhas Chamadas ({senhasFiltradas.filter(s => {
                                if (filtroCategoriaDetalhes === 'preferencial') return s.prioridade
                                if (filtroCategoriaDetalhes === 'comum') return !s.prioridade
                                return true
                              }).length})
                              {filtroCategoriaDetalhes !== 'todas' && (
                                <span style={{ fontSize: '12px', fontWeight: '500', marginLeft: '6px', color: theme.textSecondary }}>
                                  - {filtroCategoriaDetalhes === 'preferencial' ? '⭐ Preferenciais' : '📋 Comuns'}
                                </span>
                              )}
                            </h4>

                            {/* Totais e Estatísticas */}
                            <div style={{ marginBottom: '16px' }}>
                              {/* Totais Gerais */}
                              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                                <div style={{
                                  flex: 1,
                                  padding: '14px',
                                  backgroundColor: theme.background,
                                  border: '2px solid #3b82f6',
                                  borderRadius: '10px',
                                  textAlign: 'center'
                                }}>
                                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6', marginBottom: '4px' }}>
                                    {senhasFiltradas.filter(s => s.prioridade).length}
                                  </div>
                                  <div style={{ fontSize: '12px', fontWeight: '600', color: theme.text }}>
                                    ⭐ Preferenciais
                                  </div>
                                  <div style={{ fontSize: '10px', color: theme.textSecondary, marginTop: '4px' }}>
                                    {senhasFiltradas.filter(s => s.prioridade && s.status === 'finalizado').length} finalizadas
                                  </div>
                                </div>
                                <div style={{
                                  flex: 1,
                                  padding: '14px',
                                  backgroundColor: theme.background,
                                  border: '2px solid #10b981',
                                  borderRadius: '10px',
                                  textAlign: 'center'
                                }}>
                                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981', marginBottom: '4px' }}>
                                    {senhasFiltradas.filter(s => !s.prioridade).length}
                                  </div>
                                  <div style={{ fontSize: '12px', fontWeight: '600', color: theme.text }}>
                                    📋 Comuns
                                  </div>
                                  <div style={{ fontSize: '10px', color: theme.textSecondary, marginTop: '4px' }}>
                                    {senhasFiltradas.filter(s => !s.prioridade && s.status === 'finalizado').length} finalizadas
                                  </div>
                                </div>
                                <div style={{
                                  flex: 1,
                                  padding: '14px',
                                  backgroundColor: theme.background,
                                  border: `2px solid ${headerColor}`,
                                  borderRadius: '10px',
                                  textAlign: 'center'
                                }}>
                                  <div style={{ fontSize: '24px', fontWeight: '700', color: headerColor, marginBottom: '4px' }}>
                                    {senhasFiltradas.length}
                                  </div>
                                  <div style={{ fontSize: '12px', fontWeight: '600', color: theme.text }}>
                                    📊 Total
                                  </div>
                                  <div style={{ fontSize: '10px', color: theme.textSecondary, marginTop: '4px' }}>
                                    {senhasFiltradas.filter(s => s.status === 'finalizado').length} finalizadas
                                  </div>
                                </div>
                              </div>

                              {/* Por Serviço e Categoria */}
                              {Object.keys(porServico).length > 0 && (
                                <div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <h5 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: theme.text }}>
                                      📋 Por Serviço e Categoria:
                                    </h5>
                                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                      <button
                                        onClick={() => setFiltroCategoriaDetalhes('todas')}
                                        style={{
                                          padding: '6px 12px',
                                          fontSize: '11px',
                                          fontWeight: '600',
                                          border: `2px solid ${filtroCategoriaDetalhes === 'todas' ? headerColor : theme.border}`,
                                          borderRadius: '6px',
                                          cursor: 'pointer',
                                          backgroundColor: filtroCategoriaDetalhes === 'todas' ? headerColor : theme.background,
                                          color: filtroCategoriaDetalhes === 'todas' ? '#fff' : theme.text,
                                          transition: 'all 0.2s ease',
                                          height: '28px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center'
                                        }}
                                      >
                                        Todas
                                      </button>
                                      <button
                                        onClick={() => setFiltroCategoriaDetalhes('preferencial')}
                                        style={{
                                          padding: '6px 12px',
                                          fontSize: '11px',
                                          fontWeight: '600',
                                          border: `2px solid ${filtroCategoriaDetalhes === 'preferencial' ? '#3b82f6' : theme.border}`,
                                          borderRadius: '6px',
                                          cursor: 'pointer',
                                          backgroundColor: filtroCategoriaDetalhes === 'preferencial' ? '#3b82f6' : theme.background,
                                          color: filtroCategoriaDetalhes === 'preferencial' ? '#fff' : theme.text,
                                          transition: 'all 0.2s ease',
                                          height: '28px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center'
                                        }}
                                      >
                                        ⭐ P
                                      </button>
                                      <button
                                        onClick={() => setFiltroCategoriaDetalhes('comum')}
                                        style={{
                                          padding: '6px 12px',
                                          fontSize: '11px',
                                          fontWeight: '600',
                                          border: `2px solid ${filtroCategoriaDetalhes === 'comum' ? '#10b981' : theme.border}`,
                                          borderRadius: '6px',
                                          cursor: 'pointer',
                                          backgroundColor: filtroCategoriaDetalhes === 'comum' ? '#10b981' : theme.background,
                                          color: filtroCategoriaDetalhes === 'comum' ? '#fff' : theme.text,
                                          transition: 'all 0.2s ease',
                                          height: '28px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center'
                                        }}
                                      >
                                        📋 C
                                      </button>
                                    </div>
                                  </div>
                                  {Object.entries(porServico).map(([servico, senhasDoServico]) => {
                                    const servicoObj = senhaService.getServicos().find(s => s.nome === servico)
                                    const preferenciais = senhasDoServico.filter(s => s.prioridade)
                                    const comuns = senhasDoServico.filter(s => !s.prioridade)
                                    const preferenciaisFinalizadas = preferenciais.filter(s => s.status === 'finalizado')
                                    const comunsFinalizadas = comuns.filter(s => s.status === 'finalizado')
                                    
                                    // Aplicar filtro de categoria
                                    if (filtroCategoriaDetalhes === 'preferencial' && preferenciais.length === 0) return null
                                    if (filtroCategoriaDetalhes === 'comum' && comuns.length === 0) return null
                                    
                                    return (
                                      <div
                                        key={servico}
                                        style={{
                                          padding: '12px',
                                          backgroundColor: theme.background,
                                          border: `2px solid ${servicoObj?.cor || theme.border}`,
                                          borderRadius: '8px',
                                          marginBottom: '10px'
                                        }}
                                      >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                                          <div style={{ fontSize: '13px', fontWeight: '700', color: theme.text, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{
                                              width: '24px',
                                              height: '24px',
                                              backgroundColor: servicoObj?.cor || theme.border,
                                              color: '#fff',
                                              borderRadius: '4px',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              fontSize: '11px',
                                              fontWeight: '700'
                                            }}>
                                              {servicoObj?.sigla || '?'}
                                            </span>
                                            {servico}
                                          </div>
                                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            {preferenciais.length > 0 && (
                                              <span style={{ 
                                                padding: '3px 8px', 
                                                backgroundColor: '#eff6ff', 
                                                color: '#1e40af',
                                                borderRadius: '4px',
                                                fontSize: '11px',
                                                fontWeight: '700'
                                              }}>
                                                ⭐ {preferenciais.length}P
                                              </span>
                                            )}
                                            {comuns.length > 0 && (
                                              <span style={{ 
                                                padding: '3px 8px', 
                                                backgroundColor: '#f0fdf4', 
                                                color: '#065f46',
                                                borderRadius: '4px',
                                                fontSize: '11px',
                                                fontWeight: '700'
                                              }}>
                                                📋 {comuns.length}C
                                              </span>
                                            )}
                                            <span style={{ fontSize: '13px', fontWeight: '700', color: theme.text }}>
                                              {senhasDoServico.length} total
                                            </span>
                                          </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'nowrap' }}>
                                          {filtroCategoriaDetalhes === 'todas' ? (
                                            <>
                                              {preferenciais.length > 0 && (
                                                <div style={{
                                                  flex: 1,
                                                  padding: '8px',
                                                  backgroundColor: '#eff6ff',
                                                  border: '2px solid #3b82f6',
                                                  borderRadius: '6px',
                                                  minWidth: '120px'
                                                }}>
                                                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#1e40af', marginBottom: '4px' }}>
                                                    ⭐ PREFERENCIAL
                                                  </div>
                                                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#3b82f6' }}>
                                                    {preferenciais.length}
                                                  </div>
                                                  <div style={{ fontSize: '9px', color: theme.textSecondary }}>
                                                    {preferenciaisFinalizadas.length} finalizadas
                                                  </div>
                                                </div>
                                              )}
                                              {comuns.length > 0 && (
                                                <div style={{
                                                  flex: 1,
                                                  padding: '8px',
                                                  backgroundColor: '#f0fdf4',
                                                  border: '2px solid #10b981',
                                                  borderRadius: '6px',
                                                  minWidth: '120px'
                                                }}>
                                                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#065f46', marginBottom: '4px' }}>
                                                    📋 COMUM
                                                  </div>
                                                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#10b981' }}>
                                                    {comuns.length}
                                                  </div>
                                                  <div style={{ fontSize: '9px', color: theme.textSecondary }}>
                                                    {comunsFinalizadas.length} finalizadas
                                                  </div>
                                                </div>
                                              )}
                                            </>
                                          ) : filtroCategoriaDetalhes === 'preferencial' && preferenciais.length > 0 ? (
                                            <div style={{
                                              flex: 1,
                                              padding: '8px',
                                              backgroundColor: '#eff6ff',
                                              border: '2px solid #3b82f6',
                                              borderRadius: '6px'
                                            }}>
                                              <div style={{ fontSize: '11px', fontWeight: '600', color: '#1e40af', marginBottom: '4px' }}>
                                                ⭐ PREFERENCIAL
                                              </div>
                                              <div style={{ fontSize: '16px', fontWeight: '700', color: '#3b82f6' }}>
                                                {preferenciais.length}
                                              </div>
                                              <div style={{ fontSize: '9px', color: theme.textSecondary }}>
                                                {preferenciaisFinalizadas.length} finalizadas
                                              </div>
                                            </div>
                                          ) : filtroCategoriaDetalhes === 'comum' && comuns.length > 0 ? (
                                            <div style={{
                                              flex: 1,
                                              padding: '8px',
                                              backgroundColor: '#f0fdf4',
                                              border: '2px solid #10b981',
                                              borderRadius: '6px'
                                            }}>
                                              <div style={{ fontSize: '11px', fontWeight: '600', color: '#065f46', marginBottom: '4px' }}>
                                                📋 COMUM
                                              </div>
                                              <div style={{ fontSize: '16px', fontWeight: '700', color: '#10b981' }}>
                                                {comuns.length}
                                              </div>
                                              <div style={{ fontSize: '9px', color: theme.textSecondary }}>
                                                {comunsFinalizadas.length} finalizadas
                                              </div>
                                            </div>
                                          ) : null}
                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                            </div>

                            {senhasFiltradas.length > 0 ? (
                              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                  {senhasFiltradas
                                    .filter(s => {
                                      if (filtroCategoriaDetalhes === 'preferencial') return s.prioridade
                                      if (filtroCategoriaDetalhes === 'comum') return !s.prioridade
                                      return true
                                    })
                                    .slice().reverse().slice(0, 10).map((senha) => (
                                    <div
                                      key={senha.id}
                                      style={{
                                        padding: '10px 12px',
                                        backgroundColor: theme.background,
                                        border: `1px solid ${senha.servico.cor}`,
                                        borderRadius: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                      }}
                                    >
                                      <div style={{
                                        padding: '4px 10px',
                                        backgroundColor: senha.servico.cor,
                                        color: '#fff',
                                        borderRadius: '4px',
                                        fontWeight: '700',
                                        fontFamily: 'monospace',
                                        fontSize: '13px'
                                      }}>
                                        {senha.numeroCompleto}
                                      </div>
                                      <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '12px', fontWeight: '600', color: theme.text }}>
                                          {senha.servico.nome}
                                          {senha.prioridade && <span style={{ color: '#ef4444', marginLeft: '6px' }}>★</span>}
                                        </div>
                                        <div style={{ fontSize: '10px', color: theme.textSecondary, marginTop: '2px' }}>
                                          {senha.status === 'finalizado' ? (
                                            <>
                                              Iniciou: {senha.horaAtendimento 
                                                ? new Date(senha.horaAtendimento).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                                                : senha.horaChamada 
                                                  ? new Date(senha.horaChamada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                                                  : '-'
                                              } • Finalizado: {senha.horaFinalizacao 
                                                ? new Date(senha.horaFinalizacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                                                : '-'
                                              }
                                            </>
                                          ) : senha.status === 'ausente' ? (
                                            <>
                                              ❌ Ausente • Iniciou: {senha.horaAtendimento 
                                                ? new Date(senha.horaAtendimento).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                                                : senha.horaChamada 
                                                  ? new Date(senha.horaChamada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                                                  : '-'
                                              }
                                            </>
                                          ) : (
                                            <>
                                              Iniciou: {senha.horaAtendimento 
                                                ? new Date(senha.horaAtendimento).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                                                : senha.horaChamada 
                                                  ? new Date(senha.horaChamada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                                                  : '-'
                                              }
                                            </>
                                          )}
                                        </div>
                                      </div>
                                      <div style={{ fontSize: '11px', color: theme.textSecondary, textAlign: 'right', minWidth: '60px' }}>
                                        <div style={{ fontWeight: '600', color: theme.text }}>
                                          {new Date(senha.horaChamada || senha.horaEmissao).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                        </div>
                                      </div>
                                      <span style={{
                                        padding: '3px 8px',
                                        borderRadius: '8px',
                                        fontSize: '10px',
                                        fontWeight: '600',
                                        backgroundColor: senha.status === 'finalizado' ? '#d1fae5' : senha.status === 'ausente' ? '#fee2e2' : '#fef3c7',
                                        color: senha.status === 'finalizado' ? '#065f46' : senha.status === 'ausente' ? '#991b1b' : '#92400e'
                                      }}>
                                        {senha.status === 'finalizado' ? '✅' : senha.status === 'ausente' ? '❌' : '💼'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                {senhasFiltradas.filter(s => {
                                  if (filtroCategoriaDetalhes === 'preferencial') return s.prioridade
                                  if (filtroCategoriaDetalhes === 'comum') return !s.prioridade
                                  return true
                                }).length > 10 && (
                                  <div style={{ textAlign: 'center', padding: '8px', fontSize: '11px', color: theme.textSecondary }}>
                                    Mostrando últimas 10 de {senhasFiltradas.filter(s => {
                                      if (filtroCategoriaDetalhes === 'preferencial') return s.prioridade
                                      if (filtroCategoriaDetalhes === 'comum') return !s.prioridade
                                      return true
                                    }).length} senhas
                                    {filtroCategoriaDetalhes !== 'todas' && (
                                      <span style={{ fontWeight: '600', marginLeft: '4px' }}>
                                        ({filtroCategoriaDetalhes === 'preferencial' ? 'Preferenciais' : 'Comuns'})
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div style={{ padding: '20px', textAlign: 'center', color: theme.textSecondary, fontSize: '12px' }}>
                                {filtroTipoSenha !== 'todas' || filtroServico !== 'todos' ? 
                                  'Nenhuma senha encontrada com os filtros selecionados' :
                                  'Nenhuma senha chamada ainda'
                                }
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {guiches.length === 0 && (
                    <div style={{ padding: '60px', textAlign: 'center', color: theme.textSecondary }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>
                        🏢
                      </div>
                      <div style={{ fontSize: '16px' }}>
                        Nenhum guichê cadastrado
                      </div>
                      <div style={{ fontSize: '13px', marginTop: '8px' }}>
                        Os guichês são criados automaticamente quando funcionários fazem login
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal de Seleção de Senha */}
                {mostrarSeletorSenha && (
                  <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                  }}>
                    <div style={{
                      backgroundColor: theme.surface,
                      borderRadius: '16px',
                      padding: '24px',
                      maxWidth: '900px',
                      width: '100%',
                      maxHeight: '80vh',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
                    }}>
                      {/* Header */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px',
                        paddingBottom: '16px',
                        borderBottom: `2px solid ${headerColor}`,
                        flexShrink: 0
                      }}>
                        <h3 style={{ margin: 0, fontSize: '20px', color: theme.text, fontWeight: '700' }}>
                          📋 Selecionar Senha para Chamar
                        </h3>
                        <button
                          onClick={() => setMostrarSeletorSenha(null)}
                          onTouchStart={(e) => {
                            e.currentTarget.style.color = theme.text
                            e.currentTarget.style.transform = 'scale(0.9)'
                          }}
                          onTouchEnd={(e) => {
                            e.currentTarget.style.color = theme.textSecondary
                            e.currentTarget.style.transform = 'scale(1)'
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '28px',
                            cursor: 'pointer',
                            color: theme.textSecondary,
                            lineHeight: 1,
                            transition: 'all 0.2s ease',
                            WebkitTapHighlightColor: 'transparent'
                          }}
                        >
                          ✕
                        </button>
                      </div>

                      {/* Lista de Senhas */}
                      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
                        {senhas.filter(s => s.status === 'aguardando').length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {senhas
                              .filter(s => s.status === 'aguardando')
                              .filter(s => {
                                if (filtroTipoSenha === 'preferencial') return s.prioridade
                                if (filtroTipoSenha === 'comum') return !s.prioridade
                                return true
                              })
                              .filter(s => filtroServico === 'todos' || s.servico.id === filtroServico)
                              .map((senha) => (
                                <button
                                  key={senha.id}
                                  onClick={() => {
                                    chamarSenhaPeloAdmin(mostrarSeletorSenha, senha.id)
                                  }}
                                  onTouchStart={(e) => {
                                    e.currentTarget.style.backgroundColor = `${senha.servico.cor}25`
                                    e.currentTarget.style.transform = 'scale(0.98)'
                                  }}
                                  onTouchEnd={(e) => {
                                    e.currentTarget.style.backgroundColor = theme.background
                                    e.currentTarget.style.transform = 'scale(1)'
                                  }}
                                  style={{
                                    padding: '16px',
                                    backgroundColor: theme.background,
                                    border: `2px solid ${senha.servico.cor}`,
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    transition: 'all 0.2s ease',
                                    textAlign: 'left',
                                    WebkitTapHighlightColor: 'transparent',
                                    userSelect: 'none'
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!('ontouchstart' in window)) {
                                      e.currentTarget.style.backgroundColor = `${senha.servico.cor}15`
                                      e.currentTarget.style.transform = 'translateX(8px)'
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!('ontouchstart' in window)) {
                                      e.currentTarget.style.backgroundColor = theme.background
                                      e.currentTarget.style.transform = 'translateX(0)'
                                    }
                                  }}
                                >
                                  <div style={{
                                    padding: '8px 16px',
                                    backgroundColor: senha.servico.cor,
                                    color: '#fff',
                                    borderRadius: '8px',
                                    fontWeight: '700',
                                    fontFamily: 'monospace',
                                    fontSize: '20px',
                                    minWidth: '80px',
                                    textAlign: 'center'
                                  }}>
                                    {senha.numeroCompleto}
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '16px', fontWeight: '600', color: theme.text, marginBottom: '4px' }}>
                                      {senha.servico.nome}
                                      {senha.prioridade && <span style={{ color: '#f59e0b', marginLeft: '8px' }}>⭐ Preferencial</span>}
                                    </div>
                                    <div style={{ fontSize: '13px', color: theme.textSecondary }}>
                                      Emitida: {new Date(senha.horaEmissao).toLocaleTimeString('pt-BR')} • Aguardando há{' '}
                                      <TempoEsperaReal dataInicial={senha.horaEmissao} style={{ fontWeight: '600' }} />
                                    </div>
                                  </div>
                                  <div style={{
                                    fontSize: '24px',
                                    color: headerColor
                                  }}>
                                    →
                                  </div>
                                </button>
                              ))}
                          </div>
                        ) : (
                          <div style={{ padding: '60px', textAlign: 'center', color: theme.textSecondary }}>
                            <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.3 }}>📭</div>
                            <div style={{ fontSize: '16px' }}>Nenhuma senha aguardando</div>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div style={{
                        marginTop: '16px',
                        paddingTop: '16px',
                        borderTop: `1px solid ${theme.border}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexShrink: 0
                      }}>
                        <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                          {senhas.filter(s => s.status === 'aguardando').length} senha(s) aguardando
                        </div>
                        <button
                          onClick={() => setMostrarSeletorSenha(null)}
                          onTouchStart={(e) => {
                            e.currentTarget.style.backgroundColor = '#4b5563'
                            e.currentTarget.style.transform = 'scale(0.95)'
                          }}
                          onTouchEnd={(e) => {
                            e.currentTarget.style.backgroundColor = '#6b7280'
                            e.currentTarget.style.transform = 'scale(1)'
                          }}
                          style={{
                            padding: '10px 24px',
                            fontSize: '14px',
                            fontWeight: '600',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            backgroundColor: '#6b7280',
                            color: '#fff',
                            transition: 'all 0.2s ease',
                            WebkitTapHighlightColor: 'transparent',
                            userSelect: 'none'
                          }}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Rodapé */}
          <div style={{
            padding: '16px',
            borderTop: `2px solid ${theme.border}`,
            backgroundColor: theme.surface,
            display: 'flex',
            justifyContent: 'flex-end'
          }}>
              <button
              onClick={onClose}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                backgroundColor: '#6c757d',
                  color: '#fff'
                }}
              >
              🚪 Fechar
              </button>
          </div>
        </div>
        
        {/* Modal de Relatório do Guichê */}
        {mostrarRelatorioGuiche && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
          }} onClick={() => setMostrarRelatorioGuiche(null)}>
            <div style={{
              backgroundColor: theme.surface,
              borderRadius: '12px',
              width: '600px',
              maxHeight: '80vh',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
            }} onClick={(e) => e.stopPropagation()}>
              {/* Header Modal */}
              <div style={{
                padding: '20px',
                backgroundColor: headerColor,
                color: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: `2px solid ${theme.border}`
              }}>
                <h3 style={{ margin: 0, fontSize: '18px' }}>
                  📊 Relatório do Guichê {guiches.find(g => g.id === mostrarRelatorioGuiche)?.numero}
                </h3>
              <button
                  onClick={() => setMostrarRelatorioGuiche(null)}
                style={{
                    background: 'none',
                    border: 'none',
                    color: '#fff',
                    fontSize: '24px',
                    cursor: 'pointer',
                    padding: '0',
                    lineHeight: '1'
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Corpo Modal */}
              <div style={{ padding: '20px', maxHeight: '60vh', overflowY: 'auto' }}>
                {/* Filtros de Período */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '12px', color: theme.textSecondary, display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    Período do Relatório (dias)
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      onClick={() => setDiasRelatorioGuiche(1)}
                      style={{
                        padding: '10px 16px',
                        fontSize: '13px',
                        fontWeight: '600',
                        border: `2px solid ${diasRelatorioGuiche === 1 ? headerColor : theme.border}`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        backgroundColor: diasRelatorioGuiche === 1 ? headerColor : theme.background,
                        color: diasRelatorioGuiche === 1 ? '#fff' : theme.text,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Hoje
                    </button>
                    <button
                      onClick={() => setDiasRelatorioGuiche(7)}
                      style={{
                        padding: '10px 16px',
                        fontSize: '13px',
                        fontWeight: '600',
                        border: `2px solid ${diasRelatorioGuiche === 7 ? headerColor : theme.border}`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        backgroundColor: diasRelatorioGuiche === 7 ? headerColor : theme.background,
                        color: diasRelatorioGuiche === 7 ? '#fff' : theme.text,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      7 Dias
                    </button>
                    <button
                      onClick={() => setDiasRelatorioGuiche(30)}
                      style={{
                        padding: '10px 16px',
                        fontSize: '13px',
                        fontWeight: '600',
                        border: `2px solid ${diasRelatorioGuiche === 30 ? headerColor : theme.border}`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        backgroundColor: diasRelatorioGuiche === 30 ? headerColor : theme.background,
                        color: diasRelatorioGuiche === 30 ? '#fff' : theme.text,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      30 Dias
                    </button>
                    <div style={{ flex: 1, display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={diasRelatorioGuiche}
                        onChange={(e) => {
                          const valor = parseInt(e.target.value) || 1
                          setDiasRelatorioGuiche(Math.min(Math.max(valor, 1), 365))
                        }}
                        style={{
                          width: '80px',
                          padding: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                          textAlign: 'center',
                          border: `2px solid ${headerColor}`,
                  borderRadius: '6px',
                          backgroundColor: theme.background,
                          color: theme.text
                        }}
                      />
                      <span style={{ fontSize: '13px', color: theme.textSecondary, fontWeight: '600' }}>
                        dias
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dados do Relatório */}
                {(() => {
                  const relatorio = gerarRelatorioGuiche(mostrarRelatorioGuiche)
                  if (!relatorio) {
                    return (
                      <div style={{ textAlign: 'center', padding: '40px', color: theme.textSecondary }}>
                        Nenhum dado disponível
                      </div>
                    )
                  }

                  return (
                    <>
                      {/* Resumo Geral */}
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(2, 1fr)', 
                        gap: '12px',
                        marginBottom: '20px'
                      }}>
                        <div style={{
                          padding: '16px',
                          backgroundColor: theme.background,
                          border: `2px solid #3b82f6`,
                          borderRadius: '8px'
                        }}>
                          <div style={{ fontSize: '11px', color: theme.textSecondary, marginBottom: '4px' }}>
                            Total Chamadas
                          </div>
                          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3b82f6' }}>
                            {relatorio.totalChamadas}
                          </div>
                        </div>
                        <div style={{
                          padding: '16px',
                          backgroundColor: theme.background,
                          border: `2px solid #10b981`,
                          borderRadius: '8px'
                        }}>
                          <div style={{ fontSize: '11px', color: theme.textSecondary, marginBottom: '4px' }}>
                            Finalizadas
                          </div>
                          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>
                            {relatorio.totalFinalizadas}
                          </div>
                        </div>
                        <div style={{
                          padding: '16px',
                          backgroundColor: theme.background,
                          border: `2px solid #ef4444`,
                          borderRadius: '8px'
                        }}>
                          <div style={{ fontSize: '11px', color: theme.textSecondary, marginBottom: '4px' }}>
                            Ausentes
                          </div>
                          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ef4444' }}>
                            {relatorio.totalAusentes}
                          </div>
                        </div>
                        <div style={{
                          padding: '16px',
                          backgroundColor: theme.background,
                          border: `2px solid #f59e0b`,
                          borderRadius: '8px'
                        }}>
                          <div style={{ fontSize: '11px', color: theme.textSecondary, marginBottom: '4px' }}>
                            Tempo Médio
                          </div>
                          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f59e0b' }}>
                            {relatorio.tempoMedioAtendimento}
                          </div>
                        </div>
                      </div>

                      {/* Por Categoria */}
                      <div style={{ marginBottom: '20px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: theme.text, marginBottom: '12px' }}>
                          Por Categoria
                        </h4>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <div style={{
                            flex: 1,
                            padding: '16px',
                            backgroundColor: theme.background,
                            border: `2px solid #3b82f6`,
                            borderRadius: '8px',
                            textAlign: 'center'
                          }}>
                            <div style={{ fontSize: '11px', color: theme.textSecondary, marginBottom: '8px' }}>
                              ⭐ Preferenciais
                            </div>
                            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>
                              {relatorio.preferenciais}
                            </div>
                          </div>
                          <div style={{
                            flex: 1,
                            padding: '16px',
                            backgroundColor: theme.background,
                            border: `2px solid #10b981`,
                            borderRadius: '8px',
                            textAlign: 'center'
                          }}>
                            <div style={{ fontSize: '11px', color: theme.textSecondary, marginBottom: '8px' }}>
                              📋 Comuns
                            </div>
                            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
                              {relatorio.comuns}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Lista de Senhas */}
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: theme.text, marginBottom: '12px' }}>
                          Senhas Atendidas ({relatorio.senhas.length})
                        </h4>
                        <div style={{
                          maxHeight: '200px',
                          overflowY: 'auto',
                          border: `1px solid ${theme.border}`,
                          borderRadius: '6px',
                          backgroundColor: theme.background
                        }}>
                          {relatorio.senhas.length === 0 ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: theme.textSecondary }}>
                              Nenhuma senha no período selecionado
                            </div>
                          ) : (
                            relatorio.senhas.map(senha => (
                              <div
                                key={senha.id}
                                style={{
                                  padding: '12px',
                                  borderBottom: `1px solid ${theme.border}`,
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center'
                                }}
                              >
                                <div>
                                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: theme.text }}>
                                    {senha.numeroCompleto}
                                  </div>
                                  <div style={{ fontSize: '11px', color: theme.textSecondary }}>
                                    {new Date(senha.horaEmissao).toLocaleString('pt-BR')}
                                  </div>
                                </div>
                                <div style={{
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: 'bold',
                                  backgroundColor: senha.status === 'finalizado' ? '#d1fae5' : senha.status === 'ausente' ? '#fee2e2' : '#e0e0e0',
                                  color: senha.status === 'finalizado' ? '#065f46' : senha.status === 'ausente' ? '#991b1b' : '#374151'
                                }}>
                                  {senha.status === 'finalizado' ? '✓ Finalizado' : senha.status === 'ausente' ? '✕ Ausente' : senha.status}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </>
                  )
                })()}
              </div>

              {/* Footer Modal */}
              <div style={{
                padding: '16px 20px',
                borderTop: `2px solid ${theme.border}`,
                display: 'flex',
                gap: '10px',
                justifyContent: 'space-between'
              }}>
                <button
                  onClick={exportarExcelGuiche}
                  style={{
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: '600',
                    border: `2px solid #10b981`,
                    borderRadius: '8px',
                  cursor: 'pointer',
                    backgroundColor: theme.background,
                    color: '#10b981',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#10b981'
                    e.currentTarget.style.color = '#fff'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.background
                    e.currentTarget.style.color = '#10b981'
                  }}
                >
                  📊 Relatório Completo em Excel
                </button>
              <button
                  onClick={() => setMostrarRelatorioGuiche(null)}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '600',
                    backgroundColor: '#6b7280',
                    color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                    cursor: 'pointer'
                }}
              >
                  Fechar
              </button>
            </div>
          </div>
        </div>
        )}
        
        <modal.ModalComponent />
      </BasePage>
    </>
  )
}
