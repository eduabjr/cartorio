/**
 * 🏗️ SISTEMA DE MICRO-FRONTENDS
 * 
 * Cada página é um módulo isolado e independente
 * Vantagens:
 * - ✅ Se uma página quebrar, não afeta as outras
 * - ✅ Lazy loading - carrega só quando necessário
 * - ✅ Code splitting - chunks menores
 * - ✅ Desenvolvimento independente de cada módulo
 * - ✅ Fácil manutenção e debug
 * 
 * Similar a microserviços no backend, mas para frontend
 */

import { lazy } from 'react'
import { createIsolatedPage } from '../components/PageLoader'

// 📦 Módulo: Clientes
export const ClientePageIsolated = createIsolatedPage(
  () => import('../pages/ClientePage').then(m => ({ default: m.ClientePage })),
  'Cadastro de Clientes'
)

// 📦 Módulo: Funcionários
export const FuncionarioPageIsolated = createIsolatedPage(
  () => import('../pages/FuncionarioPage').then(m => ({ default: m.FuncionarioPage })),
  'Cadastro de Funcionários'
)

// 📦 Módulo: Cidades
export const CidadePageIsolated = createIsolatedPage(
  () => import('../pages/CidadePage').then(m => ({ default: m.CidadePage })),
  'Cadastro de Cidades'
)

// 📦 Módulo: Países
export const PaisPageIsolated = createIsolatedPage(
  () => import('../pages/PaisPage').then(m => ({ default: m.PaisPage })),
  'Cadastro de Países'
)

// 📦 Módulo: Firmas
export const FirmasPageIsolated = createIsolatedPage(
  () => import('../pages/FirmasPage').then(m => ({ default: m.FirmasPage })),
  'Cadastro de Firmas'
)

// 📦 Módulo: Natureza
export const NaturezaPageIsolated = createIsolatedPage(
  () => import('../pages/NaturezaPage').then(m => ({ default: m.NaturezaPage })),
  'Cadastro de Natureza'
)

// 📦 Módulo: Índices
export const IndicesPageIsolated = createIsolatedPage(
  () => import('../pages/IndicesPage').then(m => ({ default: m.IndicesPage })),
  'Índices de Livros'
)

// 📦 Módulo: Cadastro de Índice
export const CadastroIndicePageIsolated = createIsolatedPage(
  () => import('../pages/CadastroIndicePage').then(m => ({ default: m.CadastroIndicePage })),
  'Cadastro de Índices'
)

// 📦 Módulo: Índice X
export const IndiceXPageIsolated = createIsolatedPage(
  () => import('../pages/IndiceXPage').then(m => ({ default: m.IndiceXPage })),
  'Índice X'
)

// 📦 Módulo: Cartório SEADE
export const CartorioSeadePageIsolated = createIsolatedPage(
  () => import('../pages/CartorioSeadePage').then(m => ({ default: m.CartorioSeadePage })),
  'Cartórios SEADE'
)

// 📦 Módulo: Configuração de Senhas
export const ConfiguracaoSenhaPageIsolated = createIsolatedPage(
  () => import('../pages/ConfiguracaoSenhaPage').then(m => ({ default: m.ConfiguracaoSenhaPage })),
  'Configuração de Senhas'
)

// 📦 Módulo: Controlador de Senhas
export const ControladorSenhaPageIsolated = createIsolatedPage(
  () => import('../pages/ControladorSenhaPage').then(m => ({ default: m.ControladorSenhaPage })),
  'Controle de Atendimento'
)

// 📦 Módulo: Painel de Senhas
export const PainelSenhasPageIsolated = createIsolatedPage(
  () => import('../pages/PainelSenhasPage').then(m => ({ default: m.PainelSenhasPage })),
  'Painel de Senhas'
)

// 📦 Módulo: Gerenciamento de Guichês
export const GerenciamentoGuichesPageIsolated = createIsolatedPage(
  () => import('../pages/GerenciamentoGuichesPage').then(m => ({ default: m.GerenciamentoGuichesPage })),
  'Gerenciamento de Guichês'
)

// 📦 Módulo: Configuração do Sistema
export const ConfiguracaoSistemaPageIsolated = createIsolatedPage(
  () => import('../pages/ConfiguracaoSistemaPage').then(m => ({ default: m.ConfiguracaoSistemaPage })),
  'Configuração do Sistema'
)

// 📦 Módulo: Configuração de Menu
export const ConfiguracaoMenuPageIsolated = createIsolatedPage(
  () => import('../pages/ConfiguracaoMenuPage').then(m => ({ default: m.ConfiguracaoMenuPage })),
  'Configuração de Menu'
)

// 📦 Módulo: Cadastro de Livros
export const CadastroLivrosPageIsolated = createIsolatedPage(
  () => import('../pages/CadastroLivrosPage').then(m => ({ default: m.CadastroLivrosPage })),
  'Cadastro de Livros'
)

// 📦 Módulo: Tipos de Cadastro
export const TiposCadastroPageIsolated = createIsolatedPage(
  () => import('../pages/TiposCadastroPage').then(m => ({ default: m.TiposCadastroPage })),
  'Tipos de Cadastro'
)

// 📦 Módulo: Protocolo de Lançamento
export const ProtocoloLancamentoPageIsolated = createIsolatedPage(
  () => import('../pages/ProtocoloLancamentoPage').then(m => ({ default: m.ProtocoloLancamentoPage })),
  'Protocolo de Lançamento'
)

// 📦 Módulo: Localização de Cadastro
export const LocalizacaoCadastroPageIsolated = createIsolatedPage(
  () => import('../pages/LocalizacaoCadastroPage').then(m => ({ default: m.LocalizacaoCadastroPage })),
  'Localização de Cadastro'
)

