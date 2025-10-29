import { useState } from 'react'

// Base de cidades brasileiras (principais cidades por estado)
const cidadesPorEstado: Record<string, string[]> = {
  "SP": ["São Paulo", "Campinas", "Santos", "Ribeirão Preto", "São José dos Campos", "Sorocaba", "Santo André", "São Bernardo do Campo", "Osasco", "Guarulhos", "Mogi das Cruzes", "Diadema", "Piracicaba", "Bauru", "Jundiaí", "Franca", "São Vicente", "Praia Grande", "Limeira", "Suzano"],
  "RJ": ["Rio de Janeiro", "Niterói", "Duque de Caxias", "Nova Iguaçu", "São Gonçalo", "Campos dos Goytacazes", "Petrópolis", "Volta Redonda", "Belford Roxo", "Angra dos Reis", "Cabo Frio", "Macaé", "Teresópolis", "Resende", "Barra Mansa"],
  "MG": ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Betim", "Montes Claros", "Ribeirão das Neves", "Uberaba", "Governador Valadares", "Ipatinga", "Sete Lagoas", "Divinópolis", "Santa Luzia", "Ibirité", "Poços de Caldas"],
  "BA": ["Salvador", "Feira de Santana", "Vitória da Conquista", "Camaçari", "Itabuna", "Juazeiro", "Lauro de Freitas", "Ilhéus", "Jequié", "Teixeira de Freitas", "Alagoinhas", "Barreiras", "Paulo Afonso", "Simões Filho"],
  "PR": ["Curitiba", "Londrina", "Maringá", "Ponta Grossa", "Cascavel", "São José dos Pinhais", "Foz do Iguaçu", "Colombo", "Guarapuava", "Paranaguá", "Araucária", "Toledo", "Apucarana", "Pinhais"],
  "RS": ["Porto Alegre", "Caxias do Sul", "Pelotas", "Canoas", "Santa Maria", "Gravataí", "Viamão", "Novo Hamburgo", "São Leopoldo", "Rio Grande", "Alvorada", "Passo Fundo", "Sapucaia do Sul", "Uruguaiana"],
  "PE": ["Recife", "Jaboatão dos Guararapes", "Olinda", "Caruaru", "Petrolina", "Paulista", "Cabo de Santo Agostinho", "Camaragibe", "Garanhuns", "Vitória de Santo Antão", "Igarassu", "São Lourenço da Mata"],
  "CE": ["Fortaleza", "Caucaia", "Juazeiro do Norte", "Maracanaú", "Sobral", "Crato", "Itapipoca", "Maranguape", "Iguatu", "Quixadá", "Canindé", "Pacajus", "Aquiraz"],
  "GO": ["Goiânia", "Aparecida de Goiânia", "Anápolis", "Rio Verde", "Luziânia", "Águas Lindas de Goiás", "Valparaíso de Goiás", "Trindade", "Formosa", "Novo Gama", "Itumbiara", "Senador Canedo"],
  "SC": ["Florianópolis", "Joinville", "Blumenau", "São José", "Criciúma", "Chapecó", "Itajaí", "Jaraguá do Sul", "Lages", "Palhoça", "Balneário Camboriú", "Brusque", "Tubarão"],
  "PA": ["Belém", "Ananindeua", "Santarém", "Marabá", "Castanhal", "Parauapebas", "Itaituba", "Cametá", "Bragança", "Abaetetuba", "Marituba", "Altamira"],
  "AM": ["Manaus", "Parintins", "Itacoatiara", "Manacapuru", "Coari", "Tefé", "Tabatinga", "Maués", "Presidente Figueiredo"],
  "MA": ["São Luís", "Imperatriz", "São José de Ribamar", "Timon", "Caxias", "Codó", "Paço do Lumiar", "Açailândia", "Bacabal"],
  "DF": ["Brasília", "Taguatinga", "Ceilândia", "Samambaia", "Planaltina", "Águas Claras", "Gama", "Santa Maria", "Sobradinho"],
  "ES": ["Vitória", "Vila Velha", "Serra", "Cariacica", "Cachoeiro de Itapemirim", "Linhares", "São Mateus", "Colatina", "Guarapari"],
  "AL": ["Maceió", "Arapiraca", "Palmeira dos Índios", "Rio Largo", "Penedo", "União dos Palmares", "São Miguel dos Campos"],
  "SE": ["Aracaju", "Nossa Senhora do Socorro", "Lagarto", "Itabaiana", "Estância", "Tobias Barreto"],
  "RN": ["Natal", "Mossoró", "Parnamirim", "São Gonçalo do Amarante", "Macaíba", "Ceará-Mirim", "Caicó"],
  "PB": ["João Pessoa", "Campina Grande", "Santa Rita", "Patos", "Bayeux", "Sousa", "Cajazeiras"],
  "PI": ["Teresina", "Parnaíba", "Picos", "Piripiri", "Floriano", "Campo Maior"],
  "TO": ["Palmas", "Araguaína", "Gurupi", "Porto Nacional", "Paraíso do Tocantins"],
  "MT": ["Cuiabá", "Várzea Grande", "Rondonópolis", "Sinop", "Tangará da Serra", "Cáceres"],
  "MS": ["Campo Grande", "Dourados", "Três Lagoas", "Corumbá", "Ponta Porã", "Aquidauana"],
  "RO": ["Porto Velho", "Ji-Paraná", "Ariquemes", "Vilhena", "Cacoal", "Rolim de Moura"],
  "AC": ["Rio Branco", "Cruzeiro do Sul", "Sena Madureira", "Tarauacá"],
  "AP": ["Macapá", "Santana", "Laranjal do Jari", "Oiapoque"],
  "RR": ["Boa Vista", "Rorainópolis", "Caracaraí"]
}

