-- Ejecutá esto una vez en Supabase: Dashboard → SQL Editor → New query → pegar y "Run".
-- Después de correrlo, ya podés agregar/editar habitaciones sin código desde
-- /admin/propiedades en la web (recomendado), o directamente desde
-- Dashboard → Table Editor → properties → Insert row si preferís.

create table if not exists public.properties (
  id text primary key,
  zone text not null,
  title text not null,
  price numeric not null,
  match int not null default 90,
  available text not null,             -- formato dd/mm/aaaa, ej: 01/10/2026
  individual_or_pareja text not null default 'ambos', -- 'individual' | 'pareja' | 'ambos'
  worker_or_student text not null default 'ambos',    -- 'trabajador' | 'estudiante' | 'ambos'
  accepts_smokers boolean not null default true,
  accepts_pets boolean not null default true,
  accepts_dogs boolean not null default false, -- solo importa si accepts_pets = true
  lat numeric,  -- si se deja vacío, el mapa usa el centro aproximado del barrio (zone)
  lng numeric,
  photos int not null default 1,
  photo_urls text[] not null default '{}', -- fotos reales, subidas desde /admin/propiedades
  color_from text not null default '#BFD9FF',
  color_to text not null default '#DCE9FF',
  amenities text[] not null default '{}',
  description text not null default '',
  manager text not null default 'Equipo Kasia',
  response_time text not null default 'Responde en menos de 24 horas',
  manager_phone text not null default '+34 600 000 000',
  manager_email text not null default 'hola@kasia-valencia.com',
  created_at timestamptz not null default now()
);

alter table public.properties enable row level security;

-- Cualquiera puede ver el catálogo (es público, como en la web).
create policy "properties are publicly readable"
  on public.properties for select
  using (true);

-- No hay policy de escritura para `properties`: agregar/editar/borrar habitaciones
-- se hace desde /admin/propiedades, que pasa siempre por rutas de servidor
-- protegidas con ADMIN_EMAILS y la service_role key (bypassea RLS). Así un
-- usuario cualquiera que se registre no puede tocar el catálogo directamente.

