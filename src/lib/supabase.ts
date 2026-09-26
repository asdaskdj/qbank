import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** Supabase가 설정되어 있으면 client, 아니면 null (데모 모드) */
export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null
export const isDemo = !supabase
