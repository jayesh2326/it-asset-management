DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'it_staff');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.asset_status AS ENUM ('in_stock', 'assigned', 'maintenance', 'retired', 'lost');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.asset_condition AS ENUM ('new', 'good', 'fair', 'poor', 'damaged');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.employee_status AS ENUM ('active', 'inactive');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.assignment_status AS ENUM ('active', 'returned');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.maintenance_status AS ENUM ('open', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.activity_entity AS ENUM (
    'asset','employee','assignment','maintenance','document','user'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;