// 📦 Módulo: Ofícios e Mandados
export const OficiosMandadosPageIsolated = createIsolatedPage(
  () => import('../pages/OficiosMandadosPage').then(m => ({ default: m.OficiosMandadosPage })),
  'Ofícios e Mandados'
)

// 📦 Módulo: Serviços de Cartório
export const ServicoCartorioPageIsolated = createIsolatedPage(
  () => import('../pages/ServicoCartorioPage').then(m => ({ default: m.ServicoCartorioPage })),
  'Serviços de Cartório'
)

// 📦 Módulo: DNV/DO Bloqueadas
export const DNVDOBloqueadasPageIsolated = createIsolatedPage(
  () => import('../pages/DNVDOBloqueadasPage').then(m => ({ default: m.DNVDOBloqueadasPage })),
  'DNV/DO Bloqueadas'
)

// 📦 Módulo: Protocolo de Cancelamento
export const ProtocoloCancelamentoPageIsolated = createIsolatedPage(
  () => import('../pages/ProtocoloCancelamentoPage').then(m => ({ default: m.ProtocoloCancelamentoPage })),
  'Protocolo de Cancelamento'
)

// 📦 Módulo: Recepção de Arquivos - Funerária
export const RecepcaoArquivoFunerariaPageIsolated = createIsolatedPage(
  () => import('../pages/RecepcaoArquivoFunerariaPage').then(m => ({ default: m.RecepcaoArquivoFunerariaPage })),
  'Recepção de Arquivo - Funerária'
)

// 📦 Módulo: Recepção de Arquivos - Maternidade
export const RecepcaoArquivoMaternidadePageIsolated = createIsolatedPage(
  () => import('../pages/RecepcaoArquivoMaternidadePage').then(m => ({ default: m.RecepcaoArquivoMaternidadePage })),
  'Recepção de Arquivo - Maternidade'
)

// 📦 Módulo: Recepção de Arquivos
export const RecepcaoArquivosPageIsolated = createIsolatedPage(
  () => import('../pages/RecepcaoArquivosPage').then(m => ({ default: m.RecepcaoArquivosPage })),
  'Recepção de Arquivos'
)

// 📦 Módulo: Feriados
export const FeriadosPageIsolated = createIsolatedPage(
  () => import('../pages/FeriadosPage').then(m => ({ default: m.FeriadosPage })),
  'Cadastro de Feriados'
)

// 📦 Módulo: Controle de Digitalização
export const ControleDigitalizacaoPageIsolated = createIsolatedPage(
  () => import('../pages/ControleDigitalizacaoPage').then(m => ({ default: m.ControleDigitalizacaoPage })),
  'Controle de Digitalização'
)

// 📦 Módulo: Hospital, Cemitério e Funerária
export const HospitalCemiterioPageIsolated = createIsolatedPage(
  () => import('../pages/HospitalCemiterioPage').then(m => ({ default: m.HospitalCemiterioPage })),
  'Hospital, Cemitério e Funerária'
)

// 📦 Módulo: Remessa SEADE
export const RemessaSEADEPageIsolated = createIsolatedPage(
  () => import('../pages/RemessaSEADEPage').then(m => ({ default: m.RemessaSEADEPage })),
  'Remessa SEADE'
)

/**
 * 📋 Mapa de todos os módulos disponíveis
 * 
 * Use este mapa para abrir janelas de forma isolada
 * Exemplo: modules['cliente']({ onClose: () => {} })
 */
export const modules = {
  cliente: ClientePageIsolated,
  funcionario: FuncionarioPageIsolated,
  cidade: CidadePageIsolated,
  pais: PaisPageIsolated,
  firmas: FirmasPageIsolated,
  natureza: NaturezaPageIsolated,
  indices: IndicesPageIsolated,
  indicex: IndiceXPageIsolated,
  cartorioSeade: CartorioSeadePageIsolated,
  configuracaoSenha: ConfiguracaoSenhaPageIsolated,
  controladorSenha: ControladorSenhaPageIsolated,
  painelSenhas: PainelSenhasPageIsolated,
  gerenciamentoGuiches: GerenciamentoGuichesPageIsolated,
  configuracaoSistema: ConfiguracaoSistemaPageIsolated,
  configuracaoMenu: ConfiguracaoMenuPageIsolated,
  cadastroLivros: CadastroLivrosPageIsolated,
  cadastroIndice: CadastroIndicePageIsolated,
  tiposCadastro: TiposCadastroPageIsolated,
  protocoloLancamento: ProtocoloLancamentoPageIsolated,
  localizacaoCadastro: LocalizacaoCadastroPageIsolated,
  oficiosMandados: OficiosMandadosPageIsolated,
  servicoCartorio: ServicoCartorioPageIsolated,
  dnvdoBloqueadas: DNVDOBloqueadasPageIsolated,
  protocoloCancelamento: ProtocoloCancelamentoPageIsolated,
  recepcaoArquivoFuneraria: RecepcaoArquivoFunerariaPageIsolated,
  recepcaoArquivoMaternidade: RecepcaoArquivoMaternidadePageIsolated,
  recepcaoArquivos: RecepcaoArquivosPageIsolated,
  feriados: FeriadosPageIsolated,
  controleDigitalizacao: ControleDigitalizacaoPageIsolated,
  hospitalCemiterio: HospitalCemiterioPageIsolated,
  remessaSEADE: RemessaSEADEPageIsolated
} as const

export type ModuleName = keyof typeof modules

