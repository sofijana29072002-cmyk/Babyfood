-- ============================================================
-- Малыш Ест — Initial Schema Migration
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  baby_name TEXT NOT NULL DEFAULT 'Малыш',
  baby_birthdate DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. products
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('овощи','фрукты','крупы','мясо','рыба','молочное','другое')),
  min_age_months INT NOT NULL CHECK (min_age_months BETWEEN 4 AND 12),
  allergen BOOLEAN DEFAULT FALSE,
  notes TEXT,
  emoji TEXT DEFAULT '🥣',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. recipes
-- ============================================================
CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('завтрак','обед','ужин','перекус')),
  min_age_months INT NOT NULL CHECK (min_age_months BETWEEN 4 AND 12),
  prep_time_minutes INT DEFAULT 20,
  ingredients JSONB DEFAULT '[]',
  instructions TEXT[] DEFAULT '{}',
  servings INT DEFAULT 1,
  tags TEXT[] DEFAULT '{}',
  emoji TEXT DEFAULT '🍲',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. meal_plans
-- ============================================================
CREATE TABLE IF NOT EXISTS public.meal_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  plan_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

-- ============================================================
-- 5. introduction_log
-- ============================================================
CREATE TABLE IF NOT EXISTS public.introduction_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  introduced_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reaction TEXT DEFAULT 'хорошо' CHECK (reaction IN ('хорошо','сыпь','живот','отказ','другое')),
  reaction_notes TEXT,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. shopping_lists
-- ============================================================
CREATE TABLE IF NOT EXISTS public.shopping_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  meal_plan_id UUID REFERENCES public.meal_plans(id) ON DELETE SET NULL,
  items JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. favorites (рецепты в избранном)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.introduction_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Profiles: own row only
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Meal plans: own rows only
CREATE POLICY "Users can manage own meal plans" ON public.meal_plans
  FOR ALL USING (auth.uid() = user_id);

-- Introduction log: own rows only
CREATE POLICY "Users can manage own introduction log" ON public.introduction_log
  FOR ALL USING (auth.uid() = user_id);

-- Shopping lists: own rows only
CREATE POLICY "Users can manage own shopping lists" ON public.shopping_lists
  FOR ALL USING (auth.uid() = user_id);

-- Favorites: own rows only
CREATE POLICY "Users can manage own favorites" ON public.favorites
  FOR ALL USING (auth.uid() = user_id);

-- Products and recipes are public (read-only for all authenticated users)
CREATE POLICY "Authenticated users can read products" ON public.products
  FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');
CREATE POLICY "Authenticated users can read recipes" ON public.recipes
  FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_introduction_log_user ON public.introduction_log(user_id);
CREATE INDEX IF NOT EXISTS idx_introduction_log_product ON public.introduction_log(product_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user ON public.meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_week ON public.meal_plans(week_start);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_age ON public.products(min_age_months);
CREATE INDEX IF NOT EXISTS idx_recipes_age ON public.recipes(min_age_months);
CREATE INDEX IF NOT EXISTS idx_recipes_meal_type ON public.recipes(meal_type);

-- ============================================================
-- FUNCTION: auto-create profile on user signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
