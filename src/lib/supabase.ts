import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Solange kein Supabase-Projekt verbunden ist (siehe .env.example), bleibt
// der Rest der Seite trotzdem benutzbar — Komponenten, die auf Supabase
// zugreifen, prüfen `supabaseConfigured` und zeigen einen Hinweis statt
// gegen eine Platzhalter-URL zu laufen.
export const supabaseConfigured = Boolean(url && anonKey);

export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-anon-key'
);
