// lib/supabaseClient.ts
import { createClient as _createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// createClient 함수를 내보냅니다.
export const createClient = () => {
  return _createClient(supabaseUrl, supabaseKey);
};
