import { useState } from 'react'
import { BasePage } from '../components/BasePage'
import { useAccessibility } from '../hooks/useAccessibility'
import { useModal } from '../hooks/useModal'

interface IndicesPageProps {
  onClose: () => void
}

type MainTab = 'nascimento' | 'casamento' | 'obito' | 'proclamas'
type SubTab = 'cadastro' | 'imagens'

export function IndicesPage({ onClose }: IndicesPageProps) {
  const { getTheme, currentTheme } = useAccessibility()
  const theme = getTheme()
  const modal = useModal()
  
  const headerColor = currentTheme === 'dark' ? '#FF8C00' : '#008080'
  
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('nascimento')
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('cadastro')
  const [statusMessage, setStatusMessage] = useState('Pronto')

  // Estados para Nascimento
  const [nascimentoData, setNascimentoData] = useState({
    livro: '',
    folhas: '',
    termo: '',
    dataTermo: '',
    cidade: 'SANTO ANDRÉ',
    nomeCrianca: '',
    dataNascimento: '',
    sexo: 'ignorado',
    gemeos: false,
    cpfCrianca: '',
    nomeMae: '',
    cpfMae: '',
    nomePai: '',
    cpfPai: ''
  })

  // Estados para Casamento
  const [casamentoData, setCasamentoData] = useState({
    livro: '',
    folhas: '',
    termo: '',
    dataTermo: '',
    cidade: 'SANTO ANDRÉ',
    dataCasamento: '',
    tipo: 'Civil',
    nomeNoivo: '',
    cpfNoivo: '',
    nascNoivo: '',
    sexoNoivo: 'M',
    novoNomeNoivo: '',
    nomeNoiva: '',
    cpfNoiva: '',
    nascNoiva: '',
    sexoNoiva: 'F',
    novoNomeNoiva: ''
  })

  // Estados para Óbito
  const [obitoData, setObitoData] = useState({
    auxLivro: '',
    folhas: '',
    termo: '',
    dataTermo: '',
    cidade: 'SANTO ANDRÉ',
    dataObito: '',
    dataNascimento: '',
    idade: '',
    duracaoFetal: 'NÃO FETAL',
    sexo: 'ignorado',
    raca: '',
    nomeFalecido: '',
    cpf: '',
    rg: '',
    tituloEleitor: '',
    zona: '',
    secao: '',
    ufNatural: '',
    cidadeNatural: '',
    ibgeNatural: '',
    paisNatural: '',
    endereco: '',
    numero: '',
    complemento: '',
    cep: '',
    bairro: '',
    uf: '',
    cidadeEndereco: '',
    ibgeEndereco: '',
    pais: '',
    obitoDesconhecido: false,
    nomeMae: '',
    nomePai: ''
  })

  // Estados para Edital de Proclamas
  const [proclamasData, setProclamasData] = useState({
    livroProcla: '',
    folhasProcla: '',
    editalProcla: '',
    dataEditalProcla: '',
    tipo: 'Interno',
    nomeNoivo: '',
    nomeNoiva: '',
    livroCas: '',
    folhasCas: '',
    termoCas: '',
    dataTermoCas: ''
  })

  const mainTabStyles = (isActive: boolean) => ({
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600' as const,
    border: 'none',
    borderRadius: '4px 4px 0 0',
    cursor: 'pointer',
    backgroundColor: isActive ? theme.primary : theme.surface,
    color: isActive ? '#fff' : theme.text,
    marginRight: '4px',
    transition: 'all 0.2s'
  })

  const subTabStyles = (isActive: boolean) => ({
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '500' as const,
    border: 'none',
    borderBottom: isActive ? `3px solid ${theme.primary}` : '3px solid transparent',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: theme.text,
    marginRight: '8px',
    transition: 'all 0.2s'
  })

  const inputStyles = {
    width: '100%',
    padding: '6px 8px',
    fontSize: '13px',
    border: `1px solid ${theme.border}`,
    borderRadius: '3px',
    backgroundColor: theme.background,
    color: theme.text,
    boxSizing: 'border-box' as const
  }

  const labelStyles = {
    display: 'block',
    fontSize: '12px',
    fontWeight: '500' as const,
    marginBottom: '4px',
    color: theme.text
  }

  const buttonStyles = {
    padding: '6px 12px',
    fontSize: '13px',
    fontWeight: '500' as const,
    border: `1px solid ${theme.border}`,
    borderRadius: '3px',
    cursor: 'pointer',
    backgroundColor: theme.surface,
    color: theme.text,
    transition: 'all 0.2s'
  }

  const searchIconStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    marginLeft: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  }

  const renderNascimento = () => (
    <div style={{ padding: '16px' }}>
      {/* Linha 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '100px 100px 100px 150px 1fr', gap: '12px', marginBottom: '12px' }}>
        <div>
          <label style={labelStyles}>Livro</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input type="text" style={inputStyles} value={nascimentoData.livro} onChange={(e) => setNascimentoData({...nascimentoData, livro: e.target.value})} />
            <span style={searchIconStyles}>🔍</span>
          </div>
        </div>
        <div>
          <label style={labelStyles}>Folha(s)</label>
          <input type="text" style={inputStyles} value={nascimentoData.folhas} onChange={(e) => setNascimentoData({...nascimentoData, folhas: e.target.value})} />
        </div>
        <div>
          <label style={labelStyles}>Termo</label>
          <input type="text" style={inputStyles} value={nascimentoData.termo} onChange={(e) => setNascimentoData({...nascimentoData, termo: e.target.value})} />
        </div>
        <div>
          <label style={labelStyles}>Data Termo</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input type="date" style={inputStyles} value={nascimentoData.dataTermo} onChange={(e) => setNascimentoData({...nascimentoData, dataTermo: e.target.value})} />
            <span style={searchIconStyles}>🔍</span>
          </div>
        </div>
        <div>
          <label style={labelStyles}>Cidade (Registro)</label>
          <input type="text" style={inputStyles} value={nascimentoData.cidade} onChange={(e) => setNascimentoData({...nascimentoData, cidade: e.target.value})} />
        </div>
      </div>

      {/* Linha 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 150px 120px 100px 150px', gap: '12px', marginBottom: '12px' }}>
        <div>
          <label style={labelStyles}>Nome Criança</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input type="text" style={inputStyles} value={nascimentoData.nomeCrianca} onChange={(e) => setNascimentoData({...nascimentoData, nomeCrianca: e.target.value})} />
            <span style={searchIconStyles}>🔍</span>
          </div>
        </div>
        <div>
          <label style={labelStyles}>Data Nascimento</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input type="date" style={inputStyles} value={nascimentoData.dataNascimento} onChange={(e) => setNascimentoData({...nascimentoData, dataNascimento: e.target.value})} />
            <span style={searchIconStyles}>🔍</span>
          </div>
        </div>
        <div>
          <label style={labelStyles}>Sexo</label>
          <select style={inputStyles} value={nascimentoData.sexo} onChange={(e) => setNascimentoData({...nascimentoData, sexo: e.target.value})}>
            <option value="ignorado">ignorado</option>
            <option value="M">Masculino</option>
            <option value="F">Feminino</option>
          </select>
        </div>
        <div>
          <label style={labelStyles}>Gêmeos</label>
          <input type="checkbox" checked={nascimentoData.gemeos} onChange={(e) => setNascimentoData({...nascimentoData, gemeos: e.target.checked})} style={{ marginTop: '8px' }} />
        </div>
        <div>
          <label style={labelStyles}>CPF Criança</label>
          <input type="text" placeholder="___.___.___-__" style={inputStyles} value={nascimentoData.cpfCrianca} onChange={(e) => setNascimentoData({...nascimentoData, cpfCrianca: e.target.value})} />
        </div>
      </div>

      {/* Linha 3 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px 1fr 200px', gap: '12px', marginBottom: '12px' }}>
        <div>
          <label style={labelStyles}>Nome Mãe</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input type="text" style={inputStyles} value={nascimentoData.nomeMae} onChange={(e) => setNascimentoData({...nascimentoData, nomeMae: e.target.value})} />
            <span style={searchIconStyles}>🔍</span>
          </div>
        </div>
        <div>
          <label style={labelStyles}>CPF Mãe</label>
          <input type="text" placeholder="___.___.___-__" style={inputStyles} value={nascimentoData.cpfMae} onChange={(e) => setNascimentoData({...nascimentoData, cpfMae: e.target.value})} />
        </div>
        <div>
          <label style={labelStyles}>Nome Pai</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input type="text" style={inputStyles} value={nascimentoData.nomePai} onChange={(e) => setNascimentoData({...nascimentoData, nomePai: e.target.value})} />
            <span style={searchIconStyles}>🔍</span>
          </div>
        </div>
        <div>
          <label style={labelStyles}>CPF Pai</label>
          <input type="text" placeholder="___.___.___-__" style={inputStyles} value={nascimentoData.cpfPai} onChange={(e) => setNascimentoData({...nascimentoData, cpfPai: e.target.value})} />
        </div>
      </div>
    </div>
  )

  const renderCasamento = () => (
    <div style={{ padding: '16px' }}>
      {/* Linha 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '100px 100px 100px 150px 200px 150px 120px', gap: '12px', marginBottom: '12px' }}>
        <div>
          <label style={labelStyles}>Livro</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input type="text" style={inputStyles} value={casamentoData.livro} onChange={(e) => setCasamentoData({...casamentoData, livro: e.target.value})} />
            <span style={searchIconStyles}>🔍</span>
          </div>
        </div>
        <div>
          <label style={labelStyles}>Folha(s)</label>
          <input type="text" style={inputStyles} value={casamentoData.folhas} onChange={(e) => setCasamentoData({...casamentoData, folhas: e.target.value})} />
        </div>
        <div>
          <label style={labelStyles}>Termo</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input type="text" style={inputStyles} value={casamentoData.termo} onChange={(e) => setCasamentoData({...casamentoData, termo: e.target.value})} />
            <span style={searchIconStyles}>🔍</span>
          </div>
        </div>
        <div>
          <label style={labelStyles}>Data Termo</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input type="date" style={inputStyles} value={casamentoData.dataTermo} onChange={(e) => setCasamentoData({...casamentoData, dataTermo: e.target.value})} />
            <span style={searchIconStyles}>🔍</span>
          </div>
        </div>
        <div>
          <label style={labelStyles}>Cidade (Registro)</label>
          <input type="text" style={inputStyles} value={casamentoData.cidade} onChange={(e) => setCasamentoData({...casamentoData, cidade: e.target.value})} />
        </div>
        <div>
          <label style={labelStyles}>Data Casamento</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input type="date" style={inputStyles} value={casamentoData.dataCasamento} onChange={(e) => setCasamentoData({...casamentoData, dataCasamento: e.target.value})} />
            <span style={searchIconStyles}>🔍</span>
          </div>
        </div>
        <div>
          <label style={labelStyles}>Tipo</label>
          <select style={inputStyles} value={casamentoData.tipo} onChange={(e) => setCasamentoData({...casamentoData, tipo: e.target.value})}>
            <option value="Civil">Civil</option>
            <option value="Religioso">Religioso</option>
          </select>
        </div>
      </div>

      {/* Linha 2 - Noivo */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 150px 120px 80px 1fr', gap: '12px', marginBottom: '12px' }}>
        <div>
          <label style={labelStyles}>Nome Noivo</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input type="text" style={inputStyles} value={casamentoData.nomeNoivo} onChange={(e) => setCasamentoData({...casamentoData, nomeNoivo: e.target.value})} />
            <span style={searchIconStyles}>🔍</span>
          </div>
        </div>
        <div>
          <label style={labelStyles}>CPF Noivo</label>
          <input type="text" style={inputStyles} value={casamentoData.cpfNoivo} onChange={(e) => setCasamentoData({...casamentoData, cpfNoivo: e.target.value})} />
        </div>
        <div>
          <label style={labelStyles}>Nasc. Noivo</label>
          <input type="date" style={inputStyles} value={casamentoData.nascNoivo} onChange={(e) => setCasamentoData({...casamentoData, nascNoivo: e.target.value})} />
        </div>
        <div>
          <label style={labelStyles}>Sexo</label>
          <select style={inputStyles} value={casamentoData.sexoNoivo} onChange={(e) => setCasamentoData({...casamentoData, sexoNoivo: e.target.value})}>
            <option value="M">M</option>
            <option value="F">F</option>
          </select>
        </div>
        <div>
          <label style={labelStyles}>Novo Nome Noivo</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input type="text" style={inputStyles} value={casamentoData.novoNomeNoivo} onChange={(e) => setCasamentoData({...casamentoData, novoNomeNoivo: e.target.value})} />
            <span style={searchIconStyles}>🔍</span>
          </div>
        </div>
      </div>

      {/* Linha 3 - Noiva */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 150px 120px 80px 1fr', gap: '12px', marginBottom: '12px' }}>
        <div>
          <label style={labelStyles}>Nome Noiva</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input type="text" style={inputStyles} value={casamentoData.nomeNoiva} onChange={(e) => setCasamentoData({...casamentoData, nomeNoiva: e.target.value})} />
            <span style={searchIconStyles}>🔍</span>
          </div>
        </div>
        <div>
          <label style={labelStyles}>CPF Noiva</label>
          <input type="text" style={inputStyles} value={casamentoData.cpfNoiva} onChange={(e) => setCasamentoData({...casamentoData, cpfNoiva: e.target.value})} />
        </div>
        <div>
          <label style={labelStyles}>Nasc. Noiva</label>
          <input type="date" style={inputStyles} value={casamentoData.nascNoiva} onChange={(e) => setCasamentoData({...casamentoData, nascNoiva: e.target.value})} />
        </div>
        <div>
          <label style={labelStyles}>Sexo</label>
          <select style={inputStyles} value={casamentoData.sexoNoiva} onChange={(e) => setCasamentoData({...casamentoData, sexoNoiva: e.target.value})}>
            <option value="F">F</option>
            <option value="M">M</option>
          </select>
        </div>
        <div>
          <label style={labelStyles}>Novo Nome Noiva</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input type="text" style={inputStyles} value={casamentoData.novoNomeNoiva} onChange={(e) => setCasamentoData({...casamentoData, novoNomeNoiva: e.target.value})} />
            <span style={searchIconStyles}>🔍</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderObito = () => (
    <div style={{ padding: '16px', maxHeight: '500px', overflowY: 'auto' }}>
      {/* Linha 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '100px 100px 100px 150px 200px', gap: '12px', marginBottom: '12px' }}>
        <div>
          <label style={labelStyles}>Aux. Livro</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input type="text" style={inputStyles} value={obitoData.auxLivro} onChange={(e) => setObitoData({...obitoData, auxLivro: e.target.value})} />
            <span style={searchIconStyles}>🔍</span>
          </div>
        </div>
        <div>
          <label style={labelStyles}>Folha(s)</label>
          <input type="text" style={inputStyles} value={obitoData.folhas} onChange={(e) => setObitoData({...obitoData, folhas: e.target.value})} />
        </div>
        <div>
          <label style={labelStyles}>Termo</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input type="text" style={inputStyles} value={obitoData.termo} onChange={(e) => setObitoData({...obitoData, termo: e.target.value})} />
            <span style={searchIconStyles}>🔍</span>
          </div>
        </div>
        <div>
          <label style={labelStyles}>Data Termo</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input type="date" style={inputStyles} value={obitoData.dataTermo} onChange={(e) => setObitoData({...obitoData, dataTermo: e.target.value})} />
            <span style={searchIconStyles}>🔍</span>
          </div>
        </div>
        <div>
          <label style={labelStyles}>Cidade (Registro)</label>
          <input type="text" style={inputStyles} value={obitoData.cidade} onChange={(e) => setObitoData({...obitoData, cidade: e.target.value})} />
        </div>
      </div>

      {/* Linha 2 - Dados do Óbito */}
      <div style={{ display: 'grid', gridTemplateColumns: '150px 150px 100px 180px 100px 120px', gap: '12px', marginBottom: '12px' }}>
        <div>
          <label style={labelStyles}>Data de Óbito</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input type="date" style={inputStyles} value={obitoData.dataObito} onChange={(e) => setObitoData({...obitoData, dataObito: e.target.value})} />
            <span style={searchIconStyles}>🔍</span>
          </div>
        </div>
        <div>
          <label style={labelStyles}>Data Nascimento</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input type="date" style={inputStyles} value={obitoData.dataNascimento} onChange={(e) => setObitoData({...obitoData, dataNascimento: e.target.value})} />
            <span style={searchIconStyles}>🔍</span>
          </div>
        </div>
        <div>
          <label style={labelStyles}>Idade</label>
          <input type="text" style={inputStyles} value={obitoData.idade} onChange={(e) => setObitoData({...obitoData, idade: e.target.value})} />
        </div>
        <div>
          <label style={labelStyles}>Duração Fetal (semanas)</label>
          <input type="text" style={inputStyles} value={obitoData.duracaoFetal} onChange={(e) => setObitoData({...obitoData, duracaoFetal: e.target.value})} />
        </div>
        <div>
          <label style={labelStyles}>Sexo</label>
          <select style={inputStyles} value={obitoData.sexo} onChange={(e) => setObitoData({...obitoData, sexo: e.target.value})}>
            <option value="ignorado">ignorado</option>
            <option value="M">Masculino</option>
            <option value="F">Feminino</option>
          </select>
        </div>
        <div>
          <label style={labelStyles}>Raça</label>
          <select style={inputStyles} value={obitoData.raca} onChange={(e) => setObitoData({...obitoData, raca: e.target.value})}>
            <option value="">Selecione</option>
            <option value="branca">Branca</option>
            <option value="preta">Preta</option>
            <option value="parda">Parda</option>
            <option value="amarela">Amarela</option>
            <option value="indigena">Indígena</option>
          </select>
        </div>
      </div>

      {/* Linha 3 - Dados do Falecido */}
      <div style={{ marginBottom: '12px' }}>
        <label style={labelStyles}>Nome Falecido(a)</label>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input type="text" style={inputStyles} value={obitoData.nomeFalecido} onChange={(e) => setObitoData({...obitoData, nomeFalecido: e.target.value})} />
          <span style={searchIconStyles}>🔍</span>
        </div>
      </div>

      {/* Linha 4 - Documentos */}
      <div style={{ display: 'grid', gridTemplateColumns: '150px 150px 150px 80px 80px', gap: '12px', marginBottom: '12px' }}>
        <div>
          <label style={labelStyles}>CPF</label>
          <input type="text" style={inputStyles} value={obitoData.cpf} onChange={(e) => setObitoData({...obitoData, cpf: e.target.value})} />
        </div>
        <div>
          <label style={labelStyles}>RG</label>
          <input type="text" style={inputStyles} value={obitoData.rg} onChange={(e) => setObitoData({...obitoData, rg: e.target.value})} />
        </div>
        <div>
          <label style={labelStyles}>Título Eleitor</label>
          <input type="text" style={inputStyles} value={obitoData.tituloEleitor} onChange={(e) => setObitoData({...obitoData, tituloEleitor: e.target.value})} />
        </div>
        <div>
          <label style={labelStyles}>Zona</label>
          <input type="text" style={inputStyles} value={obitoData.zona} onChange={(e) => setObitoData({...obitoData, zona: e.target.value})} />
        </div>
        <div>
          <label style={labelStyles}>Seção</label>
          <input type="text" style={inputStyles} value={obitoData.secao} onChange={(e) => setObitoData({...obitoData, secao: e.target.value})} />
        </div>
      </div>

      {/* Linha 5 - Naturalidade */}
      <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 120px 1fr', gap: '12px', marginBottom: '12px' }}>
        <div>
          <label style={labelStyles}>UF</label>
          <input type="text" style={inputStyles} value={obitoData.ufNatural} onChange={(e) => setObitoData({...obitoData, ufNatural: e.target.value})} />
        </div>
        <div>
          <label style={labelStyles}>Cidade Natural</label>
          <input type="text" style={inputStyles} value={obitoData.cidadeNatural} onChange={(e) => setObitoData({...obitoData, cidadeNatural: e.target.value})} />
        </div>
        <div>
          <label style={labelStyles}>IBGE</label>
          <input type="text" style={inputStyles} value={obitoData.ibgeNatural} onChange={(e) => setObitoData({...obitoData, ibgeNatural: e.target.value})} />
        </div>
        <div>
          <label style={labelStyles}>País Natural</label>
          <input type="text" style={inputStyles} value={obitoData.paisNatural} onChange={(e) => setObitoData({...obitoData, paisNatural: e.target.value})} />
        </div>
      </div>

      {/* Linha 6 - Endereço */}
      <div style={{ marginBottom: '12px' }}>
        <label style={labelStyles}>Endereço</label>
        <input type="text" style={inputStyles} value={obitoData.endereco} onChange={(e) => setObitoData({...obitoData, endereco: e.target.value})} />
      </div>

      {/* Linha 7 - Complemento Endereço */}
      <div style={{ display: 'grid', gridTemplateColumns: '100px 200px 120px 1fr', gap: '12px', marginBottom: '12px' }}>
        <div>
          <label style={labelStyles}>Número</label>
          <input type="text" style={inputStyles} value={obitoData.numero} onChange={(e) => setObitoData({...obitoData, numero: e.target.value})} />
        </div>
        <div>
          <label style={labelStyles}>Complemento</label>
          <input type="text" style={inputStyles} value={obitoData.complemento} onChange={(e) => setObitoData({...obitoData, complemento: e.target.value})} />
        </div>
        <div>
          <label style={labelStyles}>CEP</label>
          <input type="text" style={inputStyles} value={obitoData.cep} onChange={(e) => setObitoData({...obitoData, cep: e.target.value})} />
        </div>
        <div>
          <label style={labelStyles}>Bairro</label>
          <input type="text" style={inputStyles} value={obitoData.bairro} onChange={(e) => setObitoData({...obitoData, bairro: e.target.value})} />
        </div>
      </div>

      {/* Linha 8 - Cidade/UF */}
      <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 120px 1fr', gap: '12px', marginBottom: '12px' }}>
        <div>
          <label style={labelStyles}>UF</label>
          <input type="text" style={inputStyles} value={obitoData.uf} onChange={(e) => setObitoData({...obitoData, uf: e.target.value})} />
        </div>
        <div>
          <label style={labelStyles}>Cidade</label>
          <input type="text" style={inputStyles} value={obitoData.cidadeEndereco} onChange={(e) => setObitoData({...obitoData, cidadeEndereco: e.target.value})} />
        </div>
        <div>
          <label style={labelStyles}>IBGE</label>
          <input type="text" style={inputStyles} value={obitoData.ibgeEndereco} onChange={(e) => setObitoData({...obitoData, ibgeEndereco: e.target.value})} />
        </div>
        <div>
          <label style={labelStyles}>País</label>
          <input type="text" style={inputStyles} value={obitoData.pais} onChange={(e) => setObitoData({...obitoData, pais: e.target.value})} />
        </div>
      </div>

      {/* Linha 9 - Filiação */}
      <div style={{ marginBottom: '12px' }}>
        <label>
          <input type="checkbox" checked={obitoData.obitoDesconhecido} onChange={(e) => setObitoData({...obitoData, obitoDesconhecido: e.target.checked})} />
          <span style={{ marginLeft: '8px', fontSize: '13px' }}>Óbito de desconhecido?</span>
        </label>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={labelStyles}>Nome Mãe</label>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input type="text" style={inputStyles} value={obitoData.nomeMae} onChange={(e) => setObitoData({...obitoData, nomeMae: e.target.value})} />
          <span style={searchIconStyles}>🔍</span>
        </div>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={labelStyles}>Nome Pai</label>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input type="text" style={inputStyles} value={obitoData.nomePai} onChange={(e) => setObitoData({...obitoData, nomePai: e.target.value})} />
          <span style={searchIconStyles}>🔍</span>
        </div>
      </div>
    </div>
  )

  const renderProclamas = () => (
    <div style={{ padding: '16px' }}>
      {/* Linha 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '150px 120px 120px 150px 200px', gap: '12px', marginBottom: '12px' }}>
        <div>
          <label style={labelStyles}>Livro Proclamas</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input type="text" style={inputStyles} value={proclamasData.livroProcla} onChange={(e) => setProclamasData({...proclamasData, livroProcla: e.target.value})} />
            <span style={searchIconStyles}>🔍</span>
          </div>
        </div>
        <div>
          <label style={labelStyles}>Folha(s) Proclamas</label>
          <input type="text" style={inputStyles} value={proclamasData.folhasProcla} onChange={(e) => setProclamasData({...proclamasData, folhasProcla: e.target.value})} />
        </div>
        <div>
          <label style={labelStyles}>Edital Proclamas</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input type="text" style={inputStyles} value={proclamasData.editalProcla} onChange={(e) => setProclamasData({...proclamasData, editalProcla: e.target.value})} />
            <span style={searchIconStyles}>🔍</span>
          </div>
        </div>
        <div>
          <label style={labelStyles}>Data Edital Proclamas</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input type="date" style={inputStyles} value={proclamasData.dataEditalProcla} onChange={(e) => setProclamasData({...proclamasData, dataEditalProcla: e.target.value})} />
            <span style={searchIconStyles}>🔍</span>
          </div>
        </div>
        <div>
          <label style={labelStyles}>Tipo</label>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <label>
              <input type="radio" value="Interno" checked={proclamasData.tipo === 'Interno'} onChange={(e) => setProclamasData({...proclamasData, tipo: e.target.value})} />
              <span style={{ marginLeft: '4px' }}>Interno</span>
            </label>
            <label>
              <input type="radio" value="Externo" checked={proclamasData.tipo === 'Externo'} onChange={(e) => setProclamasData({...proclamasData, tipo: e.target.value})} />
              <span style={{ marginLeft: '4px' }}>Externo</span>
            </label>
          </div>
        </div>
      </div>

      {/* Linha 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <div>
          <label style={labelStyles}>Nome Noivo</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input type="text" style={inputStyles} value={proclamasData.nomeNoivo} onChange={(e) => setProclamasData({...proclamasData, nomeNoivo: e.target.value})} />
            <span style={searchIconStyles}>🔍</span>
          </div>
        </div>
        <div>
          <label style={labelStyles}>Nome Noiva</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input type="text" style={inputStyles} value={proclamasData.nomeNoiva} onChange={(e) => setProclamasData({...proclamasData, nomeNoiva: e.target.value})} />
            <span style={searchIconStyles}>🔍</span>
          </div>
        </div>
      </div>

      {/* Linha 3 */}
      <div style={{ display: 'grid', gridTemplateColumns: '120px 120px 120px 150px', gap: '12px', marginBottom: '12px' }}>
        <div>
          <label style={labelStyles}>Livro Cas.</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input type="text" style={inputStyles} value={proclamasData.livroCas} onChange={(e) => setProclamasData({...proclamasData, livroCas: e.target.value})} />
            <span style={searchIconStyles}>🔍</span>
          </div>
        </div>
        <div>
          <label style={labelStyles}>Folha(s) Cas.</label>
          <input type="text" style={inputStyles} value={proclamasData.folhasCas} onChange={(e) => setProclamasData({...proclamasData, folhasCas: e.target.value})} />
        </div>
        <div>
          <label style={labelStyles}>Termo Cas.</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input type="text" style={inputStyles} value={proclamasData.termoCas} onChange={(e) => setProclamasData({...proclamasData, termoCas: e.target.value})} />
            <span style={searchIconStyles}>🔍</span>
          </div>
        </div>
        <div>
          <label style={labelStyles}>Data do Termo Cas.</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input type="date" style={inputStyles} value={proclamasData.dataTermoCas} onChange={(e) => setProclamasData({...proclamasData, dataTermoCas: e.target.value})} />
            <span style={searchIconStyles}>🔍</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    if (activeSubTab === 'imagens') {
      return (
        <div style={{ 
          flex: 1, 
          backgroundColor: theme.background, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: theme.text
        }}>
          <p>Área de visualização de imagens</p>
        </div>
      )
    }

    // Renderizar formulário de cadastro
    switch (activeMainTab) {
      case 'nascimento':
        return renderNascimento()
      case 'casamento':
        return renderCasamento()
      case 'obito':
        return renderObito()
      case 'proclamas':
        return renderProclamas()
      default:
        return null
    }
  }

  const handleNovo = async () => {
    await modal.alert('Função Novo em desenvolvimento', 'Informação', 'ℹ️')
  }

  const handleGravar = async () => {
    await modal.alert('Função Gravar em desenvolvimento', 'Informação', 'ℹ️')
  }

  const handleExcluir = async () => {
    const confirmado = await modal.confirm('Tem certeza que deseja excluir este registro?', 'Confirmar Exclusão', '⚠️')
    if (confirmado) {
      await modal.alert('Registro excluído com sucesso!', 'Sucesso', '✅')
    }
  }

  return (
    <>
      <BasePage
        title="Índices"
        onClose={onClose}
        width="1200px"
        height="700px"
        minWidth="1200px"
        minHeight="700px"
        resizable={false}
        headerColor={headerColor}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0' }}>
          {/* Abas Principais */}
          <div style={{ display: 'flex', gap: '4px', padding: '8px 8px 0 8px', backgroundColor: theme.surface }}>
            <button onClick={() => { setActiveMainTab('nascimento'); setActiveSubTab('cadastro') }} style={mainTabStyles(activeMainTab === 'nascimento')}>
              👶 Nascimento
            </button>
            <button onClick={() => { setActiveMainTab('casamento'); setActiveSubTab('cadastro') }} style={mainTabStyles(activeMainTab === 'casamento')}>
              💍 Casamento
            </button>
            <button onClick={() => { setActiveMainTab('obito'); setActiveSubTab('cadastro') }} style={mainTabStyles(activeMainTab === 'obito')}>
              ⚰️ Óbito
            </button>
            <button onClick={() => { setActiveMainTab('proclamas'); setActiveSubTab('cadastro') }} style={mainTabStyles(activeMainTab === 'proclamas')}>
              📜 Edital de Proclamas
            </button>
          </div>

          {/* Sub-abas */}
          <div style={{ display: 'flex', gap: '8px', padding: '8px 16px', borderBottom: `1px solid ${theme.border}`, backgroundColor: theme.surface }}>
            <button onClick={() => setActiveSubTab('cadastro')} style={subTabStyles(activeSubTab === 'cadastro')}>
              Cadastro / Manutenção
            </button>
            <button onClick={() => setActiveSubTab('imagens')} style={subTabStyles(activeSubTab === 'imagens')}>
              {activeMainTab === 'nascimento' || activeMainTab === 'obito' ? 'Imagens' : 'Imagem'}
            </button>
          </div>

          {/* Área de Conteúdo */}
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Formulário */}
            <div style={{ flex: 1, overflowY: 'auto', backgroundColor: theme.background }}>
              {renderContent()}
              
              {/* Área branca central para visualização */}
              {activeSubTab === 'cadastro' && (
                <div style={{ 
                  margin: '16px', 
                  minHeight: '200px', 
                  backgroundColor: '#ffffff', 
                  border: `1px solid ${theme.border}`,
                  borderRadius: '4px'
                }}></div>
              )}
            </div>

            {/* Barra lateral de navegação */}
            <div style={{ 
              width: '120px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '8px', 
              padding: '16px 8px',
              backgroundColor: theme.surface,
              borderLeft: `1px solid ${theme.border}`
            }}>
              <button style={buttonStyles}>Primeira</button>
              <button style={buttonStyles}>Anterior</button>
              <button style={buttonStyles}>Próxima</button>
              <button style={buttonStyles}>Última</button>
              <button style={buttonStyles}>+ Zoom</button>
              <button style={buttonStyles}>- Zoom</button>
            </div>
          </div>

          {/* Botões de Ação */}
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            padding: '12px 16px', 
            borderTop: `1px solid ${theme.border}`,
            backgroundColor: theme.surface,
            justifyContent: 'center'
          }}>
            <button onClick={handleNovo} style={{ ...buttonStyles, display: 'flex', alignItems: 'center', gap: '6px' }}>
              📄 Novo
            </button>
            <button onClick={handleGravar} style={{ ...buttonStyles, display: 'flex', alignItems: 'center', gap: '6px' }}>
              ✅ Gravar
            </button>
            <button onClick={handleExcluir} style={{ ...buttonStyles, display: 'flex', alignItems: 'center', gap: '6px' }}>
              ❌ Excluir
            </button>
            <button onClick={onClose} style={{ ...buttonStyles, display: 'flex', alignItems: 'center', gap: '6px' }}>
              🔙 Retornar
            </button>
            <button style={{ ...buttonStyles, display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '20px' }}>
              🔓 Liberar CRC
            </button>
          </div>

          {/* Status Bar */}
          <div style={{ 
            padding: '6px 16px', 
            fontSize: '12px', 
            backgroundColor: theme.surface,
            borderTop: `1px solid ${theme.border}`,
            color: theme.text
          }}>
            {statusMessage}
          </div>
        </div>
      </BasePage>
      <modal.ModalComponent />
    </>
  )
}

