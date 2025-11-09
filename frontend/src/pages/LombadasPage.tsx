import React, { useState, useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { BasePage } from '../components/BasePage';
import { useAccessibility } from '../hooks/useAccessibility';

interface LombadaData {
  codigo: string; // Código único gerado automaticamente
  logo: string;
  responsavel: string;
  tipoLivro: string;
  letra: string;
  numero: string;
  dataInicio: string;
  dataFim: string;
  infoAdicional: string;
}

interface LombadasPageProps {
  onClose: () => void;
}

export default function LombadasPage({ onClose }: LombadasPageProps) {
  const { getTheme, currentTheme } = useAccessibility();
  const theme = getTheme();
  const headerColor = currentTheme === 'dark' ? theme.primary : '#008080';
  
  const [abaAtiva, setAbaAtiva] = useState<'cadastro' | 'impressao'>('cadastro');
  
  // Carregar configurações de impressão
  const [logo, setLogo] = useState<string>('');
  const [alturaLombada, setAlturaLombada] = useState<number>(10.5);
  const [larguraLombada, setLarguraLombada] = useState<number>(5.5);

  const PREVIEW_ALTURA_PX = 310;
  const PREVIEW_LARGURA_PX = 220;
  const MM_TO_PX = 3.7795275591;

  const [alturaLogo, setAlturaLogo] = useState<number>(3.5);
  const [alturaLetra, setAlturaLetra] = useState<number>(2.5);
  const [alturaNumero, setAlturaNumero] = useState<number>(2.5);
  const [alturaDatas, setAlturaDatas] = useState<number>(2.5);
  const [fonteLetra, setFonteLetra] = useState<number>(72);
  const [fonteNumero, setFonteNumero] = useState<number>(96);
  const [fonteDatas, setFonteDatas] = useState<number>(28);

  // Função para carregar configurações
  const carregarConfiguracoes = () => {
    try {
      const configImpressao = localStorage.getItem('config-impressao-livros');
      if (configImpressao) {
        const config = JSON.parse(configImpressao);
        setLogo(config.logoCartorio || '');
        setAlturaLombada(config.alturaLombada ?? 10.5);
        setLarguraLombada(config.larguraLombada ?? 5.5);
        setAlturaLogo(config.alturaLogo ?? 3.5);
        setAlturaLetra(config.alturaLetra ?? 2.5);
        setAlturaNumero(config.alturaNumero ?? 2.5);
        setAlturaDatas(config.alturaDatas ?? 2.5);
        setFonteLetra(config.fonteLetra ?? 72);
        setFonteNumero(config.fonteNumero ?? 96);
        setFonteDatas(config.fonteDatas ?? 28);
        console.log('✅ Configurações carregadas:', config);
      } else {
        setAlturaLombada(10.5);
        setLarguraLombada(5.5);
        setAlturaLogo(3.5);
        setAlturaLetra(2.5);
        setAlturaNumero(2.5);
        setAlturaDatas(2.5);
        setFonteLetra(72);
        setFonteNumero(96);
        setFonteDatas(28);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      setAlturaLombada(10.5);
      setLarguraLombada(5.5);
      setAlturaLogo(3.5);
      setAlturaLetra(2.5);
      setAlturaNumero(2.5);
      setAlturaDatas(2.5);
      setFonteLetra(72);
      setFonteNumero(96);
      setFonteDatas(28);
    }
  };

  // Carregar configurações ao montar o componente
  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  // Atualizar quando configurações mudarem
  useEffect(() => {
    const handleConfigUpdate = () => {
      console.log('🖼️ Configurações de impressão atualizadas! Recarregando...');
      carregarConfiguracoes();
    };

    window.addEventListener('config-impressao-updated', handleConfigUpdate);

    return () => {
      window.removeEventListener('config-impressao-updated', handleConfigUpdate);
    };
  }, []);
  
  // Função para carregar responsáveis das configurações
  const carregarResponsaveis = () => {
    try {
      const configGerais = localStorage.getItem('config-gerais-sistema');
      if (configGerais) {
        const config = JSON.parse(configGerais);
        const lista: string[] = [];
        
        // Adicionar oficial
        if (config.nomeOficial && config.nomeOficial.trim()) {
          lista.push(config.nomeOficial);
        }
        
        // Adicionar substitutos
        if (config.substitutos && Array.isArray(config.substitutos)) {
          config.substitutos.forEach((sub: string) => {
            if (sub && sub.trim()) {
              lista.push(sub);
            }
          });
        }
        
        // Se não há nenhum cadastrado, usar lista padrão
        if (lista.length === 0) {
          return ['Oficial do Cartório', 'Substituto do Cartório', 'Escrevente'];
        }
        
        return lista;
      }
    } catch (error) {
      console.error('Erro ao carregar responsáveis:', error);
    }
    
    // Fallback
    return ['Oficial do Cartório', 'Substituto do Cartório', 'Escrevente'];
  };

  // Estado para responsáveis
  const [responsaveis, setResponsaveis] = useState<string[]>(() => {
    const listaInicial = carregarResponsaveis();
    console.log('📚 Lombadas - Responsáveis carregados:', listaInicial);
    return listaInicial;
  });

  // Atualizar responsáveis quando configurações mudarem
  useEffect(() => {
    const handleConfigUpdate = () => {
      console.log('🔄 Configurações atualizadas! Recarregando responsáveis...');
      const novosResponsaveis = carregarResponsaveis();
      console.log('👥 Novos responsáveis:', novosResponsaveis);
      setResponsaveis(novosResponsaveis);
    };

    // Escutar evento de atualização de configurações
    window.addEventListener('config-gerais-updated', handleConfigUpdate);

    return () => {
      window.removeEventListener('config-gerais-updated', handleConfigUpdate);
    };
  }, []);
  const [tiposLivro] = useState([
    'Casamento',
    'Edital de Proclamas',
    'Livro E',
    'Nascimento',
    'Remissivo',
    'Óbito'
  ]);

  // Mapeamento de tipo de livro para letras disponíveis
  const tipoParaLetras: Record<string, string[]> = {
    'Casamento': ['B', 'B-AUX'],
    'Óbito': ['C', 'C-AUX'],
    'Nascimento': ['A'],
    'Livro E': ['E'],
    'Edital de Proclamas': ['D'],
    'Remissivo': ['Livro Transporte']
  };

  // Carregar lombadas salvas do localStorage
  const [lombadas, setLombadas] = useState<LombadaData[]>(() => {
    try {
      const lombadasSalvas = localStorage.getItem('lombadas-livros');
      if (lombadasSalvas) {
        const lombadas = JSON.parse(lombadasSalvas);
        // Migração: garantir campo código com valor padrão '0'
        return lombadas.map((lombada: any) => ({
          ...lombada,
          codigo: '0'
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar lombadas:', error);
    }
    return [];
  });

  // Função para gerar código fixo
  const gerarCodigo = () => '0';

  const [formData, setFormData] = useState<LombadaData>(() => ({
    codigo: gerarCodigo(),
    logo: '',
    responsavel: '',
    tipoLivro: '',
    letra: '',
    numero: '',
    dataInicio: '',
    dataFim: '',
    infoAdicional: ''
  }));

  const [letrasDisponiveis, setLetrasDisponiveis] = useState<string[]>([]);
  const [lombadaSelecionada, setLombadaSelecionada] = useState<number | null>(null);
  const [modoEdicao, setModoEdicao] = useState(false);

  // Salvar lombadas no localStorage sempre que mudarem
  useEffect(() => {
    try {
      localStorage.setItem('lombadas-livros', JSON.stringify(lombadas));
      console.log('💾 Lombadas salvas:', lombadas.length);
    } catch (error) {
      console.error('Erro ao salvar lombadas:', error);
    }
  }, [lombadas]);

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => {
      if (!printRef.current) {
        console.error('❌ printRef está nulo. Área de impressão não encontrada.');
        alert('Erro: Área de impressão não encontrada.');
        return null;
      }
      console.log('🖨️ Preparando impressão. Elemento:', printRef.current);
      return printRef.current;
    },
    documentTitle: 'Lombadas',
    onAfterPrint: () => {
      console.log('✅ Impressão concluída ou cancelada');
    },
    onPrintError: (error) => {
      console.error('❌ Erro na impressão:', error);
      alert('Erro ao iniciar a impressão. Verifique o console.');
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Se mudou o tipo de livro, atualiza as letras disponíveis
    if (name === 'tipoLivro') {
      const novasLetras = tipoParaLetras[value] || [];
      setLetrasDisponiveis(novasLetras);
      setFormData({ ...formData, [name]: value, letra: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const adicionarLombada = () => {
    if (!formData.letra || !formData.numero || !formData.dataInicio || !formData.dataFim) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }
    
    if (modoEdicao && lombadaSelecionada !== null) {
      // Atualizar lombada existente
      const novasLombadas = [...lombadas];
      novasLombadas[lombadaSelecionada] = { ...formData, logo };
      setLombadas(novasLombadas);
      setModoEdicao(false);
      setLombadaSelecionada(null);
    } else {
      // Adicionar nova lombada
      const novaLombada = { ...formData, logo };
      setLombadas([...lombadas, novaLombada]);
      setLombadaSelecionada(lombadas.length); // Seleciona a nova
    }
    
    limparFormulario();
    setAbaAtiva('impressao');
  };

  const removerLombada = (index: number) => {
    setLombadas(lombadas.filter((_, i) => i !== index));
    if (lombadaSelecionada === index) {
      setLombadaSelecionada(null);
    } else if (lombadaSelecionada !== null && lombadaSelecionada > index) {
      setLombadaSelecionada(lombadaSelecionada - 1);
    }
  };

  const selecionarLombada = (index: number) => {
    setLombadaSelecionada((prev) => (prev === index ? null : index));
    setModoEdicao(false);
  };

  const editarLombada = (index: number) => {
    const lombada = lombadas[index];
    setFormData({
      codigo: lombada.codigo || '0', // Mantém o código atual ou padrão
      logo: lombada.logo,
      responsavel: lombada.responsavel,
      tipoLivro: lombada.tipoLivro,
      letra: lombada.letra,
      numero: lombada.numero,
      dataInicio: lombada.dataInicio,
      dataFim: lombada.dataFim,
      infoAdicional: lombada.infoAdicional
    });
    setLetrasDisponiveis(tipoParaLetras[lombada.tipoLivro] || []);
    setLombadaSelecionada(index);
    setModoEdicao(true);
    setAbaAtiva('cadastro');
  };

  const limparFormulario = () => {
    setFormData({
      codigo: gerarCodigo(), // Gera novo código (padrão 0)
      logo: '',
      responsavel: '',
      tipoLivro: '',
      letra: '',
      numero: '',
      dataInicio: '',
      dataFim: '',
      infoAdicional: ''
    });
  };

  // Estilos dinâmicos baseados no tema
  const containerStyle: React.CSSProperties = {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: theme.surface,
    color: theme.text,
    borderRadius: '12px',
    boxShadow: currentTheme === 'dark'
      ? '0 2px 6px rgba(0,0,0,0.4)'
      : '0 2px 10px rgba(0,0,0,0.08)'
  };

  const outerWrapperStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.background,
    padding: '12px',
    borderRadius: '12px',
    overflow: 'auto',
    gap: '12px'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: theme.text
  };

  const formGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    marginBottom: '20px'
  };

  const fieldContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column'
  };

  const labelStyle: React.CSSProperties = {
    marginBottom: '8px',
    fontWeight: '500',
    color: theme.text,
    fontSize: '14px'
  };

  const inputStyle: React.CSSProperties = {
    padding: '10px',
    fontSize: '14px',
    border: `1px solid ${theme.border}`,
    borderRadius: '4px',
    outline: 'none',
    backgroundColor: theme.surface,
    color: theme.text
  };

  const arrowColor = currentTheme === 'dark' ? '%23FFFFFF' : '%23333333';
  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: 'pointer',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${arrowColor}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 8px center',
    backgroundSize: '16px',
    paddingRight: '32px'
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    resize: 'none' as const,
    minHeight: '80px'
  };

  const buttonContainerStyle: React.CSSProperties = {
    marginTop: '10px',
    display: 'flex',
    gap: '10px'
  };

  const totalSecaoMm = Math.max(alturaLogo + alturaLetra + alturaNumero + alturaDatas, 0.1);
  const previewHeightScale = PREVIEW_ALTURA_PX / totalSecaoMm;
  const previewHeights = {
    logo: alturaLogo * previewHeightScale,
    letra: alturaLetra * previewHeightScale,
    numero: alturaNumero * previewHeightScale,
    datas: alturaDatas * previewHeightScale
  };

  const cardBackground = theme.surface;
  const cardBorderColor = theme.border;
  const cardTextColor = theme.text;
  const cardShadow = currentTheme === 'dark'
    ? '0 4px 12px rgba(0,0,0,0.6)'
    : '0 4px 10px rgba(0,0,0,0.15)';

  const buttonStyle = (bgColor: string): React.CSSProperties => ({
    padding: '12px 24px',
    fontSize: '14px',
    backgroundColor: bgColor,
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'opacity 0.2s',
  });

  const previewListStyle: React.CSSProperties = {
    marginTop: '30px',
    padding: '20px',
    backgroundColor: theme.surface,
    borderRadius: '8px',
    border: `1px solid ${theme.border}`
  };

  const selectedItemBackground = currentTheme === 'dark'
    ? theme.background
    : 'rgba(255, 140, 0, 0.1)';
  const hoverItemBackground = currentTheme === 'dark'
    ? '#1e1e1e'
    : 'rgba(0, 0, 0, 0.05)';

  const tabContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    borderBottom: `2px solid ${theme.border}`
  };

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '500',
    backgroundColor: isActive ? theme.surface : 'transparent',
    color: isActive ? theme.primary : theme.text,
    border: 'none',
    borderBottom: isActive ? `3px solid ${theme.primary}` : '3px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginBottom: '-2px'
  });

  const renderPreview = () => {
    if (lombadaSelecionada === null || !lombadas[lombadaSelecionada]) {
      return (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          color: theme.textSecondary,
          fontSize: '16px'
        }}>
          👆 Clique em uma lombada abaixo para visualizar
        </div>
      );
    }

    const lombadaAtual = lombadas[lombadaSelecionada];

    return (
      <div style={{
        width: `${PREVIEW_LARGURA_PX}px`,
        height: `${PREVIEW_ALTURA_PX}px`,
        border: `3px solid ${cardBorderColor}`,
        borderRadius: '8px',
        backgroundColor: cardBackground,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: cardShadow,
        color: cardTextColor
      }}>
        <div style={{
          height: `${previewHeights.logo}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px'
        }}>
          {lombadaAtual.logo ? (
            <img 
              src={lombadaAtual.logo} 
              alt="Logo" 
              style={{
                maxWidth: '90%',
                maxHeight: '100%',
                objectFit: 'contain'
              }} 
            />
          ) : (
            <span style={{ fontSize: '12px', color: cardTextColor, opacity: 0.6 }}>Sem logo</span>
          )}
        </div>

        <div style={{
          height: `${previewHeights.letra}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: `${Math.max(previewHeights.letra * 0.8, 18)}px`,
          fontWeight: '700',
          color: cardTextColor
        }}>
          {lombadaAtual.letra}
        </div>

        <div style={{
          height: `${previewHeights.numero}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: `${Math.max(previewHeights.numero * 0.9, 22)}px`,
          fontWeight: '800',
          color: cardTextColor
        }}>
          {lombadaAtual.numero}
        </div>

        <div style={{
          height: `${previewHeights.datas}px`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          padding: '4px',
          fontSize: `${Math.max(previewHeights.datas * 0.35, 12)}px`,
          fontWeight: '600',
          color: cardTextColor,
          textAlign: 'center',
          lineHeight: 1.2
        }}>
          {lombadaAtual.infoAdicional && (
            <div style={{ fontSize: `${Math.max(previewHeights.datas * 0.25, 10)}px`, fontWeight: '600' }}>
              {lombadaAtual.infoAdicional.split('\n').map((linha: string, i: number) => (
                <div key={i}>{linha}</div>
              ))}
            </div>
          )}
          <div>
            {new Date(lombadaAtual.dataInicio).toLocaleDateString('pt-BR')}
          </div>
          <div style={{ fontSize: '0.8em', fontWeight: '400' }}>a</div>
          <div>
            {new Date(lombadaAtual.dataFim).toLocaleDateString('pt-BR')}
          </div>
        </div>
      </div>
    );
  };

  const renderLista = () => (
    <div style={previewListStyle}>
      <h3 style={{ color: theme.text, marginBottom: '15px' }}>📚 Lombadas Criadas ({lombadas.length})</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: lombadas.length > 4 ? '420px' : 'none', overflowY: lombadas.length > 4 ? 'auto' : 'visible', paddingRight: lombadas.length > 4 ? '6px' : '0' }}>
        {lombadas.map((lombada, index) => {
          const selecionada = lombadaSelecionada === index;
          return (
            <div 
              key={index} 
              onClick={() => selecionarLombada(index)}
              style={{
                padding: '12px 16px',
                border: `2px solid ${selecionada ? theme.primary : theme.border}`,
                borderRadius: '8px',
                backgroundColor: selecionada ? selectedItemBackground : theme.surface,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s',
                boxShadow: selecionada ? `0 0 0 3px ${theme.primary}33` : 'none'
              }}
              onMouseEnter={(e) => {
                if (!selecionada) {
                  e.currentTarget.style.backgroundColor = hoverItemBackground;
                }
              }}
              onMouseLeave={(e) => {
                if (!selecionada) {
                  e.currentTarget.style.backgroundColor = theme.surface;
                }
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                flex: 1
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: theme.text,
                  minWidth: '80px'
                }}>
                  {lombada.letra} {lombada.numero}
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  flex: 1
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: theme.text
                  }}>
                    {lombada.tipoLivro}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: theme.textSecondary
                  }}>
                    {new Date(lombada.dataInicio).toLocaleDateString('pt-BR')} a {new Date(lombada.dataFim).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    editarLombada(index);
                  }} 
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    backgroundColor: theme.accent,
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  ✏️ Editar
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    removerLombada(index);
                  }} 
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    backgroundColor: theme.error,
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  🗑️ Remover
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const formWrapperStyle: React.CSSProperties = {
    backgroundColor: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: '12px',
    padding: '20px'
  };

  return (
    <BasePage
      title="Criação de Lombadas de Livros"
      onClose={onClose}
      width="1200px"
      height="800px"
      resizable={false}
      headerColor={headerColor}
    >
      <div style={outerWrapperStyle}>
        <div style={containerStyle}>
          {/* Abas */}
          <div style={tabContainerStyle}>
            <button 
              style={tabStyle(abaAtiva === 'cadastro')}
              onClick={() => setAbaAtiva('cadastro')}
            >
              📝 Cadastro
            </button>
            <button 
              style={tabStyle(abaAtiva === 'impressao')}
              onClick={() => setAbaAtiva('impressao')}
            >
              🖨️ Impressão
            </button>
          </div>

          {/* Conteúdo da aba Cadastro */}
          {abaAtiva === 'cadastro' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={formWrapperStyle}>
                <div style={formGridStyle}>
          {/* Código (Somente Leitura) */}
          <div style={{ ...fieldContainerStyle, gridColumn: 'span 2' }}>
            <label style={labelStyle}>🔒 Código:</label>
            <input
              type="text"
              value={formData.codigo}
              readOnly
              disabled
              style={{
                ...inputStyle,
                backgroundColor: theme.surface,
                cursor: 'not-allowed',
                fontWeight: 'bold',
                color: theme.primary,
                border: `2px solid ${theme.primary}`
              }}
              title="Código gerado automaticamente - não editável"
            />
          </div>

          {/* Responsável */}
          <div style={{ ...fieldContainerStyle, gridColumn: 'span 2' }}>
            <label style={labelStyle}>Responsável:</label>
            <select
              name="responsavel"
              value={formData.responsavel}
              onChange={handleInputChange}
              style={selectStyle}
            >
              <option value="">Selecione...</option>
              {responsaveis.map((resp) => (
                <option key={resp} value={resp}>{resp}</option>
              ))}
            </select>
          </div>

          {/* Tipo de Livro */}
          <div style={{ ...fieldContainerStyle, gridColumn: 'span 2' }}>
            <label style={labelStyle}>Tipo de Livro:</label>
            <select
              name="tipoLivro"
              value={formData.tipoLivro}
              onChange={handleInputChange}
              style={selectStyle}
            >
              <option value="">Selecione...</option>
              {tiposLivro.map((tipo) => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>

          {/* Letra */}
          <div style={{ ...fieldContainerStyle, gridColumn: 'span 1' }}>
            <label style={labelStyle}>Letra / Nomenclatura:</label>
            <select
              name="letra"
              value={formData.letra}
              onChange={handleInputChange}
              style={selectStyle}
              disabled={letrasDisponiveis.length === 0}
            >
              <option value="">Selecione...</option>
              {letrasDisponiveis.map((letraOpt) => (
                <option key={letraOpt} value={letraOpt}>{letraOpt}</option>
              ))}
            </select>
          </div>

          {/* Número */}
          <div style={{ ...fieldContainerStyle, gridColumn: 'span 1' }}>
            <label style={labelStyle}>Número: *</label>
            <input
              type="text"
              name="numero"
              value={formData.numero}
              onChange={handleInputChange}
              style={inputStyle}
              placeholder="383, 607..."
            />
          </div>

          {/* Data Início */}
          <div style={{ ...fieldContainerStyle, gridColumn: 'span 2' }}>
            <label style={labelStyle}>Data Início: *</label>
            <input
              type="date"
              name="dataInicio"
              value={formData.dataInicio}
              onChange={handleInputChange}
              style={inputStyle}
            />
          </div>

          {/* Data Fim */}
          <div style={{ ...fieldContainerStyle, gridColumn: 'span 2' }}>
            <label style={labelStyle}>Data Fim: *</label>
            <input
              type="date"
              name="dataFim"
              value={formData.dataFim}
              onChange={handleInputChange}
              style={inputStyle}
            />
          </div>
        </div>

            <div style={buttonContainerStyle}>
              <button onClick={adicionarLombada} style={buttonStyle(theme.success)}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                {modoEdicao ? '💾 Salvar Alterações' : '📝 Gerar Lombada'}
              </button>
              <button onClick={() => {
                limparFormulario();
                setModoEdicao(false);
                setLombadaSelecionada(null);
              }} style={buttonStyle(theme.border)}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Limpar Formulário
              </button>
            </div>
            </div>
          </div>
        )}

        {/* Conteúdo da aba Impressão */}
        {abaAtiva === 'impressao' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {lombadas.length > 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}>
                <div style={{
                  padding: '20px',
                  backgroundColor: theme.surface,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '12px'
                }}>
                  <h3 style={{ color: theme.text, marginBottom: '15px', textAlign: 'center' }}>
                    📋 Preview da Lombada {lombadaSelecionada !== null ? `(${lombadaSelecionada + 1}/${lombadas.length})` : ''}
                  </h3>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    {renderPreview()}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (lombadas.length === 0) {
                        alert('⚠️ Não há lombadas para imprimir!');
                        return;
                      }
                      handlePrint();
                    }} 
                    style={{
                      padding: '12px 24px',
                      fontSize: '16px',
                      backgroundColor: theme.accent,
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'opacity 0.2s',
                      boxShadow: cardShadow
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.85';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                  >
                    🖨️ Imprimir Todas
                  </button>
                </div>

                {renderLista()}
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '60px 20px', 
                color: theme.text,
                fontSize: '16px'
              }}>
                <p>📚 Nenhuma lombada cadastrada ainda.</p>
                <p style={{ marginTop: '10px', fontSize: '14px', opacity: 0.7 }}>
                  Vá para a aba "Cadastro" para gerar lombadas.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      </div>

      {/* Área de Impressão (oculta mas renderizada) */}
      <div style={{ 
        position: 'absolute',
        left: '-9999px',
        top: 0
      }}>
        <div ref={printRef}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '15px',
            padding: '20px'
          }}>
            {lombadas.map((lombada, index) => {
              const larguraPx = Math.max(5.5, larguraLombada) * MM_TO_PX;
              const alturaPx = Math.max(10.5, alturaLombada) * MM_TO_PX;
              const alturaLogoPx = Math.max(0, alturaLogo) * MM_TO_PX;
              const alturaLetraPx = Math.max(0, alturaLetra) * MM_TO_PX;
              const alturaNumeroPx = Math.max(0, alturaNumero) * MM_TO_PX;
              const alturaDatasPx = Math.max(0, alturaDatas) * MM_TO_PX;
              const totalSecoesPx = alturaLogoPx + alturaLetraPx + alturaNumeroPx + alturaDatasPx;
              const ajusteFinalPx = Math.max(alturaPx - totalSecoesPx, 0);

              return (
              <div key={index} style={{
                width: `${larguraPx}px`,
                height: `${alturaPx}px`,
                border: '2px solid #000',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#fff',
                pageBreakInside: 'avoid',
                overflow: 'hidden'
              }}>
                {/* Logo */}
                <div style={{
                  height: `${alturaLogoPx}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px'
                }}>
                  {lombada.logo ? (
                    <img src={lombada.logo} alt="Logo" style={{
                      maxWidth: '90%',
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }} />
                  ) : null}
                </div>

                {/* Letra */}
                <div style={{
                  height: `${alturaLetraPx}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: `${fonteLetra}px`,
                  fontWeight: 700,
                  color: '#000'
                }}>
                  {lombada.letra}
                </div>

                {/* Número */}
                <div style={{
                  height: `${alturaNumeroPx}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: `${fonteNumero}px`,
                  fontWeight: 800,
                  color: '#000'
                }}>
                  {lombada.numero}
                </div>

                {/* Datas e info adicional */}
                <div style={{
                  height: `${alturaDatasPx + ajusteFinalPx}px`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px',
                  fontSize: `${fonteDatas}px`,
                  fontWeight: 600,
                  color: '#000',
                  textAlign: 'center',
                  lineHeight: 1.2
                }}>
                  {lombada.infoAdicional && (
                    <div style={{ fontSize: `${Math.max(fonteDatas * 0.8, 10)}px`, fontWeight: 600 }}>
                      {lombada.infoAdicional.split('\n').map((linha, i) => (
                        <div key={i}>{linha}</div>
                      ))}
                    </div>
                  )}
                  <div>{new Date(lombada.dataInicio).toLocaleDateString('pt-BR')}</div>
                  <div style={{ fontSize: `${Math.max(fonteDatas * 0.7, 10)}px`, fontWeight: 400 }}>a</div>
                  <div>{new Date(lombada.dataFim).toLocaleDateString('pt-BR')}</div>
                </div>
              </div>
            );
            })}
          </div>
        </div>
      </div>
    </BasePage>
  );
}