-- Datos de ejemplo (podés borrarlos desde el Table Editor cuando cargues los tuyos).
insert into public.properties (id, zone, title, price, match, available, individual_or_pareja, worker_or_student, photos, color_from, color_to, amenities, description, manager, response_time, manager_phone, manager_email)
values
  ('ruzafa-3a', 'Ruzafa', 'Habitación Premium con balcón', 750, 94, '01/10/2026', 'ambos', 'ambos', 12, '#BFD9FF', '#DCE9FF', array['WiFi de 300Mb','Aire acondicionado','Escritorio','Lavadora','Ascensor','Balcón propio'], 'Habitación exterior con balcón en un piso reformado a dos calles del Mercado de Ruzafa.', 'Alba', 'Responde en menos de 2 horas', '+34 600 111 222', 'alba@kasia-valencia.com'),
  ('benimaclet-1c', 'Benimaclet', 'Habitación exterior junto al campus', 680, 89, '15/10/2026', 'individual', 'estudiante', 9, '#E4D9FF', '#F0E9FF', array['WiFi de 300Mb','Escritorio','Lavadora','Terraza compartida'], 'A diez minutos a pie de la Universitat de València y la Politècnica.', 'Marc', 'Responde en menos de 4 horas', '+34 600 333 444', 'marc@kasia-valencia.com'),
  ('mestalla-2b', 'Mestalla', 'Habitación luminosa cerca del estadio', 720, 86, '01/11/2026', 'pareja', 'trabajador', 10, '#BFEBE0', '#DFF7EF', array['WiFi de 300Mb','Aire acondicionado','Lavadora','Ascensor'], 'Piso con mucha luz natural en una calle tranquila detrás del Mestalla.', 'Alba', 'Responde en menos de 2 horas', '+34 600 111 222', 'alba@kasia-valencia.com'),
  ('el-carmen-4d', 'El Carmen', 'Habitación con encanto en el Carmen', 820, 82, '01/10/2026', 'ambos', 'ambos', 14, '#FFD9CF', '#FFEAE4', array['WiFi de 300Mb','Aire acondicionado','Escritorio','Balcón propio','Ascensor'], 'En pleno casco histórico, en un edificio del siglo XIX restaurado.', 'Nuria', 'Responde en menos de 1 hora', '+34 600 555 666', 'nuria@kasia-valencia.com'),
  ('extramurs-2a', 'Extramurs', 'Habitación individual, piso tranquilo', 650, 91, '01/10/2026', 'individual', 'ambos', 8, '#D9E8FF', '#EAF2FF', array['WiFi de 300Mb','Escritorio','Lavadora','Calefacción'], 'Barrio residencial y bien conectado, a cinco paradas de metro del centro.', 'Marc', 'Responde en menos de 4 horas', '+34 600 333 444', 'marc@kasia-valencia.com'),
  ('camins-3c', 'Camins al Grau', 'Habitación doble cerca de la playa', 770, 88, '20/10/2026', 'pareja', 'trabajador', 11, '#FFE3B0', '#FFF1D6', array['WiFi de 300Mb','Aire acondicionado','Lavadora','Terraza compartida','Ascensor'], 'A quince minutos caminando de la playa de la Malvarrosa.', 'Nuria', 'Responde en menos de 1 hora', '+34 600 555 666', 'nuria@kasia-valencia.com'),
  ('patraix-1b', 'Patraix', 'Habitación económica, piso reformado', 660, 79, '05/11/2026', 'individual', 'ambos', 7, '#D6F0E0', '#EAF8EF', array['WiFi de 300Mb','Lavadora','Calefacción'], 'Zona residencial con buen precio y todos los servicios cerca.', 'Alba', 'Responde en menos de 2 horas', '+34 600 111 222', 'alba@kasia-valencia.com'),
  ('algiros-2d', 'Algirós', 'Habitación junto a la Politècnica', 700, 90, '01/10/2026', 'individual', 'estudiante', 9, '#E8DBFF', '#F3ECFF', array['WiFi de 300Mb','Escritorio','Aire acondicionado','Ascensor'], 'A cinco minutos de la Universitat Politècnica de València.', 'Marc', 'Responde en menos de 4 horas', '+34 600 333 444', 'marc@kasia-valencia.com'),
  ('malvarrosa-5a', 'Malvarrosa', 'Habitación frente al mar', 830, 85, '10/10/2026', 'pareja', 'trabajador', 13, '#C9EAFB', '#E3F5FD', array['WiFi de 300Mb','Aire acondicionado','Balcón propio','Lavadora'], 'A metros del paseo marítimo, con vistas parciales al mar.', 'Nuria', 'Responde en menos de 1 hora', '+34 600 555 666', 'nuria@kasia-valencia.com')
on conflict (id) do nothing;

-- Si ya habías corrido una versión anterior de este schema, ejecutá esto una vez
-- para agregar las columnas nuevas y sacar la vieja columna `pet`:
-- alter table public.properties drop column if exists pet;
-- alter table public.properties add column if not exists manager text not null default 'Equipo Kasia';
-- alter table public.properties add column if not exists response_time text not null default 'Responde en menos de 24 horas';
-- alter table public.properties add column if not exists manager_phone text not null default '+34 600 000 000';
-- alter table public.properties add column if not exists manager_email text not null default 'hola@kasia-valencia.com';
--
-- Si ya habías corrido una versión anterior con la policy "authenticated users
-- manage properties" (permitía a cualquier usuario registrado editar el
-- catálogo), sacala así solo se puede editar desde /admin:
-- drop policy if exists "authenticated users manage properties" on public.properties;

