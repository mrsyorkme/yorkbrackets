
-- Tournaments table
CREATE TABLE public.tournaments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed'))
);

ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;

-- Everyone can view tournaments
CREATE POLICY "Anyone can view tournaments" ON public.tournaments FOR SELECT USING (true);

-- Only authenticated users can manage tournaments
CREATE POLICY "Authenticated users can insert tournaments" ON public.tournaments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update tournaments" ON public.tournaments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete tournaments" ON public.tournaments FOR DELETE TO authenticated USING (true);

-- Participants table
CREATE TABLE public.participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  seed INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view participants" ON public.participants FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert participants" ON public.participants FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update participants" ON public.participants FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete participants" ON public.participants FOR DELETE TO authenticated USING (true);

-- Matches table
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  round INTEGER NOT NULL,
  match_number INTEGER NOT NULL,
  participant1_id UUID REFERENCES public.participants(id),
  participant2_id UUID REFERENCES public.participants(id),
  winner_id UUID REFERENCES public.participants(id),
  result_text TEXT,
  result_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view matches" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert matches" ON public.matches FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update matches" ON public.matches FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete matches" ON public.matches FOR DELETE TO authenticated USING (true);

-- Storage bucket for match result images
INSERT INTO storage.buckets (id, name, public) VALUES ('match-images', 'match-images', true);

CREATE POLICY "Anyone can view match images" ON storage.objects FOR SELECT USING (bucket_id = 'match-images');
CREATE POLICY "Authenticated users can upload match images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'match-images');
CREATE POLICY "Authenticated users can update match images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'match-images');
CREATE POLICY "Authenticated users can delete match images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'match-images');
