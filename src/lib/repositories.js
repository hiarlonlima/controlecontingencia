import { STORAGE_KEYS } from '../utils/constants.js'
import { loadJSON, saveJSON } from '../utils/storage.js'
import { buildMockData } from '../utils/mockData.js'
import { BMS_TABLE, PROFILES_TABLE, hasSupabase, supabase } from './supabase.js'
import { bmFromDB, bmToDB, profileFromDB, profileToDB } from './mappers.js'

// ============== PROFILES ==============

export async function listProfiles() {
  if (hasSupabase) {
    const { data, error } = await supabase
      .from(PROFILES_TABLE)
      .select('*')
      .order('updated_at', { ascending: false })
    if (error) throw error
    return (data || []).map(profileFromDB)
  }
  return loadJSON(STORAGE_KEYS.PROFILES, []) || []
}

export async function upsertProfile(profile) {
  if (hasSupabase) {
    const { error } = await supabase
      .from(PROFILES_TABLE)
      .upsert(profileToDB(profile), { onConflict: 'id' })
    if (error) throw error
    return profile
  }
  // localStorage path: caller atualiza array completo via DataContext
  return profile
}

export async function deleteProfileById(id) {
  if (hasSupabase) {
    const { error } = await supabase.from(PROFILES_TABLE).delete().eq('id', id)
    if (error) throw error
  }
}

export async function bulkReplaceProfiles(profiles) {
  if (hasSupabase) {
    // Apaga tudo e reinsere — simples e seguro pra import CSV / restore mock
    const { error: delErr } = await supabase.from(PROFILES_TABLE).delete().neq('id', '__keep__')
    if (delErr) throw delErr
    if (profiles.length) {
      const { error: insErr } = await supabase
        .from(PROFILES_TABLE)
        .insert(profiles.map(profileToDB))
      if (insErr) throw insErr
    }
    return profiles
  }
  saveJSON(STORAGE_KEYS.PROFILES, profiles)
  return profiles
}

// ============== BMS ==============

export async function listBMs() {
  if (hasSupabase) {
    const { data, error } = await supabase
      .from(BMS_TABLE)
      .select('*')
      .order('updated_at', { ascending: false })
    if (error) throw error
    return (data || []).map(bmFromDB)
  }
  return loadJSON(STORAGE_KEYS.BMS, []) || []
}

export async function upsertBM(bm) {
  if (hasSupabase) {
    const { error } = await supabase
      .from(BMS_TABLE)
      .upsert(bmToDB(bm), { onConflict: 'id' })
    if (error) throw error
    return bm
  }
  return bm
}

export async function deleteBMById(id) {
  if (hasSupabase) {
    const { error } = await supabase.from(BMS_TABLE).delete().eq('id', id)
    if (error) throw error
  }
}

export async function bulkReplaceBMs(bms) {
  if (hasSupabase) {
    const { error: delErr } = await supabase.from(BMS_TABLE).delete().neq('id', '__keep__')
    if (delErr) throw delErr
    if (bms.length) {
      const { error: insErr } = await supabase.from(BMS_TABLE).insert(bms.map(bmToDB))
      if (insErr) throw insErr
    }
    return bms
  }
  saveJSON(STORAGE_KEYS.BMS, bms)
  return bms
}

// ============== INITIAL LOAD ==============

// Para localStorage planta os dados mockados na primeira execução.
// Para Supabase NUNCA planta automaticamente (evita poluir banco real);
// o usuário pode usar "Restaurar mock" em Configurações se quiser.
export async function bootstrapInitialData() {
  if (hasSupabase) {
    const [profiles, bms] = await Promise.all([listProfiles(), listBMs()])
    return { profiles, bms }
  }
  const seeded = loadJSON(STORAGE_KEYS.SEEDED, false)
  if (seeded) {
    return {
      profiles: loadJSON(STORAGE_KEYS.PROFILES, []) || [],
      bms: loadJSON(STORAGE_KEYS.BMS, []) || [],
    }
  }
  const mock = buildMockData()
  saveJSON(STORAGE_KEYS.PROFILES, mock.profiles)
  saveJSON(STORAGE_KEYS.BMS, mock.bms)
  saveJSON(STORAGE_KEYS.SEEDED, true)
  return mock
}

// Insere mock substituindo dados atuais (chamado por "Restaurar mock")
export async function plantMockData() {
  const mock = buildMockData()
  await Promise.all([bulkReplaceProfiles(mock.profiles), bulkReplaceBMs(mock.bms)])
  return mock
}
