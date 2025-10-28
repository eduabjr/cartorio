export interface CidadeData {
  codigo: string
  nome: string
  uf: string
  numeroIBGE: string
}

// TODOS OS MUNICÍPIOS BRASILEIROS
// Lista completa com 5.570 municípios do IBGE
// Para economizar espaço, use este link para importar: https://servicodados.ibge.gov.br/api/v1/localidades/municipios
// Abaixo estão as capitais e principais cidades (146 municípios)
export const cidadesData: CidadeData[] = [
  // Acre
  { codigo: '001', nome: 'Rio Branco', uf: 'AC', numeroIBGE: '1200401' },
  { codigo: '002', nome: 'Cruzeiro do Sul', uf: 'AC', numeroIBGE: '1200203' },
  
  // Alagoas
  { codigo: '003', nome: 'Maceió', uf: 'AL', numeroIBGE: '2704302' },
  { codigo: '004', nome: 'Arapiraca', uf: 'AL', numeroIBGE: '2700201' },
  
  // Amapá
  { codigo: '005', nome: 'Macapá', uf: 'AP', numeroIBGE: '1600303' },
  { codigo: '006', nome: 'Santana', uf: 'AP', numeroIBGE: '1600600' },
  
  // Amazonas
  { codigo: '007', nome: 'Manaus', uf: 'AM', numeroIBGE: '1302603' },
  { codigo: '008', nome: 'Parintins', uf: 'AM', numeroIBGE: '1303403' },
  { codigo: '009', nome: 'Itacoatiara', uf: 'AM', numeroIBGE: '1301902' },
  
  // Bahia
  { codigo: '010', nome: 'Salvador', uf: 'BA', numeroIBGE: '2927408' },
  { codigo: '011', nome: 'Feira de Santana', uf: 'BA', numeroIBGE: '2910800' },
  { codigo: '012', nome: 'Vitória da Conquista', uf: 'BA', numeroIBGE: '2933307' },
  { codigo: '013', nome: 'Camaçari', uf: 'BA', numeroIBGE: '2905206' },
  { codigo: '014', nome: 'Juazeiro', uf: 'BA', numeroIBGE: '2918407' },
  { codigo: '015', nome: 'Ilhéus', uf: 'BA', numeroIBGE: '2913606' },
  
  // Ceará
  { codigo: '016', nome: 'Fortaleza', uf: 'CE', numeroIBGE: '2304400' },
  { codigo: '017', nome: 'Caucaia', uf: 'CE', numeroIBGE: '2303709' },
  { codigo: '018', nome: 'Juazeiro do Norte', uf: 'CE', numeroIBGE: '2307304' },
  { codigo: '019', nome: 'Maracanaú', uf: 'CE', numeroIBGE: '2307650' },
  { codigo: '020', nome: 'Sobral', uf: 'CE', numeroIBGE: '2312908' },
  
  // Distrito Federal
  { codigo: '021', nome: 'Brasília', uf: 'DF', numeroIBGE: '5300108' },
  
  // Espírito Santo
  { codigo: '022', nome: 'Vitória', uf: 'ES', numeroIBGE: '3205309' },
  { codigo: '023', nome: 'Vila Velha', uf: 'ES', numeroIBGE: '3205200' },
  { codigo: '024', nome: 'Serra', uf: 'ES', numeroIBGE: '3205002' },
  { codigo: '025', nome: 'Cariacica', uf: 'ES', numeroIBGE: '3201308' },
  { codigo: '026', nome: 'Cachoeiro de Itapemirim', uf: 'ES', numeroIBGE: '3201209' },
  
  // Goiás
  { codigo: '027', nome: 'Goiânia', uf: 'GO', numeroIBGE: '5208707' },
  { codigo: '028', nome: 'Aparecida de Goiânia', uf: 'GO', numeroIBGE: '5201405' },
  { codigo: '029', nome: 'Anápolis', uf: 'GO', numeroIBGE: '5201108' },
  { codigo: '030', nome: 'Rio Verde', uf: 'GO', numeroIBGE: '5218607' },
  
  // Maranhão
  { codigo: '031', nome: 'São Luís', uf: 'MA', numeroIBGE: '2111300' },
  { codigo: '032', nome: 'Imperatriz', uf: 'MA', numeroIBGE: '2105302' },
  { codigo: '033', nome: 'São José de Ribamar', uf: 'MA', numeroIBGE: '2111201' },
  { codigo: '034', nome: 'Timon', uf: 'MA', numeroIBGE: '2112209' },
  
  // Mato Grosso
  { codigo: '035', nome: 'Cuiabá', uf: 'MT', numeroIBGE: '5103403' },
  { codigo: '036', nome: 'Várzea Grande', uf: 'MT', numeroIBGE: '5108402' },
  { codigo: '037', nome: 'Rondonópolis', uf: 'MT', numeroIBGE: '5107602' },
  { codigo: '038', nome: 'Sinop', uf: 'MT', numeroIBGE: '5107909' },
  
  // Mato Grosso do Sul
  { codigo: '039', nome: 'Campo Grande', uf: 'MS', numeroIBGE: '5002704' },
  { codigo: '040', nome: 'Dourados', uf: 'MS', numeroIBGE: '5003702' },
  { codigo: '041', nome: 'Três Lagoas', uf: 'MS', numeroIBGE: '5008305' },
  { codigo: '042', nome: 'Corumbá', uf: 'MS', numeroIBGE: '5003207' },
  
  // Minas Gerais
  { codigo: '043', nome: 'Belo Horizonte', uf: 'MG', numeroIBGE: '3106200' },
  { codigo: '044', nome: 'Uberlândia', uf: 'MG', numeroIBGE: '3170206' },
  { codigo: '045', nome: 'Contagem', uf: 'MG', numeroIBGE: '3118601' },
  { codigo: '046', nome: 'Juiz de Fora', uf: 'MG', numeroIBGE: '3136702' },
  { codigo: '047', nome: 'Betim', uf: 'MG', numeroIBGE: '3106705' },
  { codigo: '048', nome: 'Montes Claros', uf: 'MG', numeroIBGE: '3143302' },
  { codigo: '049', nome: 'Ribeirão das Neves', uf: 'MG', numeroIBGE: '3154606' },
  { codigo: '050', nome: 'Uberaba', uf: 'MG', numeroIBGE: '3170107' },
  { codigo: '051', nome: 'Governador Valadares', uf: 'MG', numeroIBGE: '3127701' },
  { codigo: '052', nome: 'Ipatinga', uf: 'MG', numeroIBGE: '3131307' },
  
  // Pará
  { codigo: '053', nome: 'Belém', uf: 'PA', numeroIBGE: '1501402' },
  { codigo: '054', nome: 'Ananindeua', uf: 'PA', numeroIBGE: '1500800' },
  { codigo: '055', nome: 'Santarém', uf: 'PA', numeroIBGE: '1506807' },
  { codigo: '056', nome: 'Marabá', uf: 'PA', numeroIBGE: '1504208' },
  { codigo: '057', nome: 'Castanhal', uf: 'PA', numeroIBGE: '1502400' },
  
  // Paraíba
  { codigo: '058', nome: 'João Pessoa', uf: 'PB', numeroIBGE: '2507507' },
  { codigo: '059', nome: 'Campina Grande', uf: 'PB', numeroIBGE: '2504009' },
  { codigo: '060', nome: 'Santa Rita', uf: 'PB', numeroIBGE: '2513703' },
  { codigo: '061', nome: 'Patos', uf: 'PB', numeroIBGE: '2510808' },
  
  // Paraná
  { codigo: '062', nome: 'Curitiba', uf: 'PR', numeroIBGE: '4106902' },
  { codigo: '063', nome: 'Londrina', uf: 'PR', numeroIBGE: '4113700' },
  { codigo: '064', nome: 'Maringá', uf: 'PR', numeroIBGE: '4115200' },
  { codigo: '065', nome: 'Ponta Grossa', uf: 'PR', numeroIBGE: '4119905' },
  { codigo: '066', nome: 'Cascavel', uf: 'PR', numeroIBGE: '4104808' },
  { codigo: '067', nome: 'São José dos Pinhais', uf: 'PR', numeroIBGE: '4125506' },
  { codigo: '068', nome: 'Foz do Iguaçu', uf: 'PR', numeroIBGE: '4108304' },
  { codigo: '069', nome: 'Colombo', uf: 'PR', numeroIBGE: '4106001' },
  
  // Pernambuco
  { codigo: '070', nome: 'Recife', uf: 'PE', numeroIBGE: '2611606' },
  { codigo: '071', nome: 'Jaboatão dos Guararapes', uf: 'PE', numeroIBGE: '2607901' },
  { codigo: '072', nome: 'Olinda', uf: 'PE', numeroIBGE: '2609600' },
  { codigo: '073', nome: 'Caruaru', uf: 'PE', numeroIBGE: '2604106' },
  { codigo: '074', nome: 'Petrolina', uf: 'PE', numeroIBGE: '2611101' },
  { codigo: '075', nome: 'Paulista', uf: 'PE', numeroIBGE: '2610707' },
  
  // Piauí
  { codigo: '076', nome: 'Teresina', uf: 'PI', numeroIBGE: '2211001' },
  { codigo: '077', nome: 'Parnaíba', uf: 'PI', numeroIBGE: '2207702' },
  { codigo: '078', nome: 'Picos', uf: 'PI', numeroIBGE: '2208007' },
  
  // Rio de Janeiro
  { codigo: '079', nome: 'Rio de Janeiro', uf: 'RJ', numeroIBGE: '3304557' },
  { codigo: '080', nome: 'São Gonçalo', uf: 'RJ', numeroIBGE: '3304904' },
  { codigo: '081', nome: 'Duque de Caxias', uf: 'RJ', numeroIBGE: '3301702' },
  { codigo: '082', nome: 'Nova Iguaçu', uf: 'RJ', numeroIBGE: '3303500' },
  { codigo: '083', nome: 'Niterói', uf: 'RJ', numeroIBGE: '3303302' },
  { codigo: '084', nome: 'Belford Roxo', uf: 'RJ', numeroIBGE: '3300456' },
  { codigo: '085', nome: 'Campos dos Goytacazes', uf: 'RJ', numeroIBGE: '3301009' },
  { codigo: '086', nome: 'São João de Meriti', uf: 'RJ', numeroIBGE: '3304805' },
  { codigo: '087', nome: 'Petrópolis', uf: 'RJ', numeroIBGE: '3303906' },
  { codigo: '088', nome: 'Volta Redonda', uf: 'RJ', numeroIBGE: '3306305' },
  
  // Rio Grande do Norte
  { codigo: '089', nome: 'Natal', uf: 'RN', numeroIBGE: '2408102' },
  { codigo: '090', nome: 'Mossoró', uf: 'RN', numeroIBGE: '2408003' },
  { codigo: '091', nome: 'Parnamirim', uf: 'RN', numeroIBGE: '2403251' },
  
  // Rio Grande do Sul
  { codigo: '092', nome: 'Porto Alegre', uf: 'RS', numeroIBGE: '4314902' },
  { codigo: '093', nome: 'Caxias do Sul', uf: 'RS', numeroIBGE: '4305108' },
  { codigo: '094', nome: 'Pelotas', uf: 'RS', numeroIBGE: '4314407' },
  { codigo: '095', nome: 'Canoas', uf: 'RS', numeroIBGE: '4304606' },
  { codigo: '096', nome: 'Santa Maria', uf: 'RS', numeroIBGE: '4316907' },
  { codigo: '097', nome: 'Gravataí', uf: 'RS', numeroIBGE: '4309100' },
  { codigo: '098', nome: 'Viamão', uf: 'RS', numeroIBGE: '4323002' },
  { codigo: '099', nome: 'Novo Hamburgo', uf: 'RS', numeroIBGE: '4313409' },
  { codigo: '100', nome: 'São Leopoldo', uf: 'RS', numeroIBGE: '4318705' },
  
  // Rondônia
  { codigo: '101', nome: 'Porto Velho', uf: 'RO', numeroIBGE: '1100205' },
  { codigo: '102', nome: 'Ji-Paraná', uf: 'RO', numeroIBGE: '1100122' },
  { codigo: '103', nome: 'Ariquemes', uf: 'RO', numeroIBGE: '1100023' },
  
  // Roraima
  { codigo: '104', nome: 'Boa Vista', uf: 'RR', numeroIBGE: '1400100' },
  
  // Santa Catarina
  { codigo: '105', nome: 'Florianópolis', uf: 'SC', numeroIBGE: '4205407' },
  { codigo: '106', nome: 'Joinville', uf: 'SC', numeroIBGE: '4209102' },
  { codigo: '107', nome: 'Blumenau', uf: 'SC', numeroIBGE: '4202404' },
  { codigo: '108', nome: 'São José', uf: 'SC', numeroIBGE: '4216602' },
  { codigo: '109', nome: 'Criciúma', uf: 'SC', numeroIBGE: '4204608' },
  { codigo: '110', nome: 'Chapecó', uf: 'SC', numeroIBGE: '4204202' },
  { codigo: '111', nome: 'Itajaí', uf: 'SC', numeroIBGE: '4208203' },
  { codigo: '112', nome: 'Jaraguá do Sul', uf: 'SC', numeroIBGE: '4208906' },
  
  // São Paulo
  { codigo: '113', nome: 'São Paulo', uf: 'SP', numeroIBGE: '3550308' },
  { codigo: '114', nome: 'Guarulhos', uf: 'SP', numeroIBGE: '3518800' },
  { codigo: '115', nome: 'Campinas', uf: 'SP', numeroIBGE: '3509502' },
  { codigo: '116', nome: 'São Bernardo do Campo', uf: 'SP', numeroIBGE: '3548708' },
  { codigo: '117', nome: 'Santo André', uf: 'SP', numeroIBGE: '3547809' },
  { codigo: '118', nome: 'Osasco', uf: 'SP', numeroIBGE: '3534401' },
  { codigo: '119', nome: 'São José dos Campos', uf: 'SP', numeroIBGE: '3549904' },
  { codigo: '120', nome: 'Ribeirão Preto', uf: 'SP', numeroIBGE: '3543402' },
  { codigo: '121', nome: 'Sorocaba', uf: 'SP', numeroIBGE: '3552205' },
  { codigo: '122', nome: 'Santos', uf: 'SP', numeroIBGE: '3548500' },
  { codigo: '123', nome: 'Mauá', uf: 'SP', numeroIBGE: '3529401' },
  { codigo: '124', nome: 'São José do Rio Preto', uf: 'SP', numeroIBGE: '3549805' },
  { codigo: '125', nome: 'Mogi das Cruzes', uf: 'SP', numeroIBGE: '3530706' },
  { codigo: '126', nome: 'Diadema', uf: 'SP', numeroIBGE: '3513801' },
  { codigo: '127', nome: 'Jundiaí', uf: 'SP', numeroIBGE: '3525904' },
  { codigo: '128', nome: 'Piracicaba', uf: 'SP', numeroIBGE: '3538709' },
  { codigo: '129', nome: 'Carapicuíba', uf: 'SP', numeroIBGE: '3510609' },
  { codigo: '130', nome: 'Bauru', uf: 'SP', numeroIBGE: '3506003' },
  { codigo: '131', nome: 'São Vicente', uf: 'SP', numeroIBGE: '3551009' },
  { codigo: '132', nome: 'Itaquaquecetuba', uf: 'SP', numeroIBGE: '3523107' },
  { codigo: '133', nome: 'Franca', uf: 'SP', numeroIBGE: '3516200' },
  { codigo: '134', nome: 'Guarujá', uf: 'SP', numeroIBGE: '3518701' },
  { codigo: '135', nome: 'Taubaté', uf: 'SP', numeroIBGE: '3554003' },
  { codigo: '136', nome: 'Limeira', uf: 'SP', numeroIBGE: '3526902' },
  { codigo: '137', nome: 'Suzano', uf: 'SP', numeroIBGE: '3552502' },
  { codigo: '138', nome: 'Taboão da Serra', uf: 'SP', numeroIBGE: '3552700' },
  { codigo: '139', nome: 'Sumaré', uf: 'SP', numeroIBGE: '3552403' },
  { codigo: '140', nome: 'Barueri', uf: 'SP', numeroIBGE: '3505708' },
  
  // Sergipe
  { codigo: '141', nome: 'Aracaju', uf: 'SE', numeroIBGE: '2800308' },
  { codigo: '142', nome: 'Nossa Senhora do Socorro', uf: 'SE', numeroIBGE: '2804508' },
  { codigo: '143', nome: 'Lagarto', uf: 'SE', numeroIBGE: '2803500' },
  
  // Tocantins
  { codigo: '144', nome: 'Palmas', uf: 'TO', numeroIBGE: '1721000' },
  { codigo: '145', nome: 'Araguaína', uf: 'TO', numeroIBGE: '1702109' },
  { codigo: '146', nome: 'Gurupi', uf: 'TO', numeroIBGE: '1709500' }
]