-- ============================================================================
-- Reservas: registra cada intento de reserva y su avance por el embudo, hasta
-- el pago, la visita agendada y la elección final. Alimenta el panel /admin.
-- ============================================================================
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  room_id text not null references public.properties(id),
  user_id uuid references auth.users(id),
  user_email text,
  status text not null default 'nuevo', -- 'nuevo' | 'verificado' | 'pagado'
  amount numeric,
  stripe_session_id text,
  visit_status text not null default 'pendiente', -- 'pendiente' | 'agendada' | 'hecha'
  visit_at timestamptz,
  final_choice_room_id text references public.properties(id),
  paid_at timestamptz, -- cuándo se confirmó el pago; updated_at se sigue tocando después
                        -- (agendar visita, etc.), así que no sirve para esto
  review_reminder_sent_at timestamptz, -- evita mandar el recordatorio de reseña más de una vez
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (room_id, user_id)
);

alter table public.bookings enable row level security;

-- Cada usuario ve y actualiza únicamente sus propias reservas.
create policy "users manage their own bookings"
  on public.bookings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- El panel /admin lee todas las reservas con la service_role key (ver SETUP.md),
-- que no pasa por RLS, así que no hace falta una policy extra para eso.

-- ============================================================================
-- Reseñas: solo puede dejar una quien tenga una reserva pagada de esa
-- habitación (se valida en la policy de insert, no en el código), una por
-- persona y habitación. Se muestran públicamente en /rooms/[id].
-- ============================================================================
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  room_id text not null references public.properties(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reviewer_name text not null,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (room_id, user_id)
);

alter table public.reviews enable row level security;

create policy "reviews are publicly readable"
  on public.reviews for select
  using (true);

create policy "users review rooms they booked and paid for"
  on public.reviews for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.bookings b
      where b.room_id = reviews.room_id
        and b.user_id = auth.uid()
        and b.status = 'pagado'
    )
  );

-- ============================================================================
-- Integraciones: acá se guardan las claves de Stripe y Didit cuando las cargás
-- desde /admin/integraciones en vez de configurarlas como variables de entorno.
-- Es una sola fila (id=1). No tiene ninguna policy de RLS a propósito: ni
-- anon ni authenticated pueden leerla ni escribirla, solo la service_role key
-- (que usa el servidor de /admin) puede saltarse RLS y acceder.
-- ============================================================================
create table if not exists public.app_settings (
  id int primary key default 1,
  stripe_secret_key text,
  didit_api_key text,
  didit_workflow_id text,
  resend_api_key text,
  email_from text,
  updated_at timestamptz not null default now(),
  constraint app_settings_singleton check (id = 1)
);

alter table public.app_settings enable row level security;

insert into public.app_settings (id) values (1) on conflict (id) do nothing;

-- ============================================================================
-- Acceso al catálogo privado: para ver /rooms un usuario tiene que primero
-- completar el formulario de compatibilidad de /apply. La solicitud se evalúa
-- server-side (ver lib/application-scoring.ts) y solo si queda en estado
-- APPROVED se le permite crear una cuenta (/signup) y entrar a /rooms.
--
-- Sin ninguna policy de RLS a propósito: el formulario público inserta a
-- través de /api/apply, y toda lectura/escritura pasa por rutas de servidor
-- con la service_role key. Así nadie puede leer solicitudes ajenas ni
-- fabricar un estado APPROVED por su cuenta desde el navegador.
-- ============================================================================
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  zone text not null,
  move_in_date date,
  occupancy_type text not null,       -- 'individual' | 'pareja'
  has_minors boolean not null default false,
  pet_type text not null default 'ninguno',  -- 'ninguno' | 'perro' | 'gato' | 'otro'
  smoker boolean not null default false,
  occupation_type text not null,      -- 'trabajador' | 'estudiante'
  budget numeric not null,
  stay_duration_months int not null,
  -- Rutas dentro del bucket privado `application-documents` (ver más abajo).
  -- Se completan cuando el estudiante los sube en /apply, o cuando alguien del
  -- equipo pide más información desde /admin/solicitudes y la persona los sube
  -- después en /apply/documents?app=<id>.
  financial_proof_path text,
  unpaid_rent_insurance_path text,
  documents_requested_at timestamptz, -- cuándo se pidió más documentación desde /admin
  documents_submitted_at timestamptz, -- cuándo se subieron los documentos pedidos
  documents_rejected_at timestamptz,  -- si está seteado, el admin rechazó lo subido y /apply/documents
                                       -- vuelve a mostrar el formulario hasta el próximo reenvío
  documents_rejection_note text,      -- por qué se rechazó, se le muestra a la persona al reenviar
  documents_approved_at timestamptz,  -- cuándo el admin dio por buenos los documentos
  status text not null default 'REVIEW',  -- 'APPROVED' | 'REVIEW' | 'NOT_ELIGIBLE'
  internal_reason text,               -- nunca se muestra al usuario
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.applications enable row level security;

