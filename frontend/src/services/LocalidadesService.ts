// Serviço para buscar localidades (cidades, estados, países)

export interface Estado {
  id: number
  sigla: string
  nome: string
}

export interface Cidade {
  id: number
  nome: string
  microrregiao?: {
    mesorregiao?: {
      UF?: {
        sigla: string
        nome: string
      }
    }
  }
}

export interface Pais {
  nome: string
  codigo: string
  nomeIngles?: string
}

export class LocalidadesService {
  // API do IBGE para dados do Brasil
  private static readonly IBGE_BASE_URL = 'https://servicodados.ibge.gov.br/api/v1'
  
  /**
   * Busca todos os estados do Brasil
   */
  static async buscarEstados(): Promise<Estado[]> {
    try {
      const response = await fetch(`${this.IBGE_BASE_URL}/localidades/estados?orderBy=nome`)
      
      if (!response.ok) {
        throw new Error('Erro ao buscar estados')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Erro ao buscar estados:', error)
      throw error
    }
  }

  /**
   * Busca todas as cidades de um estado específico
   */
  static async buscarCidadesPorEstado(uf: string): Promise<Cidade[]> {
    try {
      const response = await fetch(
        `${this.IBGE_BASE_URL}/localidades/estados/${uf}/municipios?orderBy=nome`
      )
      
      if (!response.ok) {
        throw new Error('Erro ao buscar cidades')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Erro ao buscar cidades:', error)
      throw error
    }
  }

  /**
   * Busca todas as cidades do Brasil
   */
  static async buscarTodasCidades(): Promise<Cidade[]> {
    try {
      const response = await fetch(
        `${this.IBGE_BASE_URL}/localidades/municipios?orderBy=nome`
      )
      
      if (!response.ok) {
        throw new Error('Erro ao buscar cidades')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Erro ao buscar cidades:', error)
      throw error
    }
  }

  /**
   * Busca cidades por nome (busca parcial)
   */
  static async buscarCidadesPorNome(nome: string, uf?: string): Promise<Cidade[]> {
    try {
      let url = `${this.IBGE_BASE_URL}/localidades/municipios?orderBy=nome`
      
      if (uf) {
        url = `${this.IBGE_BASE_URL}/localidades/estados/${uf}/municipios?orderBy=nome`
      }

      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Erro ao buscar cidades')
      }

      const data: Cidade[] = await response.json()
      
      // Filtra cidades que contêm o nome buscado
      return data.filter(cidade => 
        cidade.nome.toLowerCase().includes(nome.toLowerCase())
      )
    } catch (error) {
      console.error('Erro ao buscar cidades:', error)
      throw error
    }
  }

  /**
   * Lista de países do mundo (lista estática com os principais países)
   */
  static buscarPaises(): Pais[] {
    return [
      { nome: 'AFEGANISTÃO', codigo: 'AF', nomeIngles: 'Afghanistan' },
      { nome: 'ÁFRICA DO SUL', codigo: 'ZA', nomeIngles: 'South Africa' },
      { nome: 'ALBÂNIA', codigo: 'AL', nomeIngles: 'Albania' },
      { nome: 'ALEMANHA', codigo: 'DE', nomeIngles: 'Germany' },
      { nome: 'ANDORRA', codigo: 'AD', nomeIngles: 'Andorra' },
      { nome: 'ANGOLA', codigo: 'AO', nomeIngles: 'Angola' },
      { nome: 'ARÁBIA SAUDITA', codigo: 'SA', nomeIngles: 'Saudi Arabia' },
      { nome: 'ARGÉLIA', codigo: 'DZ', nomeIngles: 'Algeria' },
      { nome: 'ARGENTINA', codigo: 'AR', nomeIngles: 'Argentina' },
      { nome: 'ARMÊNIA', codigo: 'AM', nomeIngles: 'Armenia' },
      { nome: 'AUSTRÁLIA', codigo: 'AU', nomeIngles: 'Australia' },
      { nome: 'ÁUSTRIA', codigo: 'AT', nomeIngles: 'Austria' },
      { nome: 'AZERBAIJÃO', codigo: 'AZ', nomeIngles: 'Azerbaijan' },
      { nome: 'BAHAMAS', codigo: 'BS', nomeIngles: 'Bahamas' },
      { nome: 'BANGLADESH', codigo: 'BD', nomeIngles: 'Bangladesh' },
      { nome: 'BARBADOS', codigo: 'BB', nomeIngles: 'Barbados' },
      { nome: 'BAHREIN', codigo: 'BH', nomeIngles: 'Bahrain' },
      { nome: 'BÉLGICA', codigo: 'BE', nomeIngles: 'Belgium' },
      { nome: 'BELIZE', codigo: 'BZ', nomeIngles: 'Belize' },
      { nome: 'BENIN', codigo: 'BJ', nomeIngles: 'Benin' },
      { nome: 'BIELORRÚSSIA', codigo: 'BY', nomeIngles: 'Belarus' },
      { nome: 'BOLÍVIA', codigo: 'BO', nomeIngles: 'Bolivia' },
      { nome: 'BÓSNIA E HERZEGOVINA', codigo: 'BA', nomeIngles: 'Bosnia and Herzegovina' },
      { nome: 'BOTSUANA', codigo: 'BW', nomeIngles: 'Botswana' },
      { nome: 'BRASIL', codigo: 'BR', nomeIngles: 'Brazil' },
      { nome: 'BRUNEI', codigo: 'BN', nomeIngles: 'Brunei' },
      { nome: 'BULGÁRIA', codigo: 'BG', nomeIngles: 'Bulgaria' },
      { nome: 'BURKINA FASO', codigo: 'BF', nomeIngles: 'Burkina Faso' },
      { nome: 'BURUNDI', codigo: 'BI', nomeIngles: 'Burundi' },
      { nome: 'BUTÃO', codigo: 'BT', nomeIngles: 'Bhutan' },
      { nome: 'CABO VERDE', codigo: 'CV', nomeIngles: 'Cape Verde' },
      { nome: 'CAMARÕES', codigo: 'CM', nomeIngles: 'Cameroon' },
      { nome: 'CAMBOJA', codigo: 'KH', nomeIngles: 'Cambodia' },
      { nome: 'CANADÁ', codigo: 'CA', nomeIngles: 'Canada' },
      { nome: 'CATAR', codigo: 'QA', nomeIngles: 'Qatar' },
      { nome: 'CAZAQUISTÃO', codigo: 'KZ', nomeIngles: 'Kazakhstan' },
      { nome: 'CHADE', codigo: 'TD', nomeIngles: 'Chad' },
      { nome: 'CHILE', codigo: 'CL', nomeIngles: 'Chile' },
      { nome: 'CHINA', codigo: 'CN', nomeIngles: 'China' },
      { nome: 'CHIPRE', codigo: 'CY', nomeIngles: 'Cyprus' },
      { nome: 'COLÔMBIA', codigo: 'CO', nomeIngles: 'Colombia' },
      { nome: 'COMORES', codigo: 'KM', nomeIngles: 'Comoros' },
      { nome: 'CONGO', codigo: 'CG', nomeIngles: 'Congo' },
      { nome: 'COREIA DO NORTE', codigo: 'KP', nomeIngles: 'North Korea' },
      { nome: 'COREIA DO SUL', codigo: 'KR', nomeIngles: 'South Korea' },
      { nome: 'COSTA DO MARFIM', codigo: 'CI', nomeIngles: 'Ivory Coast' },
      { nome: 'COSTA RICA', codigo: 'CR', nomeIngles: 'Costa Rica' },
      { nome: 'CROÁCIA', codigo: 'HR', nomeIngles: 'Croatia' },
      { nome: 'CUBA', codigo: 'CU', nomeIngles: 'Cuba' },
      { nome: 'DINAMARCA', codigo: 'DK', nomeIngles: 'Denmark' },
      { nome: 'DJIBUTI', codigo: 'DJ', nomeIngles: 'Djibouti' },
      { nome: 'DOMINICA', codigo: 'DM', nomeIngles: 'Dominica' },
      { nome: 'EGITO', codigo: 'EG', nomeIngles: 'Egypt' },
      { nome: 'EL SALVADOR', codigo: 'SV', nomeIngles: 'El Salvador' },
      { nome: 'EMIRADOS ÁRABES UNIDOS', codigo: 'AE', nomeIngles: 'United Arab Emirates' },
      { nome: 'EQUADOR', codigo: 'EC', nomeIngles: 'Ecuador' },
      { nome: 'ERITREIA', codigo: 'ER', nomeIngles: 'Eritrea' },
      { nome: 'ESLOVÁQUIA', codigo: 'SK', nomeIngles: 'Slovakia' },
      { nome: 'ESLOVÊNIA', codigo: 'SI', nomeIngles: 'Slovenia' },
      { nome: 'ESPANHA', codigo: 'ES', nomeIngles: 'Spain' },
      { nome: 'ESTADOS UNIDOS', codigo: 'US', nomeIngles: 'United States' },
      { nome: 'ESTÔNIA', codigo: 'EE', nomeIngles: 'Estonia' },
      { nome: 'ETIÓPIA', codigo: 'ET', nomeIngles: 'Ethiopia' },
      { nome: 'FIJI', codigo: 'FJ', nomeIngles: 'Fiji' },
      { nome: 'FILIPINAS', codigo: 'PH', nomeIngles: 'Philippines' },
      { nome: 'FINLÂNDIA', codigo: 'FI', nomeIngles: 'Finland' },
      { nome: 'FRANÇA', codigo: 'FR', nomeIngles: 'France' },
      { nome: 'GABÃO', codigo: 'GA', nomeIngles: 'Gabon' },
      { nome: 'GÂMBIA', codigo: 'GM', nomeIngles: 'Gambia' },
      { nome: 'GANA', codigo: 'GH', nomeIngles: 'Ghana' },
      { nome: 'GEÓRGIA', codigo: 'GE', nomeIngles: 'Georgia' },
      { nome: 'GRANADA', codigo: 'GD', nomeIngles: 'Grenada' },
      { nome: 'GRÉCIA', codigo: 'GR', nomeIngles: 'Greece' },
      { nome: 'GUATEMALA', codigo: 'GT', nomeIngles: 'Guatemala' },
      { nome: 'GUIANA', codigo: 'GY', nomeIngles: 'Guyana' },
      { nome: 'GUINÉ', codigo: 'GN', nomeIngles: 'Guinea' },
      { nome: 'GUINÉ-BISSAU', codigo: 'GW', nomeIngles: 'Guinea-Bissau' },
      { nome: 'GUINÉ EQUATORIAL', codigo: 'GQ', nomeIngles: 'Equatorial Guinea' },
      { nome: 'HAITI', codigo: 'HT', nomeIngles: 'Haiti' },
      { nome: 'HONDURAS', codigo: 'HN', nomeIngles: 'Honduras' },
      { nome: 'HUNGRIA', codigo: 'HU', nomeIngles: 'Hungary' },
      { nome: 'IÊMEN', codigo: 'YE', nomeIngles: 'Yemen' },
      { nome: 'ÍNDIA', codigo: 'IN', nomeIngles: 'India' },
      { nome: 'INDONÉSIA', codigo: 'ID', nomeIngles: 'Indonesia' },
      { nome: 'IRÃ', codigo: 'IR', nomeIngles: 'Iran' },
      { nome: 'IRAQUE', codigo: 'IQ', nomeIngles: 'Iraq' },
      { nome: 'IRLANDA', codigo: 'IE', nomeIngles: 'Ireland' },
      { nome: 'ISLÂNDIA', codigo: 'IS', nomeIngles: 'Iceland' },
      { nome: 'ISRAEL', codigo: 'IL', nomeIngles: 'Israel' },
      { nome: 'ITÁLIA', codigo: 'IT', nomeIngles: 'Italy' },
      { nome: 'JAMAICA', codigo: 'JM', nomeIngles: 'Jamaica' },
      { nome: 'JAPÃO', codigo: 'JP', nomeIngles: 'Japan' },
      { nome: 'JORDÂNIA', codigo: 'JO', nomeIngles: 'Jordan' },
      { nome: 'KIRIBATI', codigo: 'KI', nomeIngles: 'Kiribati' },
      { nome: 'KUWAIT', codigo: 'KW', nomeIngles: 'Kuwait' },
      { nome: 'LAOS', codigo: 'LA', nomeIngles: 'Laos' },
      { nome: 'LESOTO', codigo: 'LS', nomeIngles: 'Lesotho' },
      { nome: 'LETÔNIA', codigo: 'LV', nomeIngles: 'Latvia' },
      { nome: 'LÍBANO', codigo: 'LB', nomeIngles: 'Lebanon' },
      { nome: 'LIBÉRIA', codigo: 'LR', nomeIngles: 'Liberia' },
      { nome: 'LÍBIA', codigo: 'LY', nomeIngles: 'Libya' },
      { nome: 'LIECHTENSTEIN', codigo: 'LI', nomeIngles: 'Liechtenstein' },
      { nome: 'LITUÂNIA', codigo: 'LT', nomeIngles: 'Lithuania' },
      { nome: 'LUXEMBURGO', codigo: 'LU', nomeIngles: 'Luxembourg' },
      { nome: 'MACEDÔNIA DO NORTE', codigo: 'MK', nomeIngles: 'North Macedonia' },
      { nome: 'MADAGASCAR', codigo: 'MG', nomeIngles: 'Madagascar' },
      { nome: 'MALÁSIA', codigo: 'MY', nomeIngles: 'Malaysia' },
      { nome: 'MALAWI', codigo: 'MW', nomeIngles: 'Malawi' },
      { nome: 'MALDIVAS', codigo: 'MV', nomeIngles: 'Maldives' },
      { nome: 'MALI', codigo: 'ML', nomeIngles: 'Mali' },
      { nome: 'MALTA', codigo: 'MT', nomeIngles: 'Malta' },
      { nome: 'MARROCOS', codigo: 'MA', nomeIngles: 'Morocco' },
      { nome: 'MAURÍCIO', codigo: 'MU', nomeIngles: 'Mauritius' },
      { nome: 'MAURITÂNIA', codigo: 'MR', nomeIngles: 'Mauritania' },
      { nome: 'MÉXICO', codigo: 'MX', nomeIngles: 'Mexico' },
      { nome: 'MIANMAR', codigo: 'MM', nomeIngles: 'Myanmar' },
      { nome: 'MICRONÉSIA', codigo: 'FM', nomeIngles: 'Micronesia' },
      { nome: 'MOÇAMBIQUE', codigo: 'MZ', nomeIngles: 'Mozambique' },
      { nome: 'MOLDÁVIA', codigo: 'MD', nomeIngles: 'Moldova' },
      { nome: 'MÔNACO', codigo: 'MC', nomeIngles: 'Monaco' },
      { nome: 'MONGÓLIA', codigo: 'MN', nomeIngles: 'Mongolia' },
      { nome: 'MONTENEGRO', codigo: 'ME', nomeIngles: 'Montenegro' },
      { nome: 'NAMÍBIA', codigo: 'NA', nomeIngles: 'Namibia' },
      { nome: 'NAURU', codigo: 'NR', nomeIngles: 'Nauru' },
      { nome: 'NEPAL', codigo: 'NP', nomeIngles: 'Nepal' },
      { nome: 'NICARÁGUA', codigo: 'NI', nomeIngles: 'Nicaragua' },
      { nome: 'NÍGER', codigo: 'NE', nomeIngles: 'Niger' },
      { nome: 'NIGÉRIA', codigo: 'NG', nomeIngles: 'Nigeria' },
      { nome: 'NORUEGA', codigo: 'NO', nomeIngles: 'Norway' },
      { nome: 'NOVA ZELÂNDIA', codigo: 'NZ', nomeIngles: 'New Zealand' },
      { nome: 'OMÃ', codigo: 'OM', nomeIngles: 'Oman' },
      { nome: 'PAÍSES BAIXOS', codigo: 'NL', nomeIngles: 'Netherlands' },
      { nome: 'PALAU', codigo: 'PW', nomeIngles: 'Palau' },
      { nome: 'PANAMÁ', codigo: 'PA', nomeIngles: 'Panama' },
      { nome: 'PAPUA-NOVA GUINÉ', codigo: 'PG', nomeIngles: 'Papua New Guinea' },
      { nome: 'PAQUISTÃO', codigo: 'PK', nomeIngles: 'Pakistan' },
      { nome: 'PARAGUAI', codigo: 'PY', nomeIngles: 'Paraguay' },
      { nome: 'PERU', codigo: 'PE', nomeIngles: 'Peru' },
      { nome: 'POLÔNIA', codigo: 'PL', nomeIngles: 'Poland' },
      { nome: 'PORTUGAL', codigo: 'PT', nomeIngles: 'Portugal' },
      { nome: 'QUÊNIA', codigo: 'KE', nomeIngles: 'Kenya' },
      { nome: 'QUIRGUISTÃO', codigo: 'KG', nomeIngles: 'Kyrgyzstan' },
      { nome: 'REINO UNIDO', codigo: 'GB', nomeIngles: 'United Kingdom' },
      { nome: 'REPÚBLICA CENTRO-AFRICANA', codigo: 'CF', nomeIngles: 'Central African Republic' },
      { nome: 'REPÚBLICA CHECA', codigo: 'CZ', nomeIngles: 'Czech Republic' },
      { nome: 'REPÚBLICA DEMOCRÁTICA DO CONGO', codigo: 'CD', nomeIngles: 'Democratic Republic of the Congo' },
      { nome: 'REPÚBLICA DOMINICANA', codigo: 'DO', nomeIngles: 'Dominican Republic' },
      { nome: 'ROMÊNIA', codigo: 'RO', nomeIngles: 'Romania' },
      { nome: 'RUANDA', codigo: 'RW', nomeIngles: 'Rwanda' },
      { nome: 'RÚSSIA', codigo: 'RU', nomeIngles: 'Russia' },
      { nome: 'SAMOA', codigo: 'WS', nomeIngles: 'Samoa' },
      { nome: 'SAN MARINO', codigo: 'SM', nomeIngles: 'San Marino' },
      { nome: 'SANTA LÚCIA', codigo: 'LC', nomeIngles: 'Saint Lucia' },
      { nome: 'SÃO CRISTÓVÃO E NÉVIS', codigo: 'KN', nomeIngles: 'Saint Kitts and Nevis' },
      { nome: 'SÃO TOMÉ E PRÍNCIPE', codigo: 'ST', nomeIngles: 'Sao Tome and Principe' },
      { nome: 'SÃO VICENTE E GRANADINAS', codigo: 'VC', nomeIngles: 'Saint Vincent and the Grenadines' },
      { nome: 'SENEGAL', codigo: 'SN', nomeIngles: 'Senegal' },
      { nome: 'SERRA LEOA', codigo: 'SL', nomeIngles: 'Sierra Leone' },
      { nome: 'SÉRVIA', codigo: 'RS', nomeIngles: 'Serbia' },
      { nome: 'SEYCHELLES', codigo: 'SC', nomeIngles: 'Seychelles' },
      { nome: 'SINGAPURA', codigo: 'SG', nomeIngles: 'Singapore' },
      { nome: 'SÍRIA', codigo: 'SY', nomeIngles: 'Syria' },
      { nome: 'SOMÁLIA', codigo: 'SO', nomeIngles: 'Somalia' },
      { nome: 'SRI LANKA', codigo: 'LK', nomeIngles: 'Sri Lanka' },
      { nome: 'SUAZILÂNDIA', codigo: 'SZ', nomeIngles: 'Eswatini' },
      { nome: 'SUDÃO', codigo: 'SD', nomeIngles: 'Sudan' },
      { nome: 'SUDÃO DO SUL', codigo: 'SS', nomeIngles: 'South Sudan' },
      { nome: 'SUÉCIA', codigo: 'SE', nomeIngles: 'Sweden' },
      { nome: 'SUÍÇA', codigo: 'CH', nomeIngles: 'Switzerland' },
      { nome: 'SURINAME', codigo: 'SR', nomeIngles: 'Suriname' },
      { nome: 'TAILÂNDIA', codigo: 'TH', nomeIngles: 'Thailand' },
      { nome: 'TAIWAN', codigo: 'TW', nomeIngles: 'Taiwan' },
      { nome: 'TAJIQUISTÃO', codigo: 'TJ', nomeIngles: 'Tajikistan' },
      { nome: 'TANZÂNIA', codigo: 'TZ', nomeIngles: 'Tanzania' },
      { nome: 'TIMOR-LESTE', codigo: 'TL', nomeIngles: 'Timor-Leste' },
      { nome: 'TOGO', codigo: 'TG', nomeIngles: 'Togo' },
      { nome: 'TONGA', codigo: 'TO', nomeIngles: 'Tonga' },
      { nome: 'TRINIDAD E TOBAGO', codigo: 'TT', nomeIngles: 'Trinidad and Tobago' },
      { nome: 'TUNÍSIA', codigo: 'TN', nomeIngles: 'Tunisia' },
      { nome: 'TURCOMENISTÃO', codigo: 'TM', nomeIngles: 'Turkmenistan' },
      { nome: 'TURQUIA', codigo: 'TR', nomeIngles: 'Turkey' },
      { nome: 'TUVALU', codigo: 'TV', nomeIngles: 'Tuvalu' },
      { nome: 'UCRÂNIA', codigo: 'UA', nomeIngles: 'Ukraine' },
      { nome: 'UGANDA', codigo: 'UG', nomeIngles: 'Uganda' },
      { nome: 'URUGUAI', codigo: 'UY', nomeIngles: 'Uruguay' },
      { nome: 'UZBEQUISTÃO', codigo: 'UZ', nomeIngles: 'Uzbekistan' },
      { nome: 'VANUATU', codigo: 'VU', nomeIngles: 'Vanuatu' },
      { nome: 'VATICANO', codigo: 'VA', nomeIngles: 'Vatican City' },
      { nome: 'VENEZUELA', codigo: 'VE', nomeIngles: 'Venezuela' },
      { nome: 'VIETNÃ', codigo: 'VN', nomeIngles: 'Vietnam' },
      { nome: 'ZÂMBIA', codigo: 'ZM', nomeIngles: 'Zambia' },
      { nome: 'ZIMBÁBUE', codigo: 'ZW', nomeIngles: 'Zimbabwe' }
    ]
  }

  /**
   * Busca países por nome (busca parcial)
   */
  static buscarPaisesPorNome(nome: string): Pais[] {
    const paises = this.buscarPaises()
    return paises.filter(pais => 
      pais.nome.toLowerCase().includes(nome.toLowerCase()) ||
      (pais.nomeIngles && pais.nomeIngles.toLowerCase().includes(nome.toLowerCase()))
    )
  }
}