export interface CidadeAutocompleteReturn {
  sugestoes: string[]
  showSugestoes: boolean
  sugestaoSelecionada: number
  buscarSugestoes: (termoBusca: string, uf: string) => void
  selecionarSugestao: (cidade: string, onSelect: (cidade: string, uf?: string) => void) => void
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, onSelect: (cidade: string, uf?: string) => void) => void
  limparSugestoes: () => void
  setSugestaoSelecionada: (index: number) => void
}

export function useCidadeAutocomplete(): CidadeAutocompleteReturn {
  const [sugestoes, setSugestoes] = useState<string[]>([])
  const [showSugestoes, setShowSugestoes] = useState(false)
  const [sugestaoSelecionada, setSugestaoSelecionada] = useState(-1)

  const buscarSugestoes = (termoBusca: string, uf: string = '') => {
    if (!termoBusca || termoBusca.length < 2) {
      setSugestoes([])
      setShowSugestoes(false)
      return
    }

    const termo = termoBusca.toLowerCase()
    let cidadesFiltradas: string[] = []

    // Se tem UF selecionado, buscar apenas naquele estado
    if (uf && cidadesPorEstado[uf]) {
      cidadesFiltradas = cidadesPorEstado[uf].filter(cidade =>
        cidade.toLowerCase().includes(termo)
      )
    } else {
      // Buscar em todos os estados
      Object.values(cidadesPorEstado).forEach(cidades => {
        const matches = cidades.filter(cidade =>
          cidade.toLowerCase().includes(termo)
        )
        cidadesFiltradas.push(...matches)
      })
    }

    // Remover duplicatas e limitar a 10 sugestões
    cidadesFiltradas = [...new Set(cidadesFiltradas)].slice(0, 10)
    
    setSugestoes(cidadesFiltradas)
    setShowSugestoes(cidadesFiltradas.length > 0)
    setSugestaoSelecionada(-1)
  }

  const selecionarSugestao = (cidade: string, onSelect: (cidade: string, uf?: string) => void) => {
    // Buscar UF da cidade selecionada
    let ufEncontrado = ''
    for (const [uf, cidades] of Object.entries(cidadesPorEstado)) {
      if (cidades.includes(cidade)) {
        ufEncontrado = uf
        break
      }
    }
    
    onSelect(cidade, ufEncontrado)
    setShowSugestoes(false)
    setSugestoes([])
    setSugestaoSelecionada(-1)
    console.log('✅ Cidade selecionada:', cidade, '| UF:', ufEncontrado)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, onSelect: (cidade: string, uf?: string) => void) => {
    if (!showSugestoes || sugestoes.length === 0) {
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSugestaoSelecionada(prev => 
          prev < sugestoes.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSugestaoSelecionada(prev => 
          prev > 0 ? prev - 1 : sugestoes.length - 1
        )
        break
      case 'Enter':
      case 'Tab':
        e.preventDefault()
        if (sugestaoSelecionada >= 0) {
          selecionarSugestao(sugestoes[sugestaoSelecionada], onSelect)
        } else if (sugestoes.length > 0) {
          selecionarSugestao(sugestoes[0], onSelect)
        }
        break
      case 'Escape':
        limparSugestoes()
        break
    }
  }

  const limparSugestoes = () => {
    setShowSugestoes(false)
    setSugestoes([])
    setSugestaoSelecionada(-1)
  }

  return {
    sugestoes,
    showSugestoes,
    sugestaoSelecionada,
    buscarSugestoes,
    selecionarSugestao,
    handleKeyDown,
    limparSugestoes,
    setSugestaoSelecionada
  }
}