create index if not exists applications_email_idx on public.applications (lower(email));
create index if not exists applications_phone_idx on public.applications (phone);

-- Relaciona cada cuenta de Supabase Auth con la solicitud que la habilitó.
-- application_status queda "congelado" al momento del alta: si más adelante
-- necesitás revocar el acceso de alguien, actualizá esta fila directamente.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  application_id uuid references public.applications(id),
  application_status text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Cada usuario puede leer únicamente su propia fila — es lo que usa /rooms
-- para comprobar en el servidor si tiene acceso, sin necesitar la
-- service_role key en ese chequeo.
create policy "users read their own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Si ya habías corrido una versión anterior de este schema (con la columna
-- booleana `has_pet` en vez de `pet_type`), ejecutá esto una vez:
-- alter table public.applications add column if not exists pet_type text not null default 'ninguno';
-- update public.applications set pet_type = case when has_pet then 'perro' else 'ninguno' end;
-- alter table public.applications drop column if exists has_pet;
-- alter table public.applications add column if not exists financial_proof_path text;
-- alter table public.applications add column if not exists unpaid_rent_insurance_path text;
-- alter table public.applications add column if not exists documents_requested_at timestamptz;
-- alter table public.applications add column if not exists documents_submitted_at timestamptz;
-- alter table public.applications add column if not exists documents_rejected_at timestamptz;
-- alter table public.applications add column if not exists documents_rejection_note text;
-- alter table public.applications add column if not exists documents_approved_at timestamptz;
-- alter table public.app_settings add column if not exists resend_api_key text;
-- alter table public.app_settings add column if not exists email_from text;
-- alter table public.properties add column if not exists photo_urls text[] not null default '{}';
-- alter table public.properties add column if not exists accepts_smokers boolean not null default true;
-- alter table public.properties add column if not exists accepts_pets boolean not null default true;
-- alter table public.properties add column if not exists accepts_dogs boolean not null default false;
-- alter table public.properties add column if not exists lat numeric;
-- alter table public.properties add column if not exists lng numeric;
-- alter table public.bookings add column if not exists paid_at timestamptz;
-- alter table public.bookings add column if not exists review_reminder_sent_at timestamptz;

-- ============================================================================
-- Fotos de propiedades: se suben desde /admin/propiedades (crear o editar
-- habitación) y quedan en este bucket público — cualquiera puede verlas (son
-- fotos de un catálogo, no hace falta que estén protegidas), pero solo se
-- puede subir/borrar desde rutas de servidor con la service_role key.
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('property-photos', 'property-photos', true)
on conflict (id) do nothing;

-- ============================================================================
-- Documentos del formulario de compatibilidad: cuando alguien contesta que es
-- estudiante en /apply, tiene que subir comprobante de solvencia económica y
-- seguro de impago antes de poder enviar la solicitud (ver /api/apply/documents
-- y lib/application-scoring.ts). Se guardan acá, en un bucket privado.
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('application-documents', 'application-documents', false)
on conflict (id) do nothing;

-- Sin policies para anon/authenticated a propósito: la subida y cualquier
-- lectura pasan siempre por rutas de servidor con la service_role key
-- (que bypassea RLS), igual que el resto de las tablas de este archivo.
