import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Bewusst ausschließlich aus der lokalen .env dieses Projekts gelesen (siehe
// .env.example) — keine globalen Umgebungsvariablen, keine Fallback-Werte,
// kein Hardcoding. So kann dieser Client nie versehentlich auf das
// Supabase-Projekt eines anderen Kunden zeigen.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anonKey);

// Ohne .env wird kein Client mit Platzhalter-Werten erzeugt. Jeder Zugriff
// scheitert stattdessen laut mit einer klaren Fehlermeldung — aufrufender
// Code prüft vorher `supabaseConfigured` und zeigt einen Hinweis an, statt
// diesen Fehler auszulösen (siehe Reservierung.tsx, AuthContext.tsx, ...).
export const supabase: SupabaseClient = supabaseConfigured
  ? createClient(url, anonKey)
  : new Proxy({} as SupabaseClient, {
      get() {
        throw new Error(
          'Supabase ist nicht konfiguriert: VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY in .env setzen (siehe .env.example).'
        );
      },
    });
