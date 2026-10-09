import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://uwbfwldrcxnixanxjnse.supabase.co";

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_o8aXvvISJ_CPM3HiEk2R6g_2uBaJj1X";

export const supabase = createClient(supabaseUrl, supabaseKey);