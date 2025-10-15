export interface User {
  id: string;
  name: string;
  email: string;
  profile: 'admin' | 'employee';
  permissions: string[];
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'cadastros' | 'processos' | 'relatorios' | 'configuracoes' | 'financeiro';
}

export const PERMISSIONS: Permission[] = [
  // Permissões de Cadastros
  { id: 'cadastros.cliente', name: 'Cliente', description: 'Gerenciar clientes', category: 'cadastros' },
  { id: 'cadastros.funcionario', name: 'Funcionário', description: 'Gerenciar funcionários', category: 'cadastros' },
  { id: 'cadastros.cartorio', name: 'Cartório (SEADE)', description: 'Configurar cartório', category: 'cadastros' },
  { id: 'cadastros.cidade', name: 'Cidade', description: 'Gerenciar cidades', category: 'cadastros' },
  { id: 'cadastros.pais', name: 'País', description: 'Gerenciar países', category: 'cadastros' },
  { id: 'cadastros.dnv', name: 'DNV e DO Bloqueadas', description: 'Gerenciar DNV e DO', category: 'cadastros' },
  { id: 'cadastros.modelos', name: 'Modelos e Minutas - Procuração', description: 'Gerenciar modelos', category: 'cadastros' },
  { id: 'cadastros.oficios', name: 'Ofícios e Mandados', description: 'Gerenciar ofícios', category: 'cadastros' },
  { id: 'cadastros.averbacao', name: 'Averbação', description: 'Gerenciar averbações', category: 'cadastros' },
  { id: 'cadastros.hospital', name: 'Hospital', description: 'Gerenciar hospitais', category: 'cadastros' },
  { id: 'cadastros.cemiterio', name: 'Cemitério', description: 'Gerenciar cemitérios', category: 'cadastros' },
  { id: 'cadastros.funeraria', name: 'Funerária', description: 'Gerenciar funerárias', category: 'cadastros' },
  { id: 'cadastros.livros', name: 'Cadastro de Livros', description: 'Gerenciar livros', category: 'cadastros' },
  { id: 'cadastros.feriados', name: 'Feriados', description: 'Gerenciar feriados', category: 'cadastros' },
  { id: 'cadastros.configuracao', name: 'Configuração do Sistema', description: 'Configurar sistema', category: 'configuracoes' },
  
  // Permissões de Processos
  { id: 'processos.visualizar', name: 'Visualizar Processos', description: 'Visualizar processos', category: 'processos' },
  { id: 'processos.criar', name: 'Criar Processos', description: 'Criar novos processos', category: 'processos' },
  { id: 'processos.editar', name: 'Editar Processos', description: 'Editar processos', category: 'processos' },
  { id: 'processos.excluir', name: 'Excluir Processos', description: 'Excluir processos', category: 'processos' },
  
  // Permissões de Protocolos
  { id: 'protocolos.lancamento', name: 'Lançamento de Protocolo', description: 'Criar lançamentos de protocolo', category: 'processos' },
  { id: 'protocolos.baixa', name: 'Baixa de Protocolo', description: 'Dar baixa em protocolos', category: 'processos' },
  { id: 'protocolos.cancelamento', name: 'Cancelamento de Protocolo', description: 'Cancelar protocolos', category: 'processos' },
  
  // Permissões de Relatórios
  { id: 'relatorios.visualizar', name: 'Visualizar Relatórios', description: 'Visualizar relatórios', category: 'relatorios' },
  { id: 'relatorios.exportar', name: 'Exportar Relatórios', description: 'Exportar relatórios', category: 'relatorios' },
  
  // Permissões Financeiras
  { id: 'financeiro.visualizar', name: 'Visualizar Financeiro', description: 'Visualizar dados financeiros', category: 'financeiro' },
  { id: 'financeiro.gerenciar', name: 'Gerenciar Financeiro', description: 'Gerenciar dados financeiros', category: 'financeiro' },
  { id: 'financeiro.relatorios', name: 'Relatórios Financeiros', description: 'Acessar relatórios financeiros', category: 'financeiro' },
];

export const PROFILE_PERMISSIONS = {
  admin: PERMISSIONS.map(p => p.id), // Administrador tem acesso a tudo
  employee: [
    // Permissões básicas para funcionários
    'cadastros.cliente',
    'cadastros.cartorio',
    'cadastros.dnv',
    'cadastros.oficios',
    'cadastros.averbacao',
    'cadastros.hospital',
    'cadastros.cemiterio',
    'cadastros.funeraria',
    'cadastros.livros',
    'processos.visualizar',
    'processos.criar',
    'processos.editar',
    'protocolos.lancamento',
    'protocolos.baixa',
    'protocolos.cancelamento',
    'relatorios.visualizar',
  ]
};
