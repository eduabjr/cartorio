/**
 * 📝 EXEMPLO: Como usar Micro-Frontends no seu sistema
 * 
 * Este é um exemplo de como seria a HomePage usando módulos isolados
 * 
 * ⚠️ ESTE É APENAS UM EXEMPLO - NÃO substitua seu arquivo atual!
 * Use como referência quando quiser migrar
 */

import React, { useState } from 'react'
import { modules } from '../modules'

export function HomePageComMicroFrontends() {
  // Estado para controlar qual janela está aberta
  const [janelaAberta, setJanelaAberta] = useState<string | null>(null)
  
  // Função genérica para abrir qualquer módulo
  const abrirModulo = (modulo: string) => {
    console.log(`📂 Abrindo módulo isolado: ${modulo}`)
    setJanelaAberta(modulo)
  }
  
  // Função para fechar módulo atual
  const fecharModulo = () => {
    console.log(`✅ Fechando módulo`)
    setJanelaAberta(null)
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>🏢 Sistema de Cartório</h1>
      <p>Todos os módulos são isolados e independentes</p>
      
      <hr />
      
      {/* MENU DE CADASTROS */}
      <div style={{ marginBottom: '20px' }}>
        <h3>📋 Cadastros</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => abrirModulo('cliente')}>
            👤 Clientes
          </button>
          <button onClick={() => abrirModulo('funcionario')}>
            👨‍💼 Funcionários
          </button>
          <button onClick={() => abrirModulo('cidade')}>
            🏙️ Cidades
          </button>
          <button onClick={() => abrirModulo('pais')}>
            🌍 Países
          </button>
          <button onClick={() => abrirModulo('firmas')}>
            ✍️ Firmas
          </button>
          <button onClick={() => abrirModulo('natureza')}>
            📜 Natureza
          </button>
        </div>
      </div>

      {/* MENU DE LIVROS */}
      <div style={{ marginBottom: '20px' }}>
        <h3>📚 Livros e Índices</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => abrirModulo('indices')}>
            📖 Índices
          </button>
          <button onClick={() => abrirModulo('indicex')}>
            📑 Índice X
          </button>
          <button onClick={() => abrirModulo('cadastroLivros')}>
            📕 Cadastro de Livros
          </button>
        </div>
      </div>

      {/* MENU DE SENHAS */}
      <div style={{ marginBottom: '20px' }}>
        <h3>🎫 Sistema de Senhas</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => abrirModulo('configuracaoSenha')}>
            ⚙️ Configurar Senhas
          </button>
          <button onClick={() => abrirModulo('controladorSenha')}>
            🎮 Controle de Atendimento
          </button>
          <button onClick={() => abrirModulo('painelSenhas')}>
            📺 Painel de Senhas
          </button>
          <button onClick={() => abrirModulo('gerenciamentoGuiches')}>
            🏢 Gerenciar Guichês
          </button>
        </div>
      </div>

      {/* MENU DE CONFIGURAÇÕES */}
      <div style={{ marginBottom: '20px' }}>
        <h3>⚙️ Configurações</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => abrirModulo('configuracaoSistema')}>
            🔧 Sistema
          </button>
          <button onClick={() => abrirModulo('configuracaoMenu')}>
            📋 Menu
          </button>
        </div>
      </div>

      <hr />

      {/* RENDERIZAR O MÓDULO SELECIONADO */}
      {/* 
        🛡️ VANTAGEM: Se qualquer uma dessas páginas quebrar,
        mostra erro APENAS nela, resto do sistema continua funcionando!
      */}
      
      {janelaAberta === 'cliente' && (
        <modules.cliente onClose={fecharModulo} />
      )}
      
      {janelaAberta === 'funcionario' && (
        <modules.funcionario onClose={fecharModulo} />
      )}
      
      {janelaAberta === 'cidade' && (
        <modules.cidade onClose={fecharModulo} />
      )}
      
      {janelaAberta === 'pais' && (
        <modules.pais onClose={fecharModulo} />
      )}
      
      {janelaAberta === 'firmas' && (
        <modules.firmas onClose={fecharModulo} />
      )}
      
      {janelaAberta === 'natureza' && (
        <modules.natureza onClose={fecharModulo} />
      )}
      
      {janelaAberta === 'indices' && (
        <modules.indices onClose={fecharModulo} />
      )}
      
      {janelaAberta === 'indicex' && (
        <modules.indicex onClose={fecharModulo} />
      )}
      
      {janelaAberta === 'cadastroLivros' && (
        <modules.cadastroLivros onClose={fecharModulo} />
      )}
      
      {janelaAberta === 'configuracaoSenha' && (
        <modules.configuracaoSenha onClose={fecharModulo} />
      )}
      
      {janelaAberta === 'controladorSenha' && (
        <modules.controladorSenha onClose={fecharModulo} />
      )}
      
      {janelaAberta === 'painelSenhas' && (
        <modules.painelSenhas onClose={fecharModulo} />
      )}
      
      {janelaAberta === 'gerenciamentoGuiches' && (
        <modules.gerenciamentoGuiches onClose={fecharModulo} />
      )}
      
      {janelaAberta === 'configuracaoSistema' && (
        <modules.configuracaoSistema onClose={fecharModulo} />
      )}
      
      {janelaAberta === 'configuracaoMenu' && (
        <modules.configuracaoMenu onClose={fecharModulo} />
      )}
      
      {janelaAberta === 'cartorioSeade' && (
        <modules.cartorioSeade onClose={fecharModulo} />
      )}
      
      {janelaAberta === 'tiposCadastro' && (
        <modules.tiposCadastro onClose={fecharModulo} />
      )}
      
      {janelaAberta === 'protocoloLancamento' && (
        <modules.protocoloLancamento onClose={fecharModulo} />
      )}
      
      {janelaAberta === 'localizacaoCadastro' && (
        <modules.localizacaoCadastro onClose={fecharModulo} />
      )}
      
      {janelaAberta === 'oficiosMandados' && (
        <modules.oficiosMandados onClose={fecharModulo} />
      )}
      
      {janelaAberta === 'servicoCartorio' && (
        <modules.servicoCartorio onClose={fecharModulo} />
      )}
      
      {janelaAberta === 'dnvdoBloqueadas' && (
        <modules.dnvdoBloqueadas onClose={fecharModulo} />
      )}
      
      {janelaAberta === 'protocoloCancelamento' && (
        <modules.protocoloCancelamento onClose={fecharModulo} />
      )}

      {/* 
        🎯 DICA: Você pode usar um mapeamento dinâmico:
        
        {janelaAberta && modules[janelaAberta] && 
          React.createElement(modules[janelaAberta], { onClose: fecharModulo })
        }
      */}
    </div>
  )
}

/**
 * 🎨 EXEMPLO ALTERNATIVO: Forma mais dinâmica
 */
export function HomePageDinamica() {
  const [moduloAtivo, setModuloAtivo] = useState<keyof typeof modules | null>(null)
  
  const abrirModulo = (modulo: keyof typeof modules) => {
    setModuloAtivo(modulo)
  }
  
  const fecharModulo = () => {
    setModuloAtivo(null)
  }

  // Renderização dinâmica
  const ModuloAtual = moduloAtivo ? modules[moduloAtivo] : null

  return (
    <div>
      <h1>Sistema de Cartório (Versão Dinâmica)</h1>
      
      {/* Menu */}
      <button onClick={() => abrirModulo('cliente')}>Clientes</button>
      <button onClick={() => abrirModulo('funcionario')}>Funcionários</button>
      <button onClick={() => abrirModulo('configuracaoSenha')}>Senhas</button>
      
      {/* Renderizar módulo selecionado */}
      {ModuloAtual && <ModuloAtual onClose={fecharModulo} />}
    </div>
  )
}

