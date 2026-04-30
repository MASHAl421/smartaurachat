
-- profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "Profiles viewable by owner" on public.profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- auto-create profile
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- conversations
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New chat',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.conversations enable row level security;
create policy "Own conversations select" on public.conversations for select using (auth.uid() = user_id);
create policy "Own conversations insert" on public.conversations for insert with check (auth.uid() = user_id);
create policy "Own conversations update" on public.conversations for update using (auth.uid() = user_id);
create policy "Own conversations delete" on public.conversations for delete using (auth.uid() = user_id);

-- messages
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  created_at timestamptz not null default now()
);
create index on public.messages(conversation_id, created_at);
alter table public.messages enable row level security;
create policy "Own messages select" on public.messages for select using (auth.uid() = user_id);
create policy "Own messages insert" on public.messages for insert with check (auth.uid() = user_id);
create policy "Own messages delete" on public.messages for delete using (auth.uid() = user_id);

-- updated_at trigger for conversations
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger conversations_touch before update on public.conversations
  for each row execute function public.touch_updated_at();
