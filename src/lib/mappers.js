// Conversores entre o formato JS (camelCase) e Postgres (snake_case).
// Mantemos nulls como '' / [] pra que componentes não precisem checar undefined.

export function profileToDB(p) {
  return {
    id: p.id,
    nome: p.nome ?? '',
    codigo_interno: p.codigoInterno ?? '',
    login: p.login ?? '',
    senha: p.senha ?? '',
    two_fa: p.twoFA ?? '',
    fornecedor: p.fornecedor ?? '',
    data_compra: p.dataCompra || null,
    data_criacao_facebook: p.dataCriacaoFacebook || null,
    status: p.status ?? 'novo',
    nivel_confianca: p.nivelConfianca ?? 'medio',
    pais: p.pais ?? 'Brasil',
    proxy: p.proxy ?? '',
    telefone: p.telefone ?? '',
    bm_vinculada: p.bmVinculada ?? '',
    conta_anuncio_vinculada: p.contaAnuncioVinculada ?? '',
    observacoes: p.observacoes ?? '',
    tags: p.tags ?? [],
    historico: p.historico ?? [],
    notas: p.notas ?? [],
    created_at: p.createdAt || null,
    updated_at: p.updatedAt || new Date().toISOString(),
  }
}

export function profileFromDB(r) {
  return {
    id: r.id,
    nome: r.nome ?? '',
    codigoInterno: r.codigo_interno ?? '',
    login: r.login ?? '',
    senha: r.senha ?? '',
    twoFA: r.two_fa ?? '',
    fornecedor: r.fornecedor ?? '',
    dataCompra: r.data_compra ?? '',
    dataCriacaoFacebook: r.data_criacao_facebook ?? '',
    status: r.status ?? 'novo',
    nivelConfianca: r.nivel_confianca ?? 'medio',
    pais: r.pais ?? 'Brasil',
    proxy: r.proxy ?? '',
    telefone: r.telefone ?? '',
    bmVinculada: r.bm_vinculada ?? '',
    contaAnuncioVinculada: r.conta_anuncio_vinculada ?? '',
    observacoes: r.observacoes ?? '',
    tags: r.tags ?? [],
    historico: r.historico ?? [],
    notas: r.notas ?? [],
    createdAt: r.created_at ?? '',
    updatedAt: r.updated_at ?? '',
  }
}

export function bmToDB(b) {
  return {
    id: b.id,
    nome: b.nome ?? '',
    bm_id: b.bmId ?? '',
    perfil_dono: b.perfilDono ?? '',
    perfis_vinculados: b.perfisVinculados ?? [],
    contas_anuncio: b.contasAnuncio ?? [],
    metodo_pagamento: !!b.metodoPagamento,
    limite_diario: b.limiteDiario ?? '',
    status: b.status ?? 'nova',
    verificacao: b.verificacao ?? 'nao_verificada',
    pais: b.pais ?? 'Brasil',
    dominios: b.dominios ?? [],
    paginas: b.paginas ?? [],
    observacoes: b.observacoes ?? '',
    tags: b.tags ?? [],
    historico: b.historico ?? [],
    notas: b.notas ?? [],
    created_at: b.createdAt || null,
    updated_at: b.updatedAt || new Date().toISOString(),
  }
}

export function bmFromDB(r) {
  return {
    id: r.id,
    nome: r.nome ?? '',
    bmId: r.bm_id ?? '',
    perfilDono: r.perfil_dono ?? '',
    perfisVinculados: r.perfis_vinculados ?? [],
    contasAnuncio: r.contas_anuncio ?? [],
    metodoPagamento: !!r.metodo_pagamento,
    limiteDiario: r.limite_diario ?? '',
    status: r.status ?? 'nova',
    verificacao: r.verificacao ?? 'nao_verificada',
    pais: r.pais ?? 'Brasil',
    dominios: r.dominios ?? [],
    paginas: r.paginas ?? [],
    observacoes: r.observacoes ?? '',
    tags: r.tags ?? [],
    historico: r.historico ?? [],
    notas: r.notas ?? [],
    createdAt: r.created_at ?? '',
    updatedAt: r.updated_at ?? '',
  }
}
