-- One persistent JSON document per shared household workspace.
-- Only the SHA-256 hash of the shared workspace code is stored.
create extension if not exists pgcrypto;

create table if not exists public.nanny_shared_data (
  workspace_hash text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.nanny_shared_data enable row level security;

-- Direct table access is intentionally denied. The two RPCs below verify a long
-- shared code before locating its hashed household document.
create or replace function public.get_nanny_shared_data(p_workspace_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_workspace_hash text;
begin
  if char_length(coalesce(p_workspace_code, '')) < 24 then
    raise exception 'A workspace code must be at least 24 characters.';
  end if;
  v_workspace_hash := encode(digest(p_workspace_code, 'sha256'), 'hex');
  return coalesce(
    (select d.data from public.nanny_shared_data d where d.workspace_hash = v_workspace_hash),
    '{}'::jsonb
  );
end;
$$;

create or replace function public.save_nanny_shared_data(
  p_workspace_code text,
  p_data jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_workspace_hash text;
begin
  if char_length(coalesce(p_workspace_code, '')) < 24 then
    raise exception 'A workspace code must be at least 24 characters.';
  end if;
  if p_data is null or jsonb_typeof(p_data) <> 'object' then
    raise exception 'Shared data must be a JSON object.';
  end if;
  v_workspace_hash := encode(digest(p_workspace_code, 'sha256'), 'hex');
  insert into public.nanny_shared_data (workspace_hash, data)
  values (v_workspace_hash, p_data)
  on conflict (workspace_hash) do update set data = excluded.data;
end;
$$;

grant execute on function public.get_nanny_shared_data(text) to anon;
grant execute on function public.save_nanny_shared_data(text, jsonb) to anon;

create or replace function public.set_nanny_shared_data_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists nanny_shared_data_updated_at on public.nanny_shared_data;
create trigger nanny_shared_data_updated_at
before update on public.nanny_shared_data
for each row execute function public.set_nanny_shared_data_updated_at();
