-- ============================================================
-- Малыш Ест — Новые функции
-- ============================================================

-- Аватарка профиля
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Фото в дневнике
ALTER TABLE public.introduction_log ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- YouTube ссылки и кастомные рецепты
ALTER TABLE public.recipes ADD COLUMN IF NOT EXISTS youtube_url TEXT;
ALTER TABLE public.recipes ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT FALSE;
ALTER TABLE public.recipes ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Заметки педиатра
CREATE TABLE IF NOT EXISTS public.doctor_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  visit_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.doctor_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own doctor notes"
  ON public.doctor_notes
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Разрешить кастомные рецепты в RLS
DROP POLICY IF EXISTS "Anyone can read recipes" ON public.recipes;
CREATE POLICY "Anyone can read global recipes"
  ON public.recipes FOR SELECT
  USING (is_custom = FALSE OR created_by = auth.uid());

CREATE POLICY "Users can insert custom recipes"
  ON public.recipes FOR INSERT
  WITH CHECK (is_custom = TRUE AND created_by = auth.uid());

CREATE POLICY "Users can update own custom recipes"
  ON public.recipes FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete own custom recipes"
  ON public.recipes FOR DELETE
  USING (created_by = auth.uid());

-- Индексы
CREATE INDEX IF NOT EXISTS idx_doctor_notes_user_id ON public.doctor_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_is_custom ON public.recipes(is_custom);
