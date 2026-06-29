-- Profiles table (parent + child)
create table bl_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  role text not null check (role in ('parent', 'child')),
  name text not null,
  grade int check (grade between 1 and 12),
  grade_system text check (grade_system in ('korean', 'us')),
  avatar_url text,
  parent_id uuid references bl_profiles(id) on delete cascade,
  created_at timestamptz default now()
);

alter table bl_profiles add constraint parent_has_user_id
  check (role = 'child' or user_id is not null);

-- Books table
create table bl_books (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references bl_profiles(id) on delete cascade not null,
  title text not null,
  author text,
  publisher text,
  cover_url text,
  photo_url text,
  description text,
  isbn text,
  language text not null default 'ko' check (language in ('ko', 'en')),
  rating int check (rating between 1 and 5),
  comment text,
  ai_question text,
  ai_answer text,
  read_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Badges table
create table bl_badges (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references bl_profiles(id) on delete cascade not null,
  type text not null,
  earned_at timestamptz default now(),
  unique(profile_id, type)
);

-- RLS Policies
alter table bl_profiles enable row level security;
alter table bl_books enable row level security;
alter table bl_badges enable row level security;

create policy "Users manage own profiles"
  on bl_profiles for all
  using (
    user_id = auth.uid() or
    parent_id in (select id from bl_profiles where user_id = auth.uid())
  );

create policy "Profile owner manages books"
  on bl_books for all
  using (
    profile_id in (
      select id from bl_profiles
      where user_id = auth.uid()
         or parent_id in (select id from bl_profiles where user_id = auth.uid())
    )
  );

create policy "Profile owner views badges"
  on bl_badges for all
  using (
    profile_id in (
      select id from bl_profiles
      where user_id = auth.uid()
         or parent_id in (select id from bl_profiles where user_id = auth.uid())
    )
  );

-- Storage bucket for book photos
insert into storage.buckets (id, name, public) values ('book-photos', 'book-photos', true);

create policy "Authenticated users upload photos"
  on storage.objects for insert
  with check (bucket_id = 'book-photos' and auth.role() = 'authenticated');

create policy "Public read photos"
  on storage.objects for select
  using (bucket_id = 'book-photos');

-- Print orders
create table if not exists bl_print_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  lulu_job_id text not null,
  status text not null default 'CREATED',
  title text,
  shipping_address jsonb,
  created_at timestamptz default now()
);

alter table bl_print_orders enable row level security;
create policy "Users see own orders" on bl_print_orders for all
  using (user_id = auth.uid());
