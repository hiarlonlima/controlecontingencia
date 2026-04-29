// Esteiras de aquecimento — playbooks operacionais por categoria.
// Estrutura: { id, label, emoji, title, description, steps: Step[] }
//
// Step: { id, day, title, tone, bullets[], description?, goal?, isMilestone? }

export const warmupAdAccounts = {
  id: 'contas',
  label: 'Contas de Anúncio',
  emoji: '🔥',
  title: 'Esteira de Aquecimento de Conta de Anúncios',
  description:
    'Roteiro estruturado pra preparar uma nova conta de anúncios para escala, gerando histórico positivo e compliance antes do evento de conversão.',
  duration: '5+ dias',
  steps: [
    {
      id: 'dia-1',
      day: 'Dia 1',
      title: 'Inicialização leve',
      tone: 'amber',
      bullets: [
        'Criar 1 campanha de Reconhecimento',
        'Orçamento: R$ 20/dia',
        'Não realizar nenhuma alteração',
      ],
      goal: 'Começar a gerar histórico e atividade básica na conta.',
    },
    {
      id: 'dia-2',
      day: 'Dia 2',
      title: 'Introdução de tráfego',
      tone: 'amber',
      bullets: [
        'Manter a campanha de reconhecimento ativa',
        'Criar 1 campanha de Tráfego',
        'Orçamento: R$ 20/dia',
        'Deixar ambas rodando sem alterações por 24h',
      ],
    },
    {
      id: 'dia-3',
      day: 'Dia 3',
      title: 'Engajamento social',
      tone: 'cyan',
      bullets: [
        'Manter campanhas de reconhecimento e tráfego',
        'Criar 1 campanha de Curtidas na Página',
        'Orçamento: R$ 10/dia',
        'Manter todas ativas por 2 dias',
      ],
    },
    {
      id: 'fase-validacao',
      day: 'Fase',
      title: 'Validação de Aprovação',
      tone: 'violet',
      isMilestone: true,
      description: 'Assim que a campanha de curtidas for aprovada:',
      bullets: [
        'Duplicar a campanha múltiplas vezes (ex.: até 50 variações)',
        'Utilizar orçamento mínimo permitido pelo Meta',
        'Definir limite de lance extremamente baixo (ex.: R$ 0,01)',
      ],
      goal: 'Aumentar o volume de anúncios aprovados e gerar histórico positivo de compliance na conta.',
    },
    {
      id: 'dia-5',
      day: 'Dia 5',
      title: 'Evento de conversão (destravamento)',
      tone: 'emerald',
      bullets: [
        'Criar campanha com objetivo de Vendas / Mensagens',
        'Orçamento: R$ 100/dia',
        'Foco: gerar evento mais "forte" dentro da conta (intenção comercial)',
      ],
    },
  ],
}

export const warmupProfiles = {
  id: 'perfis',
  label: 'Perfis',
  emoji: '👤',
  title: 'Esteira de Aquecimento de Perfis',
  description:
    'Defina aqui sua sequência operacional pra aquecer um perfil novo antes de virar admin de BM.',
  duration: '— dias',
  steps: [],
  emptyState: {
    title: 'Esteira ainda não definida',
    description:
      'Quando você definir os passos do seu fluxo de aquecimento de perfis, eles aparecem aqui em formato de timeline. Por enquanto, os perfis são organizados visualmente pelo Kanban dedicado (coluna "Em aquecimento").',
    cta: { label: 'Abrir Kanban de Perfis', href: '/kanban/perfis' },
  },
}

export const warmupBMs = {
  id: 'bms',
  label: 'BMs',
  emoji: '🏢',
  title: 'Esteira de Aquecimento de BMs',
  description:
    'Sequência operacional para preparar uma Business Manager nova antes de subir campanha real — criação, fan page, vínculos, verificação e admins de backup.',
  duration: '4 dias',
  steps: [
    {
      id: 'bm-dia-1',
      day: 'Dia 1',
      title: 'Criação e segurança',
      tone: 'amber',
      bullets: [
        'Criar BM e preencher todos os dados básicos',
        'Ativar 2FA no perfil dono',
      ],
      goal: 'Garantir que a BM nasce em estado seguro, com autenticação reforçada antes de qualquer vínculo.',
    },
    {
      id: 'bm-dia-2',
      day: 'Dia 2',
      title: 'Ativos principais',
      tone: 'amber',
      bullets: [
        'Criar Fan Page',
        'Criar conta de anúncio',
        'Criar Pixel',
      ],
    },
    {
      id: 'bm-dia-3',
      day: 'Dia 3',
      title: 'Configuração e vínculos',
      tone: 'cyan',
      bullets: [
        'Configurar método de pagamento',
        'Vincular ativos: Página + Pixel + Conta de Anúncio',
        'Criar App para liberar a verificação da BM',
      ],
      goal: 'BM com identidade financeira e técnica completa, pronta para o processo de verificação.',
    },
    {
      id: 'bm-dia-4',
      day: 'Dia 4',
      title: 'Verificação e operação',
      tone: 'emerald',
      bullets: [
        'Adicionar admins de backup',
        'Verificar a BM',
        'Iniciar aquecimento estruturado das contas de anúncio',
      ],
      goal: 'BM verificada, com redundância de admins. A partir daqui as contas seguem para a esteira de aquecimento dedicada.',
    },
  ],
}

export const WARMUP_PLAYBOOKS = [warmupProfiles, warmupBMs, warmupAdAccounts]
