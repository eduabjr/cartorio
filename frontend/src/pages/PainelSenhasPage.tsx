import React, { useState, useEffect } from 'react'
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
  const agora = useTempoReal() // Atualiza a cada segundo
  
  const headerColor = currentTheme === 'dark' ? '#FF8C00' : '#008080'
  
  const [abaAtiva, setAbaAtiva] = useState<'monitoramento' | 'estatisticas' | 'guiches'>('monitoramento')
  const [senhas, setSenhas] = useState<Senha[]>([])
  const [guiches, setGuiches] = useState<Guiche[]>([])
  const [estatisticas, setEstatisticas] = useState<EstatisticasSenha | null>(null)
  const [filtroServico, setFiltroServico] = useState<string>('todos')
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')

  useEffect(() => {
    carregarDados()
    
    // Atualizar a cada 2 segundos
    const interval = setInterval(() => {
      carregarDados()
    }, 2000)

    // Escutar eventos em tempo real para atualização imediata
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
        console.log('🗑️ Excluindo senha:', senha.numeroCompleto, 'ID:', senha.id)
        
        // Obter todas as senhas
        const todasSenhas = senhaService.getSenhas()
        console.log('📋 Total de senhas antes:', todasSenhas.length)
        
        // Filtrar removendo a senha a ser excluída
        const senhasAtualizadas = todasSenhas.filter(s => s.id !== senha.id)
        console.log('📋 Total de senhas depois:', senhasAtualizadas.length)
        
        // Salvar no localStorage usando a chave correta
        localStorage.setItem('senha-senhas', JSON.stringify(senhasAtualizadas))
        console.log('💾 Senhas salvas no localStorage')
        
        // Emitir evento de senha excluída
        senhaEventService.emit('senha_cancelada', {
          senhaId: senha.id,
          numero: senha.numeroCompleto
        })
        console.log('📡 Evento senha_cancelada emitido')
        
        // Forçar recarregamento imediato
        setSenhas(senhasAtualizadas)
        setEstatisticas(senhaService.getEstatisticasDia())
        
        // Mostrar mensagem de sucesso
        await modal.alert('✅ Senha excluída com sucesso!', 'Sucesso', '✅')
      } catch (error) {
        console.error('❌ Erro ao excluir senha:', error)
        await modal.alert('❌ Erro ao excluir senha. Tente novamente.', 'Erro', '❌')
      }
    }
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
        // Imprimir automaticamente ao abrir
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
    // Criar CSV (compatível com Excel)
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

    // Criar blob e download
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
                {/* Cards de Resumo */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                  <div style={{
                    padding: '20px',
                    backgroundColor: theme.surface,
                    border: `2px solid #3b82f6`,
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '36px', fontWeight: '700', color: '#3b82f6', marginBottom: '8px' }}>
                      {senhas.filter(s => s.status === 'aguardando').length}
                    </div>
                    <div style={{ fontSize: '13px', color: theme.textSecondary }}>
                      Aguardando
                    </div>
                  </div>

                  <div style={{
                    padding: '20px',
                    backgroundColor: theme.surface,
                    border: `2px solid #f59e0b`,
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '36px', fontWeight: '700', color: '#f59e0b', marginBottom: '8px' }}>
                      {senhas.filter(s => s.status === 'atendendo').length}
                    </div>
                    <div style={{ fontSize: '13px', color: theme.textSecondary }}>
                      Em Atendimento
                    </div>
                  </div>

                  <div style={{
                    padding: '20px',
                    backgroundColor: theme.surface,
                    border: `2px solid #10b981`,
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '36px', fontWeight: '700', color: '#10b981', marginBottom: '8px' }}>
                      {senhas.filter(s => s.status === 'finalizado').length}
                    </div>
                    <div style={{ fontSize: '13px', color: theme.textSecondary }}>
                      Finalizadas
                    </div>
                  </div>

                  <div style={{
                    padding: '20px',
                    backgroundColor: theme.surface,
                    border: `2px solid #ef4444`,
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '36px', fontWeight: '700', color: '#ef4444', marginBottom: '8px' }}>
                      {senhas.filter(s => s.status === 'ausente').length}
                    </div>
                    <div style={{ fontSize: '13px', color: theme.textSecondary }}>
                      Ausentes
                    </div>
                  </div>
                </div>

                {/* Tabela de Senhas */}
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
                    fontSize: '15px'
                  }}>
                    🎫 Todas as Senhas do Dia
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
                        {senhas.slice().reverse().map((senha) => {
                          return (
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
                          )
                        })}
                      </tbody>
                    </table>
                    {senhas.length === 0 && (
                      <div style={{ padding: '40px', textAlign: 'center', color: theme.textSecondary }}>
                        <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.3 }}>📭</div>
                        <div>Nenhuma senha emitida hoje</div>
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

                {/* Filtros */}
                <div style={{
                  padding: '16px',
                  backgroundColor: theme.surface,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '12px',
                  marginBottom: '24px',
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'center',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '200px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '600', color: theme.text }}>
                      Serviço:
                    </label>
                    <select
                      value={filtroServico}
                      onChange={(e) => setFiltroServico(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: `1px solid ${theme.border}`,
                        backgroundColor: theme.background,
                        color: theme.text,
                        fontSize: '13px'
                      }}
                    >
                      <option value="todos">Todos os Serviços</option>
                      {senhaService.getServicos().filter(s => s.ativo).map(servico => (
                        <option key={servico.id} value={servico.id}>
                          {servico.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '200px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '600', color: theme.text }}>
                      Status:
                    </label>
                    <select
                      value={filtroStatus}
                      onChange={(e) => setFiltroStatus(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: `1px solid ${theme.border}`,
                        backgroundColor: theme.background,
                        color: theme.text,
                        fontSize: '13px'
                      }}
                    >
                      <option value="todos">Todos os Status</option>
                      <option value="aguardando">⏳ Aguardando</option>
                      <option value="atendendo">💼 Atendendo</option>
                      <option value="finalizado">✅ Finalizado</option>
                      <option value="ausente">❌ Ausente</option>
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      setFiltroServico('todos')
                      setFiltroStatus('todos')
                    }}
                    style={{
                      padding: '8px 16px',
                      fontSize: '13px',
                      fontWeight: '600',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      backgroundColor: headerColor,
                      color: '#fff'
                    }}
                  >
                    🔄 Limpar Filtros
                  </button>
                </div>

                {/* Lista de Senhas Filtradas */}
                {(filtroServico !== 'todos' || filtroStatus !== 'todos') && (
                  <div style={{
                    padding: '20px',
                    backgroundColor: theme.surface,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '12px',
                    marginBottom: '24px'
                  }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '600', color: theme.text }}>
                      📋 Senhas Filtradas ({senhas.filter(s => {
                        const matchServico = filtroServico === 'todos' || s.servico.id === filtroServico
                        const matchStatus = filtroStatus === 'todos' || s.status === filtroStatus
                        return matchServico && matchStatus
                      }).length})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {senhas
                        .filter(s => {
                          const matchServico = filtroServico === 'todos' || s.servico.id === filtroServico
                          const matchStatus = filtroStatus === 'todos' || s.status === filtroStatus
                          return matchServico && matchStatus
                        })
                        .slice().reverse()
                        .map((senha) => (
                          <div
                            key={senha.id}
                            style={{
                              padding: '12px',
                              backgroundColor: theme.background,
                              border: `1px solid ${senha.servico.cor}`,
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px'
                            }}
                          >
                            <div style={{
                              padding: '6px 12px',
                              backgroundColor: senha.servico.cor,
                              color: '#fff',
                              borderRadius: '6px',
                              fontWeight: '700',
                              fontFamily: 'monospace',
                              fontSize: '14px'
                            }}>
                              {senha.numeroCompleto}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '13px', fontWeight: '600', color: theme.text }}>
                                {senha.servico.nome}
                                {senha.prioridade && <span style={{ color: '#ef4444', marginLeft: '8px' }}>★</span>}
                              </div>
                              <div style={{ fontSize: '11px', color: theme.textSecondary, marginTop: '2px' }}>
                                {new Date(senha.horaEmissao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
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
                            <button
                              onClick={() => excluirSenha(senha)}
                              style={{
                                padding: '6px 12px',
                                fontSize: '11px',
                                fontWeight: '600',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                backgroundColor: '#ef4444',
                                color: '#fff'
                              }}
                              title="Excluir senha"
                            >
                              🗑️
                            </button>
                          </div>
                        ))}
                      {senhas.filter(s => {
                        const matchServico = filtroServico === 'todos' || s.servico.id === filtroServico
                        const matchStatus = filtroStatus === 'todos' || s.status === filtroStatus
                        return matchServico && matchStatus
                      }).length === 0 && (
                        <div style={{ padding: '40px', textAlign: 'center', color: theme.textSecondary }}>
                          <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.3 }}>🔍</div>
                          <div>Nenhuma senha encontrada com os filtros selecionados</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

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

                {/* Por Serviço */}
                <div style={{
                  padding: '20px',
                  backgroundColor: theme.surface,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '12px',
                  marginBottom: '24px'
                }}>
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '600', color: theme.text }}>
                    📋 Por Serviço
                  </h4>
                  {Object.entries(estatisticas.porServico).map(([servicoId, stats]) => {
                    const servico = senhaService.getServicos().find(s => s.id === servicoId)
                    if (!servico) return null

                    return (
                      <div
                        key={servicoId}
                        style={{
                          padding: '16px',
                          backgroundColor: theme.background,
                          border: `1px solid ${servico.cor}`,
                          borderRadius: '8px',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px'
                        }}
                      >
                        <div style={{
                          width: '40px',
                          height: '40px',
                          backgroundColor: servico.cor,
                          color: '#fff',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
                          fontWeight: '700'
                        }}>
                          {servico.sigla}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: theme.text }}>
                            {servico.nome}
                          </div>
                        </div>
                        <div style={{ textAlign: 'center', minWidth: '80px' }}>
                          <div style={{ fontSize: '20px', fontWeight: '700', color: theme.text }}>
                            {stats.emitidas}
                          </div>
                          <div style={{ fontSize: '11px', color: theme.textSecondary }}>
                            Emitidas
                          </div>
                        </div>
                        <div style={{ textAlign: 'center', minWidth: '80px' }}>
                          <div style={{ fontSize: '20px', fontWeight: '700', color: theme.text }}>
                            {stats.atendidas}
                          </div>
                          <div style={{ fontSize: '11px', color: theme.textSecondary }}>
                            Atendidas
                          </div>
                        </div>
                        <div style={{ textAlign: 'center', minWidth: '80px' }}>
                          <div style={{ fontSize: '16px', fontWeight: '600', color: theme.text }}>
                            {formatarTempo(stats.tempoMedio)}
                          </div>
                          <div style={{ fontSize: '11px', color: theme.textSecondary }}>
                            Tempo Médio
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ABA: Guichês */}
            {abaAtiva === 'guiches' && (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {guiches.map((guiche) => {
                    const senhaDoGuiche = senhas.find(s => 
                      s.guicheId === guiche.id && (s.status === 'chamando' || s.status === 'atendendo')
                    )

                    return (
                      <div
                        key={guiche.id}
                        style={{
                          padding: '24px',
                          backgroundColor: theme.surface,
                          border: `2px solid ${guiche.ativo ? headerColor : theme.border}`,
                          borderRadius: '12px',
                          opacity: guiche.ativo ? 1 : 0.6
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                          {/* Número do Guichê */}
                          <div style={{
                            width: '60px',
                            height: '60px',
                            backgroundColor: guiche.ativo ? headerColor : theme.border,
                            color: '#fff',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            fontWeight: '700'
                          }}>
                            {guiche.numero}
                          </div>

                          {/* Informações */}
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '16px', fontWeight: '600', color: theme.text, marginBottom: '4px' }}>
                              {guiche.nome}
                            </div>
                            <div style={{ fontSize: '13px', color: theme.textSecondary }}>
                              Funcionário: {guiche.funcionarioNome || 'Não atribuído'}
                            </div>
                            <div style={{ fontSize: '13px', color: theme.textSecondary, marginTop: '4px' }}>
                              Status: {guiche.statusGuiche === 'livre' ? '🟢 Livre' : 
                                       guiche.statusGuiche === 'ocupado' ? '🔴 Ocupado' : '⏸️ Pausado'}
                            </div>
                          </div>

                          {/* Senha Atual */}
                          <div style={{ textAlign: 'center', minWidth: '120px' }}>
                            {senhaDoGuiche ? (
                              <>
                                <div style={{
                                  padding: '8px 16px',
                                  backgroundColor: senhaDoGuiche.servico.cor,
                                  color: '#fff',
                                  borderRadius: '8px',
                                  fontSize: '18px',
                                  fontWeight: '700',
                                  fontFamily: 'monospace',
                                  marginBottom: '4px'
                                }}>
                                  {senhaDoGuiche.numeroCompleto}
                                </div>
                                <div style={{ fontSize: '11px', color: theme.textSecondary }}>
                                  {senhaDoGuiche.status === 'chamando' ? 'Chamando' : 'Atendendo'}
                                </div>
                              </>
                            ) : (
                              <div style={{ fontSize: '13px', color: theme.textSecondary }}>
                                -
                              </div>
                            )}
                          </div>
                        </div>
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
              </div>
            )}
          </div>

          {/* Rodapé */}
          <div style={{
            padding: '16px',
            borderTop: `2px solid ${theme.border}`,
            backgroundColor: theme.surface,
            display: 'flex',
            gap: '10px',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={exportarPDF}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: '#8b5cf6',
                  color: '#fff'
                }}
                title="Gerar relatório em PDF (impressão)"
              >
                📄 Exportar PDF
              </button>
              <button
                onClick={exportarExcel}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: '#10b981',
                  color: '#fff'
                }}
                title="Exportar dados para Excel (CSV)"
              >
                📊 Exportar Excel
              </button>
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
        </div>
      </BasePage>
      <modal.ModalComponent />
    </>
  )
}

const formatarTempo = (minutos: number): string => {
  if (minutos < 1) return '< 1 min'
  if (minutos < 60) return `${Math.floor(minutos)} min`
  const horas = Math.floor(minutos / 60)
  const mins = Math.floor(minutos % 60)
  return `${horas}h${mins > 0 ? ` ${mins}min` : ''}`
}

