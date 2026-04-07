import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url =
  import.meta.env.VITE_SUPABASE_URL ?? "https://svclehfbtywymfnefbhg.supabase.co";
const anonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2Y2xlaGZidHl3eW1mbmVmYmhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3ODI5MjIsImV4cCI6MjA5MDM1ODkyMn0.9shJXtHOLIB_jeXLfe695vQQ2NfZRMBwEzevyVCYz9I";

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;
