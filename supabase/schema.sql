-- Run this in the Supabase SQL editor for your project.
--
-- Ids are always supplied by the client (see `src/lib/store.ts`'s
-- `makeId()`), so writes can update the in-memory cache immediately and
-- only roll back on failure — there's no server-generated id to wait for
-- or swap in afterward. `cake_types.name`/`default_price` etc. use the
-- same shape as `src/lib/types.ts`; see that file for why (e.g.) a sale's
-- `cake_type` is free text rather than a foreign key.

create table if not exists cake_types (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  default_price numeric(10, 2),
  created_at timestamptz not null default now()
);

create table if not exists cake_sales (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  -- Free text, not a foreign key to cake_types: deleting a cake type must
  -- never orphan or rewrite past sales (same reasoning as the original
  -- localStorage model).
  cake_type text not null,
  quantity integer not null check (quantity > 0),
  price_per_unit numeric(10, 2) not null check (price_per_unit >= 0),
  sale_date date not null,
  payment_method text
    check (
      payment_method in ('cash', 'credit', 'bit', 'paybox', 'bank_transfer')
    ),
  note text,
  created_at timestamptz not null default now()
);

create index if not exists cake_sales_user_id_idx on cake_sales (user_id);

create table if not exists cake_expenses (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  description text not null,
  category text not null
    check (
      category in (
        'ingredients', 'packaging', 'equipment', 'delivery', 'marketing',
        'rent', 'other'
      )
    ),
  amount numeric(10, 2) not null check (amount >= 0),
  expense_date date not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists cake_expenses_user_id_idx on cake_expenses (user_id);
create index if not exists cake_types_user_id_idx on cake_types (user_id);

alter table cake_types enable row level security;
alter table cake_sales enable row level security;
alter table cake_expenses enable row level security;

-- Each account only ever sees (and can only ever write) its own rows —
-- "per user" data, not one shared bucket. There's no sharing/collaborator
-- table like trips-app has; every baker's data here is fully separate.
create policy "Users manage their own cake types"
  on cake_types for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their own sales"
  on cake_sales for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their own expenses"
  on cake_expenses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
