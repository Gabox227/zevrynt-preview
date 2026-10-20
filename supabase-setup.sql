create table if not exists public.news_admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

create table if not exists public.news_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null unique check (char_length(title) between 1 and 180),
  category text not null check (category in ('Petróleo', 'IA', 'Cripto', 'Economía')),
  image_url text not null,
  image_path text,
  image_alt text not null check (char_length(image_alt) between 1 and 180),
  description text not null check (char_length(description) between 1 and 400),
  read_time text not null default '3 min de lectura',
  date_label text not null default 'Reciente',
  body jsonb not null check (jsonb_typeof(body) = 'array'),
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create or replace function public.is_news_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.news_admins
    where user_id = (select auth.uid())
  );
$$;

alter table public.news_admins enable row level security;
alter table public.news_articles enable row level security;

revoke all on public.news_admins from anon, authenticated;
revoke all on public.news_articles from anon, authenticated;
grant select on public.news_admins to authenticated;
grant select on public.news_articles to anon, authenticated;
grant insert, update, delete on public.news_articles to authenticated;
grant execute on function public.is_news_admin() to anon, authenticated;

drop policy if exists "Admins can read their own admin record" on public.news_admins;
create policy "Admins can read their own admin record"
on public.news_admins for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Anyone can read published news" on public.news_articles;
create policy "Anyone can read published news"
on public.news_articles for select
to anon, authenticated
using (is_published or (select public.is_news_admin()));

drop policy if exists "Admins can create news" on public.news_articles;
create policy "Admins can create news"
on public.news_articles for insert
to authenticated
with check ((select public.is_news_admin()));

drop policy if exists "Admins can update news" on public.news_articles;
create policy "Admins can update news"
on public.news_articles for update
to authenticated
using ((select public.is_news_admin()))
with check ((select public.is_news_admin()));

drop policy if exists "Admins can delete news" on public.news_articles;
create policy "Admins can delete news"
on public.news_articles for delete
to authenticated
using ((select public.is_news_admin()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('news-images', 'news-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read news images" on storage.objects;
create policy "Public can read news images"
on storage.objects for select
to public
using (bucket_id = 'news-images');

drop policy if exists "Admins can upload news images" on storage.objects;
create policy "Admins can upload news images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'news-images' and (select public.is_news_admin()));

drop policy if exists "Admins can update news images" on storage.objects;
create policy "Admins can update news images"
on storage.objects for update
to authenticated
using (bucket_id = 'news-images' and (select public.is_news_admin()))
with check (bucket_id = 'news-images' and (select public.is_news_admin()));

drop policy if exists "Admins can delete news images" on storage.objects;
create policy "Admins can delete news images"
on storage.objects for delete
to authenticated
using (bucket_id = 'news-images' and (select public.is_news_admin()));

insert into public.news_articles
  (title, category, image_url, image_alt, description, read_time, date_label, body)
values
  (
    'El FMI prevé que la inversión en IA sostendrá el crecimiento mundial',
    'IA',
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop',
    'Representación de redes neuronales e inteligencia artificial',
    'Según las últimas proyecciones, el impulso del sector tecnológico actuará como amortiguador ante tensiones geopolíticas e incertidumbres financieras.',
    '4 min de lectura',
    'Reciente',
    jsonb_build_array(
      'El Fondo Monetario Internacional destacó el papel que la inteligencia artificial está desempeñando en la economía global.',
      'A pesar de las tensiones geopolíticas y las presiones sobre las cadenas de suministro, la inversión privada y corporativa en infraestructura de IA y automatización puede ayudar a amortiguar el impacto en el crecimiento mundial.'
    )
  ),
  (
    'Bitcoin consolida su precio alrededor de los $81,900',
    'Cripto',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop',
    'Circuito electrónico que representa el mercado cripto',
    'Tras alcanzar máximos previos, el mercado cripto evalúa los flujos en los fondos cotizados (ETF) y se prepara para el último trimestre.',
    '3 min de lectura',
    'Reciente',
    jsonb_build_array(
      'El mercado de criptomonedas registra un periodo de consolidación estratégica.',
      'Los flujos de capital institucional a través de los ETF spot continúan siendo un indicador que los participantes siguen mientras evalúan los movimientos del mercado.'
    )
  ),
  (
    'OPEP+ mantiene sus proyecciones de extracción para productores externos',
    'Petróleo',
    'https://images.unsplash.com/photo-1516937941344-00b4e0337589?w=800&auto=format&fit=crop',
    'Instalación industrial de refinación de petróleo',
    'El organismo reafirma la estabilidad en el volumen de bombeo independiente, monitoreando el equilibrio entre oferta y demanda global.',
    '5 min de lectura',
    'Hace 4 días',
    jsonb_build_array(
      'La OPEP+ mantiene sus proyecciones de extracción para los productores externos.',
      'La publicación destaca el seguimiento del volumen de bombeo y del equilibrio entre la oferta y la demanda global.'
    )
  ),
  (
    'Anthropic prepara su debut en Wall Street acelerando el desarrollo de agentes',
    'IA',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop',
    'Ilustración abstracta sobre tecnología e inteligencia artificial',
    'La firma detrás de Claude alinea su salida a bolsa mientras los modelos autónomos redefinen la automatización en el desarrollo de software.',
    '4 min de lectura',
    'Reciente',
    jsonb_build_array(
      'Anthropic, la firma detrás de Claude, prepara su debut en Wall Street mientras acelera el desarrollo de agentes.',
      'La noticia pone el foco en los modelos autónomos y en cómo la automatización puede transformar el desarrollo de software.'
    )
  ),
  (
    'El FMI eleva la previsión del PIB global hasta el 3,1%',
    'Economía',
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop',
    'Gráficos financieros y datos de mercado',
    'Pese al impacto en precios de energía y suministros, el ajuste al alza refleja resistencia en las principales economías emergentes y desarrolladas.',
    '5 min de lectura',
    'Hace 5 días',
    jsonb_build_array(
      'El FMI elevó su previsión del PIB global hasta el 3,1%.',
      'El ajuste considera el impacto de los precios de energía y suministros, junto con la resistencia observada en economías emergentes y desarrolladas.'
    )
  )
on conflict (title) do nothing;

-- After creating the administrator in Supabase Authentication, run this separately
-- and replace the email with the exact account email.
-- insert into public.news_admins (user_id)
-- select id from auth.users where email = 'YOUR_ADMIN_EMAIL'
-- on conflict do nothing;
