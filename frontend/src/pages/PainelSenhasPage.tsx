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
  const [filtroTipoSenha, setFiltroTipoSenha] = useState<string>('todas')
  const [filtroServico, setFiltroServico] = useState<string>('todos')
  const [guicheSelecionado, setGuicheSelecionado] = useState<string | null>(null)
  const [mostrarSeletorSenha, setMostrarSeletorSenha] = useState<string | null>(null)
  const [filtroStatusMonitoramento, setFiltroStatusMonitoramento] = useState<'todos' | 'aguardando' | 'atendendo' | 'finalizado' | 'ausente'>('todos')
  const [buscaTexto, setBuscaTexto] = useState<string>('')

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

  const calcularTempoChamando = (senha: Senha): string => {
    if (!senha.horaChamada) return '-'
    
    const inicio = new Date(senha.horaChamada)
    const fim = senha.horaAtendimento ? new Date(senha.horaAtendimento) : new Date()
    const diffMs = fim.getTime() - inicio.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    
    if (diffSeconds < 60) return `${diffSeconds}s`
    const minutes = Math.floor(diffSeconds / 60)
    const seconds = diffSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
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
      if (senhaAtual) return '0 min' // Está atendendo agora
      
      // Se não há nenhuma senha, tempo ocioso desde o início do dia
      const inicioDia = new Date()
      inicioDia.setHours(0, 0, 0, 0)
      const diffMs = agora.getTime() - inicioDia.getTime()
      const diffMin = Math.floor(diffMs / 1000 / 60)
      return formatarTempo(diffMin)
    }

    const fim = new Date(ultimaSenhaFinalizada.horaFinalizacao)
    const agora2 = new Date()
    const diffMs = agora2.getTime() - fim.getTime()
    const diffMin = Math.floor(diffMs / 1000 / 60)
    
    // Se está atendendo agora, tempo ocioso é 0
    const senhaAtual = senhasDoGuiche.find(s => s.status === 'chamando' || s.status === 'atendendo')
    if (senhaAtual) return '0 min'
    
    return formatarTempo(diffMin)
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
    const diffMin = Math.floor(diffMs / 1000 / 60)
    
    return formatarTempo(diffMin)
  }

  const formatarTempo = (minutos: number): string => {
    if (minutos < 1) return '< 1 min'
    if (minutos < 60) return `${Math.floor(minutos)} min`
    const horas = Math.floor(minutos / 60)
    const mins = Math.floor(minutos % 60)
    return `${horas}h${mins > 0 ? ` ${mins}min` : ''}`
  }

  const gerarRelatorioHTML = (): string => {
    const agora = new Date()
    const dataHora = agora.toLocaleString('pt-BR')

    let html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Relatório de Senhas - ${agora.toLocaleDateString('pt-BR')}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #008080; text-align: center; }
        h2 { color: #333; border-bottom: 2px solid #008080; padding-bottom: 5px; }
        .header { text-align: center; margin-bottom: 30px; }
        .stats { display: flex; justify-content: space-around; margin: 20px 0; }
        .stat-box { border: 2px solid #008080; border-radius: 8px; padding: 15px; text-align: center; min-width: 150px; }
        .stat-value { font-size: 36px; font-weight: bold; color: #008080; }
        .stat-label { color: #666; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background-color: #008080; color: white; padding: 12px; text-align: left; }
        td { padding: 10px; border-bottom: 1px solid #ddd; }
        tr:hover { background-color: #f5f5f5; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        @media print { button { display: none; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 Relatório de Atendimento por Senhas</h1>
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
    </div>
`
    }

    html += `
    <h2>Detalhamento de Senhas</h2>
    <table>
        <thead>
            <tr>
                <th>Senha</th>
                <th>Serviço</th>
                <th>Status</th>
                <th>Guichê</th>
                <th>Emissão</th>
                <th>Tempo de Espera</th>
            </tr>
        </thead>
        <tbody>
`

    senhas.forEach(senha => {
      const agora = new Date()
      const espera = senha.tempoEspera || Math.floor((agora.getTime() - new Date(senha.horaEmissao).getTime()) / 1000 / 60)

      html += `
            <tr>
                <td><strong>${senha.numeroCompleto}</strong>${senha.prioridade ? ' ★' : ''}</td>
                <td>${senha.servico.nome}</td>
                <td>${senha.status === 'aguardando' ? '⏳ Aguardando' :
                      senha.status === 'chamando' ? '📢 Chamando' :
                      senha.status === 'atendendo' ? '💼 Atendendo' :
                      senha.status === 'finalizado' ? '✅ Finalizado' : '❌ Ausente'}</td>
                <td>${senha.guicheNumero || '-'}</td>
                <td>${new Date(senha.horaEmissao).toLocaleTimeString('pt-BR')}</td>
                <td>${formatarTempo(espera)}</td>
            </tr>
`
    })

    html += `
        </tbody>
    </table>

    <div class="footer">
        <p>Sistema de Atendimento por Senhas - Cartório</p>
        <p>Relatório gerado automaticamente</p>
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
    let csv = 'Senha;Servico;Status;Guiche;Emissao;Tempo_Espera\n'
    
    senhas.forEach(senha => {
      const agora = new Date()
      const espera = senha.tempoEspera || Math.floor((agora.getTime() - new Date(senha.horaEmissao).getTime()) / 1000 / 60)
      const status = senha.status === 'aguardando' ? 'Aguardando' :
                     senha.status === 'chamando' ? 'Chamando' :
                     senha.status === 'atendendo' ? 'Atendendo' :
                     senha.status === 'finalizado' ? 'Finalizado' : 'Ausente'
      
      csv += `${senha.numeroCompleto};${senha.servico.nome};${status};${senha.guicheNumero || '-'};${new Date(senha.horaEmissao).toLocaleTimeString('pt-BR')};${formatarTempo(espera)}\n`
    })

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `relatorio_senhas_${new Date().toISOString().split('T')[0]}.csv`)
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
              <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: theme.text }}>
                  Estatísticas do Dia - {new Date().toLocaleDateString('pt-BR')}
                </h3>

                {/* Resumo Geral */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                  <div style={{
                    padding: '24px',
                    backgroundColor: theme.surface,
                    border: `2px solid ${theme.border}`,
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '42px', fontWeight: '700', color: '#3b82f6', marginBottom: '8px' }}>
                      {estatisticas.totalEmitidas}
                    </div>
                    <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                      Total Emitidas
                    </div>
                  </div>

                  <div style={{
                    padding: '24px',
                    backgroundColor: theme.surface,
                    border: `2px solid ${theme.border}`,
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '42px', fontWeight: '700', color: '#10b981', marginBottom: '8px' }}>
                      {estatisticas.totalAtendidas}
                    </div>
                    <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                      Total Atendidas
                    </div>
                  </div>

                  <div style={{
                    padding: '24px',
                    backgroundColor: theme.surface,
                    border: `2px solid ${theme.border}`,
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '42px', fontWeight: '700', color: '#f59e0b', marginBottom: '8px' }}>
                      {formatarTempo(estatisticas.tempoMedioEspera)}
                    </div>
                    <div style={{ fontSize: '14px', color: theme.textSecondary }}>
                      Tempo Médio de Espera
                    </div>
                  </div>
                </div>

                {/* Por Serviço e Categoria */}
                <div style={{
                  padding: '20px',
                  backgroundColor: theme.surface,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '12px',
                  marginBottom: '24px'
                }}>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '600', color: theme.text }}>
                    📋 Por Serviço e Categoria
                  </h4>
                  {Object.entries(estatisticas.porServico).map(([servicoId, stats]) => {
                    const servico = senhaService.getServicos().find(s => s.id === servicoId)
                    if (!servico) return null

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

                    return (
                      <div
                        key={servicoId}
                        style={{
                          padding: '16px',
                          backgroundColor: theme.background,
                          border: `2px solid ${servico.cor}`,
                          borderRadius: '10px',
                          marginBottom: '12px'
                        }}
                      >
                        {/* Header do Serviço */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginBottom: '12px',
                          paddingBottom: '12px',
                          borderBottom: `1px solid ${theme.border}`
                        }}>
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
                            fontWeight: '700'
                          }}>
                            {servico.sigla}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '16px', fontWeight: '700', color: theme.text }}>
                              {servico.nome}
                            </div>
                            <div style={{ fontSize: '12px', color: theme.textSecondary }}>
                              Total: {stats.emitidas} emitidas • {stats.atendidas} atendidas • {formatarTempo(stats.tempoMedio)}
                            </div>
                          </div>
                        </div>

                        {/* Estatísticas por Tipo */}
                        <div style={{ display: 'flex', gap: '12px' }}>
                          {/* Preferencial */}
                          {statsP.emitidas > 0 && (
                            <div style={{
                              flex: 1,
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
                              flex: 1,
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
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Botões de Exportação */}
                <div style={{ 
                  display: 'flex', 
                  gap: '12px', 
                  justifyContent: 'center',
                  marginTop: '24px'
                }}>
                  <button
                    onClick={exportarPDF}
                    style={{
                      padding: '12px 32px',
                      fontSize: '15px',
                      fontWeight: '600',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: '#8b5cf6',
                      color: '#fff',
                      boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#7c3aed'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#8b5cf6'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                    title="Gerar relatório em PDF (impressão)"
                  >
                    📄 Exportar PDF
                  </button>
                  <button
                    onClick={exportarExcel}
                    style={{
                      padding: '12px 32px',
                      fontSize: '15px',
                      fontWeight: '600',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: '#10b981',
                      color: '#fff',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#059669'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#10b981'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                    title="Exportar dados para Excel (CSV)"
                  >
                    📊 Exportar Excel
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
                    const senhasChamadas = senhasDoGuiche.filter(s => s.status === 'finalizado' || s.status === 'atendendo' || s.status === 'chamando')

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

                          <div style={{ display: 'flex', gap: '12px', minWidth: '280px', flexWrap: 'wrap' }}>
                            <div style={{ textAlign: 'center', minWidth: '70px' }}>
                              <div style={{ fontSize: '22px', fontWeight: '700', color: '#3b82f6' }}>
                                {senhasChamadas.length}
                              </div>
                              <div style={{ fontSize: '10px', color: theme.textSecondary }}>
                                Chamadas
                              </div>
                            </div>
                            <div style={{ textAlign: 'center', minWidth: '70px' }}>
                              <div style={{ fontSize: '22px', fontWeight: '700', color: '#10b981' }}>
                                {senhasAtendidas.length}
                              </div>
                              <div style={{ fontSize: '10px', color: theme.textSecondary }}>
                                Atendidas
                              </div>
                            </div>
                            <div style={{ textAlign: 'center', minWidth: '70px' }}>
                              <div style={{ fontSize: '18px', fontWeight: '700', color: estaAtendendo ? '#10b981' : '#ef4444' }}>
                                {calcularTempoOcioso(guiche)}
                              </div>
                              <div style={{ fontSize: '10px', color: theme.textSecondary }}>
                                {estaAtendendo ? 'Atendendo' : 'Ocioso'}
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
                              📊 Senhas Chamadas ({senhasFiltradas.length})
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
                                  <h5 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '700', color: theme.text }}>
                                    📋 Por Serviço e Categoria:
                                  </h5>
                                  {Object.entries(porServico).map(([servico, senhasDoServico]) => {
                                    const servicoObj = senhaService.getServicos().find(s => s.nome === servico)
                                    const preferenciais = senhasDoServico.filter(s => s.prioridade)
                                    const comuns = senhasDoServico.filter(s => !s.prioridade)
                                    const preferenciaisFinalizadas = preferenciais.filter(s => s.status === 'finalizado')
                                    const comunsFinalizadas = comuns.filter(s => s.status === 'finalizado')
                                    
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
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
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
                                          <div style={{ fontSize: '14px', fontWeight: '700', color: theme.text }}>
                                            {senhasDoServico.length} total
                                          </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                          {preferenciais.length > 0 && (
                                            <div style={{
                                              flex: 1,
                                              padding: '8px',
                                              backgroundColor: '#eff6ff',
                                              border: '1px solid #3b82f6',
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
                                          )}
                                          {comuns.length > 0 && (
                                            <div style={{
                                              flex: 1,
                                              padding: '8px',
                                              backgroundColor: '#f0fdf4',
                                              border: '1px solid #10b981',
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
                                          )}
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
                                  {senhasFiltradas.slice().reverse().slice(0, 10).map((senha) => (
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
                                              Duração: {calcularDuracaoAtendimento(senha)} • Chamou: {calcularTempoChamando(senha)}
                                            </>
                                          ) : (
                                            <>
                                              Chamou: {calcularTempoChamando(senha)}
                                            </>
                                          )}
                                        </div>
                                      </div>
                                      <div style={{ fontSize: '11px', color: theme.textSecondary, textAlign: 'center' }}>
                                        <div>{new Date(senha.horaChamada || senha.horaEmissao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                                      </div>
                                      <span style={{
                                        padding: '3px 8px',
                                        borderRadius: '8px',
                                        fontSize: '10px',
                                        fontWeight: '600',
                                        backgroundColor: senha.status === 'finalizado' ? '#d1fae5' : '#fef3c7',
                                        color: senha.status === 'finalizado' ? '#065f46' : '#92400e'
                                      }}>
                                        {senha.status === 'finalizado' ? '✅' : '💼'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                {senhasFiltradas.length > 10 && (
                                  <div style={{ textAlign: 'center', padding: '8px', fontSize: '11px', color: theme.textSecondary }}>
                                    Mostrando últimas 10 de {senhasFiltradas.length} senhas
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
        
        <modal.ModalComponent />
      </BasePage>
    </>
  )
}
