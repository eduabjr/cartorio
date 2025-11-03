import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function LoginPage() {
  const [login, setLogin] = useState('')
  const [senha, setSenha] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [infoFuncionarios, setInfoFuncionarios] = useState('')
  const { login: fazerLogin } = useAuth()
  const navigate = useNavigate()

  // Verificar funcionários ao carregar
  useEffect(() => {
    const dados = localStorage.getItem('funcionarios-cadastrados')
    if (dados) {
      const lista = JSON.parse(dados)
      if (lista.length > 0) {
        let info = `✅ ${lista.length} funcionário(s) cadastrado(s)\n\n`
        lista.forEach((f: any, i: number) => {
          info += `${i + 1}. ${f.nome} (Código ${f.codigo})\n`
          info += `   Login: "${f.login}"\n`
          info += `   Senha: "${f.senha}"\n\n`
        })
        info += '👆 Use estes dados para fazer login'
        setInfoFuncionarios(info)
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      const loginLimpo = login.trim()
      const senhaLimpa = senha.trim()

      // Verificar funcionários cadastrados
      const dados = localStorage.getItem('funcionarios-cadastrados')
      
      if (!dados) {
        setError('Nenhum funcionário cadastrado. Entre em contato com o administrador.')
        setIsLoading(false)
        return
      }

      const funcionarios = JSON.parse(dados)
      
      // Buscar funcionário
      const funcionario = funcionarios.find((f: any) => 
        String(f.login || '').trim().toLowerCase() === loginLimpo.toLowerCase() ||
        String(f.email || '').trim().toLowerCase() === loginLimpo.toLowerCase()
      )

      if (!funcionario) {
        setError('Login não encontrado. Verifique o login e tente novamente.')
        setIsLoading(false)
        return
      }

      // Validar senha
      const senhaCadastrada = String(funcionario.senha || '').trim()
      
      if (senhaCadastrada !== senhaLimpa) {
        setError(`Senha incorreta!\n\nSenha cadastrada: "${senhaCadastrada}"\nVocê digitou: "${senhaLimpa}"\n\nDigite exatamente a senha cadastrada.`)
        setIsLoading(false)
        return
      }

      // ✅ Login e senha estão CORRETOS!
      // Criar dados do usuário e salvar
      const userData = {
        id: funcionario.codigo || funcionario.id || '1',
        email: funcionario.email || loginLimpo,
        name: funcionario.nome || 'Funcionário',
        login: funcionario.login || loginLimpo,
        profile: 'employee',
        permissions: ['read', 'write', 'create', 'update', 'delete'],
        funcionario: funcionario
      }

      const token = 'funcionario-token-' + Date.now()
      
      // Salvar no localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      
      // Redirecionar para o sistema
      window.location.href = '/'
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido'
      setError(`Erro inesperado:\n${errorMsg}`)
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        background: '#ffffff',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        width: '100%',
        maxWidth: '420px'
      }}>
        {/* Logo e Título */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            fontSize: '48px',
            fontWeight: '700',
            color: '#667eea',
            marginBottom: '8px',
            fontFamily: 'Arial, sans-serif',
            letterSpacing: '2px'
          }}>
            CIVITAS
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            Sistema de Cartório
          </div>
        </div>

        {/* Erro */}
        {error && (
          <div style={{
            padding: '16px',
            marginBottom: '24px',
            backgroundColor: '#fee2e2',
            border: '2px solid #ef4444',
            borderRadius: '8px',
            color: '#991b1b',
            fontSize: '14px',
            whiteSpace: 'pre-wrap'
          }}>
            {error}
          </div>
        )}

        {/* Info Funcionários */}
        {infoFuncionarios && !error && (
          <div style={{
            padding: '16px',
            marginBottom: '24px',
            backgroundColor: '#dbeafe',
            border: '2px solid #3b82f6',
            borderRadius: '8px',
            color: '#1e40af',
            fontSize: '13px',
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace'
          }}>
            {infoFuncionarios}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151'
            }}>
              Login ou Email
            </label>
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Digite seu login"
              required
              autoComplete="username"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151'
            }}>
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite sua senha"
              required
              autoComplete="current-password"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#ffffff',
              background: isLoading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '8px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.5)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)'
            }}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Botão de Diagnóstico */}
        <button
          type="button"
          onClick={() => {
            const dados = localStorage.getItem('funcionarios-cadastrados')
            if (!dados) {
              alert('❌ NENHUM funcionário cadastrado no sistema!')
              return
            }

            const lista = JSON.parse(dados)
            let msg = `📋 FUNCIONÁRIOS CADASTRADOS: ${lista.length}\n\n`
            
            lista.forEach((f: any, i: number) => {
              msg += `${i + 1}. Código ${f.codigo || 'N/A'}\n`
              msg += `   Nome: ${f.nome || 'N/A'}\n`
              msg += `   Login: "${f.login || 'N/A'}"\n`
              msg += `   Senha: "${f.senha || 'N/A'}"\n`
              msg += `   Email: ${f.email || 'N/A'}\n\n`
            })

            msg += '📌 COPIE O LOGIN E SENHA EXATOS ACIMA!'
            alert(msg)
          }}
          style={{
            width: '100%',
            padding: '12px',
            marginTop: '16px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#ffffff',
            background: '#ef4444',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          🔍 VER FUNCIONÁRIOS CADASTRADOS
        </button>

        {/* Informações */}
        <div style={{
          marginTop: '16px',
          padding: '16px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#6b7280',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
            💡 Use o login e senha cadastrados
          </div>
          <div>
            Cadastre funcionários em: Menu → Funcionário
          </div>
        </div>

        {/* Rodapé */}
        <div style={{
          marginTop: '24px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#9ca3af'
        }}>
          <div>Rua Yara, 49 - São João</div>
          <div>CEP: 17513-370 - Marília/SP</div>
          <div>Tel: (14) 3216-2611</div>
        </div>
      </div>
    </div>
  )
}
