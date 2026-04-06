-- ==========================================
-- ETERNAL MEMORIES - SETUP SQL
-- Execute este script no SQL Editor do seu Supabase Dashboard
-- ==========================================

-- 1. Tabela Principal de Presentes
CREATE TABLE IF NOT EXISTS gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE DEFAULT substring(md5(random()::text) from 1 for 8),
  sender_name TEXT,
  sender_email TEXT, -- NOVO: Para recuperação de conta
  recipient_name TEXT,
  intro_message TEXT,
  music_preview_url TEXT,
  music_name TEXT,
  is_paid BOOLEAN DEFAULT false,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  stories JSONB DEFAULT '[]',
  journey JSONB DEFAULT '[]'
);

-- Se a tabela já existir, execute:
-- ALTER TABLE gifts ADD COLUMN IF NOT EXISTS sender_email TEXT;

-- 2. Políticas de Segurança (Row Level Security)
-- Permitir leitura pública para que o presente possa ser visualizado por qualquer pessoa com o link
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso público para leitura" 
ON gifts FOR SELECT 
TO public 
USING (true);

-- Permitir inserção pública para que novos presentes possam ser criados
CREATE POLICY "Acesso público para inserção" 
ON gifts FOR INSERT 
TO public 
WITH CHECK (true);

-- Permitir atualização (ex: marcar como pago)
CREATE POLICY "Acesso público para atualização" 
ON gifts FOR UPDATE 
TO public 
USING (true)
WITH CHECK (true);

-- ==========================================
-- NOTA IMPORTANTE PARA STORAGE:
-- No painel do Supabase, você DEVE ir em Storage e:
-- 1. Criar um bucket chamado "gifts-memories"
-- 2. Marcar o bucket como PUBLIC
-- 3. Adicionar uma política de "SELECT" para acesso público aos arquivos
-- ==========================================
