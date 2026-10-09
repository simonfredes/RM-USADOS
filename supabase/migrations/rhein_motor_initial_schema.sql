-- ============================================================
-- RHEIN MOTOR S.A.
-- Migración inicial para Supabase / PostgreSQL
-- Versión: 1.0
--
-- Alcance incluido:
--   - Perfiles internos y roles
--   - Personas identificadas por DNI
--   - Leads e historial de estados
--   - Interacciones y recontactos
--   - Pecera con rotación equitativa y vencimiento a 30 minutos
--   - Transferencias entre vendedores
--   - Derivaciones a otras áreas creando un nuevo lead relacionado
--   - Vehículos usados e imágenes
--   - Ventas simples
--   - Auditoría de acciones importantes
--   - RLS para Supabase
--   - Bucket público para imágenes de vehículos usados
--
-- Alcance postergado:
--   - BMW 0 km en base de datos
--   - Checklist/especificaciones
--   - Calendario completo
--   - Campañas de email
--   - Importación histórica
--   - Dashboard y métricas
--
-- IMPORTANTE:
--   Ejecutar una sola vez sobre un proyecto nuevo.
-- ============================================================

begin;

create extension if not exists pgcrypto with schema extensions;

-- ============================================================
-- 1. TIPOS
-- ============================================================

create type public.rol_app as enum (
    'superadmin',
    'recepcion',
    'vendedor_0km',
    'vendedor_usados',
    'repuestos',
    'detailing'
);

create type public.area_lead as enum (
    'ventas_0km',
    'ventas_usados',
    'repuestos',
    'detailing'
);

create type public.estado_lead as enum (
    'nuevo',
    'en_pecera',
    'asignado',
    'contactado',
    'seguimiento',
    'visita_coordinada',
    'negociacion',
    'cerrado',
    'perdido'
);

create type public.tipo_interaccion as enum (
    'recepcion',
    'llamada',
    'whatsapp',
    'email',
    'presencial',
    'nota_interna',
    'otro'
);

create type public.estado_intento_asignacion as enum (
    'pendiente',
    'aceptado',
    'vencido',
    'cancelado'
);

create type public.sitio_vehiculo as enum (
    'usados',
    'bmw_oficial'
);

create type public.estado_vehiculo as enum (
    'borrador',
    'publicado',
    'vendido',
    'archivado'
);

create type public.moneda as enum (
    'ARS',
    'USD'
);

create type public.tipo_venta as enum (
    'bmw_0km',
    'usado_bmw',
    'usado_multimarca'
);

-- ============================================================
-- 2. UTILIDADES GENERALES
-- ============================================================

create or replace function public.set_actualizado_en()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.actualizado_en = now();
    return new;
end;
$$;

-- ============================================================
-- 3. PERFILES INTERNOS
-- ============================================================

create table public.perfiles (
    id uuid primary key references auth.users(id) on delete cascade,
    nombre text,
    apellido text,
    email text not null,
    rol public.rol_app,
    activo boolean not null default false,
    creado_en timestamptz not null default now(),
    actualizado_en timestamptz not null default now()
);

create unique index perfiles_email_unico
    on public.perfiles (lower(email));

create trigger perfiles_set_actualizado_en
before update on public.perfiles
for each row execute function public.set_actualizado_en();

comment on table public.perfiles is
'Usuarios internos. Los usuarios nuevos quedan inactivos y sin rol hasta ser habilitados por un superadmin.';

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.perfiles (
        id,
        nombre,
        apellido,
        email,
        rol,
        activo
    )
    values (
        new.id,
        nullif(trim(new.raw_user_meta_data ->> 'nombre'), ''),
        nullif(trim(new.raw_user_meta_data ->> 'apellido'), ''),
        coalesce(new.email, ''),
        null,
        false
    );

    return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

-- ============================================================
-- 4. FUNCIONES DE ROLES Y PERMISOS
-- ============================================================

create or replace function public.rol_actual()
returns public.rol_app
language sql
stable
security definer
set search_path = ''
as $$
    select p.rol
    from public.perfiles p
    where p.id = auth.uid()
      and p.activo = true
    limit 1;
$$;

create or replace function public.es_usuario_interno()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.perfiles p
        where p.id = auth.uid()
          and p.activo = true
          and p.rol is not null
    );
$$;

create or replace function public.tiene_rol(p_roles public.rol_app[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select coalesce(public.rol_actual() = any(p_roles), false);
$$;

create or replace function public.rol_corresponde_area(
    p_rol public.rol_app,
    p_area public.area_lead
)
returns boolean
language sql
immutable
set search_path = ''
as $$
    select case p_area
        when 'ventas_0km'::public.area_lead
            then p_rol = 'vendedor_0km'::public.rol_app
        when 'ventas_usados'::public.area_lead
            then p_rol = 'vendedor_usados'::public.rol_app
        when 'repuestos'::public.area_lead
            then p_rol = 'repuestos'::public.rol_app
        when 'detailing'::public.area_lead
            then p_rol = 'detailing'::public.rol_app
        else false
    end;
$$;

-- ============================================================
-- 5. PERSONAS
-- ============================================================

create table public.personas (
    id uuid primary key default gen_random_uuid(),

    -- Guardar únicamente dígitos. El DNI es la llave de negocio,
    -- pero el UUID continúa siendo la clave primaria técnica.
    dni text not null,
    nombre text not null,
    apellido text not null,
    telefono text not null,
    email text,
    fecha_nacimiento date,
    acepta_emails boolean not null default false,

    creado_por uuid references public.perfiles(id) on delete restrict,
    creado_en timestamptz not null default now(),
    actualizado_en timestamptz not null default now(),

    constraint personas_dni_formato
        check (dni ~ '^[0-9]{7,8}$'),

    constraint personas_dni_unico
        unique (dni),

    constraint personas_email_no_vacio
        check (email is null or length(trim(email)) > 0)
);

create index personas_apellido_nombre_idx
    on public.personas (apellido, nombre);

create index personas_telefono_idx
    on public.personas (telefono);

create index personas_email_idx
    on public.personas (lower(email))
    where email is not null;

create trigger personas_set_actualizado_en
before update on public.personas
for each row execute function public.set_actualizado_en();

-- ============================================================
-- 6. CANALES DE ORIGEN
-- ============================================================

create table public.canales_lead (
    id smallint generated always as identity primary key,
    codigo text not null unique,
    nombre text not null,
    activo boolean not null default true,
    creado_en timestamptz not null default now()
);

insert into public.canales_lead (codigo, nombre) values
    ('telefono', 'Teléfono'),
    ('whatsapp', 'WhatsApp'),
    ('web_bmw', 'Sitio institucional BMW'),
    ('web_usados', 'Sitio de usados'),
    ('presencial', 'Atención presencial'),
    ('mercado_libre', 'Mercado Libre'),
    ('instagram', 'Instagram'),
    ('facebook', 'Facebook'),
    ('referido', 'Referido'),
    ('otro', 'Otro');

-- ============================================================
-- 7. VEHÍCULOS USADOS
-- ============================================================

create table public.vehiculos (
    id uuid primary key default gen_random_uuid(),

    -- Inicialmente se utilizará únicamente 'usados'.
    -- Se conserva la columna para una futura integración BMW oficial.
    sitio public.sitio_vehiculo not null default 'usados',

    marca text not null,
    modelo text not null,
    version text,
    anio smallint not null,
    kilometraje integer,
    precio numeric(14,2),
    moneda public.moneda,
    combustible text,
    transmision text,
    carroceria text,
    color text,
    descripcion text,

    estado public.estado_vehiculo not null default 'borrador',
    slug text unique,

    creado_por uuid references public.perfiles(id) on delete restrict,
    creado_en timestamptz not null default now(),
    actualizado_en timestamptz not null default now(),

    constraint vehiculos_anio_valido
        check (anio between 1900 and 2100),

    constraint vehiculos_kilometraje_valido
        check (kilometraje is null or kilometraje >= 0),

    constraint vehiculos_precio_valido
        check (precio is null or precio >= 0),

    constraint vehiculos_precio_moneda
        check (
            (precio is null and moneda is null)
            or
            (precio is not null and moneda is not null)
        )
);

create index vehiculos_publicacion_idx
    on public.vehiculos (sitio, estado, creado_en desc);

create index vehiculos_busqueda_idx
    on public.vehiculos (marca, modelo, anio desc);

create trigger vehiculos_set_actualizado_en
before update on public.vehiculos
for each row execute function public.set_actualizado_en();

create table public.imagenes_vehiculo (
    id uuid primary key default gen_random_uuid(),
    vehiculo_id uuid not null references public.vehiculos(id) on delete cascade,
    storage_path text not null,
    orden smallint not null default 0,
    creado_en timestamptz not null default now(),

    constraint imagenes_vehiculo_orden_valido
        check (orden >= 0),

    constraint imagenes_vehiculo_orden_unico
        unique (vehiculo_id, orden)
);

create index imagenes_vehiculo_vehiculo_idx
    on public.imagenes_vehiculo (vehiculo_id, orden);

-- ============================================================
-- 8. LEADS
-- ============================================================

create table public.leads (
    id uuid primary key default gen_random_uuid(),
    persona_id uuid not null references public.personas(id) on delete restrict,
    canal_id smallint not null references public.canales_lead(id) on delete restrict,

    area public.area_lead not null,
    motivo text not null,
    resumen_inicial text not null,

    -- Solo se utiliza cuando el lead consulta por un usado cargado
    -- en la tabla vehiculos. Para BMW 0 km puede quedar NULL.
    vehiculo_id uuid references public.vehiculos(id) on delete set null,
    vehiculo_referencia text,

    estado public.estado_lead not null default 'nuevo',
    responsable_actual_id uuid references public.perfiles(id) on delete restrict,

    creado_por uuid references public.perfiles(id) on delete restrict,

    fecha_ingreso_pecera timestamptz,
    fecha_asignacion timestamptz,
    fecha_primer_contacto timestamptz,
    fecha_ultima_interaccion timestamptz,

    proximo_contacto_en timestamptz,
    nota_proximo_contacto text,

    fecha_cierre timestamptz,
    motivo_perdida text,

    creado_en timestamptz not null default now(),
    actualizado_en timestamptz not null default now(),

    constraint leads_motivo_no_vacio
        check (length(trim(motivo)) > 0),

    constraint leads_resumen_no_vacio
        check (length(trim(resumen_inicial)) > 0),

    constraint leads_perdido_con_motivo
        check (
            estado <> 'perdido'::public.estado_lead
            or nullif(trim(motivo_perdida), '') is not null
        )
);

create index leads_persona_idx
    on public.leads (persona_id, creado_en desc);

create index leads_area_estado_idx
    on public.leads (area, estado, creado_en desc);

create index leads_responsable_estado_idx
    on public.leads (responsable_actual_id, estado, creado_en desc);

create index leads_recontactos_idx
    on public.leads (responsable_actual_id, proximo_contacto_en)
    where estado not in ('cerrado', 'perdido');

create index leads_vehiculo_idx
    on public.leads (vehiculo_id)
    where vehiculo_id is not null;

create trigger leads_set_actualizado_en
before update on public.leads
for each row execute function public.set_actualizado_en();

create or replace function public.preparar_cierre_lead()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    if new.estado in (
        'cerrado'::public.estado_lead,
        'perdido'::public.estado_lead
    ) and old.estado is distinct from new.estado then
        new.fecha_cierre = coalesce(new.fecha_cierre, now());
        new.proximo_contacto_en = null;
        new.nota_proximo_contacto = null;
    elsif new.estado not in (
        'cerrado'::public.estado_lead,
        'perdido'::public.estado_lead
    ) and old.estado in (
        'cerrado'::public.estado_lead,
        'perdido'::public.estado_lead
    ) then
        new.fecha_cierre = null;
    end if;

    if new.estado <> 'perdido'::public.estado_lead then
        new.motivo_perdida = null;
    end if;

    return new;
end;
$$;

create trigger leads_preparar_cierre
before update on public.leads
for each row execute function public.preparar_cierre_lead();

-- ============================================================
-- 9. HISTORIAL DE ESTADOS
-- ============================================================

create table public.historial_estados_lead (
    id bigint generated always as identity primary key,
    lead_id uuid not null references public.leads(id) on delete cascade,
    estado_anterior public.estado_lead,
    estado_nuevo public.estado_lead not null,
    cambiado_por uuid references public.perfiles(id) on delete restrict,
    motivo text,
    creado_en timestamptz not null default now()
);

create index historial_estados_lead_idx
    on public.historial_estados_lead (lead_id, creado_en desc);

create or replace function public.registrar_historial_estado_lead()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    if tg_op = 'INSERT' then
        insert into public.historial_estados_lead (
            lead_id,
            estado_anterior,
            estado_nuevo,
            cambiado_por
        )
        values (
            new.id,
            null,
            new.estado,
            auth.uid()
        );

    elsif new.estado is distinct from old.estado then
        insert into public.historial_estados_lead (
            lead_id,
            estado_anterior,
            estado_nuevo,
            cambiado_por
        )
        values (
            new.id,
            old.estado,
            new.estado,
            auth.uid()
        );
    end if;

    return new;
end;
$$;

create trigger leads_registrar_historial_estado
after insert or update of estado on public.leads
for each row execute function public.registrar_historial_estado_lead();

-- ============================================================
-- 10. INTERACCIONES Y RECONTACTOS
-- ============================================================

create table public.interacciones (
    id uuid primary key default gen_random_uuid(),
    lead_id uuid not null references public.leads(id) on delete cascade,
    usuario_id uuid references public.perfiles(id) on delete restrict,

    tipo public.tipo_interaccion not null default 'nota_interna',
    comentario text not null,

    -- Si se completa, pasa a ser el próximo recontacto vigente del lead.
    proximo_contacto_en timestamptz,
    nota_proximo_contacto text,

    ocurrido_en timestamptz not null default now(),
    creado_en timestamptz not null default now(),
    actualizado_en timestamptz not null default now(),

    constraint interacciones_comentario_no_vacio
        check (length(trim(comentario)) > 0),

    constraint interacciones_proximo_contacto_nota
        check (
            proximo_contacto_en is null
            or nullif(trim(nota_proximo_contacto), '') is not null
        )
);

create index interacciones_lead_idx
    on public.interacciones (lead_id, ocurrido_en desc);

create trigger interacciones_set_actualizado_en
before update on public.interacciones
for each row execute function public.set_actualizado_en();

create or replace function public.actualizar_lead_desde_interaccion()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    update public.leads
    set
        fecha_ultima_interaccion = greatest(
            coalesce(fecha_ultima_interaccion, new.ocurrido_en),
            new.ocurrido_en
        ),
        fecha_primer_contacto = case
            when new.tipo <> 'recepcion'::public.tipo_interaccion
                then coalesce(fecha_primer_contacto, new.ocurrido_en)
            else fecha_primer_contacto
        end,
        proximo_contacto_en = case
            when new.proximo_contacto_en is not null
                then new.proximo_contacto_en
            else proximo_contacto_en
        end,
        nota_proximo_contacto = case
            when new.proximo_contacto_en is not null
                then new.nota_proximo_contacto
            else nota_proximo_contacto
        end
    where id = new.lead_id;

    return new;
end;
$$;

create trigger interacciones_actualizar_lead
after insert on public.interacciones
for each row execute function public.actualizar_lead_desde_interaccion();

-- ============================================================
-- 11. PECERA
-- ============================================================

create table public.intentos_asignacion_lead (
    id uuid primary key default gen_random_uuid(),
    lead_id uuid not null references public.leads(id) on delete cascade,
    vendedor_id uuid not null references public.perfiles(id) on delete restrict,

    numero_intento smallint not null,
    estado public.estado_intento_asignacion not null default 'pendiente',

    ofrecido_en timestamptz not null default now(),
    vence_en timestamptz not null,
    aceptado_en timestamptz,
    finalizado_en timestamptz,

    constraint intentos_asignacion_numero_valido
        check (numero_intento > 0),

    constraint intentos_asignacion_vencimiento_valido
        check (vence_en > ofrecido_en),

    constraint intentos_asignacion_numero_unico
        unique (lead_id, numero_intento)
);

create unique index intentos_asignacion_un_pendiente_por_lead
    on public.intentos_asignacion_lead (lead_id)
    where estado = 'pendiente';

create index intentos_asignacion_vendedor_idx
    on public.intentos_asignacion_lead (
        vendedor_id,
        estado,
        vence_en
    );

create index intentos_asignacion_vencidos_idx
    on public.intentos_asignacion_lead (vence_en)
    where estado = 'pendiente';

-- Función interna: selecciona al vendedor elegible que hace más tiempo
-- no recibe un ofrecimiento en esa área. Esto produce una rotación
-- equitativa sin utilizar aleatoriedad pura.
create or replace function public._asignar_siguiente_vendedor(
    p_lead_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_area public.area_lead;
    v_inicio_ronda timestamptz;
    v_rol_requerido public.rol_app;
    v_vendedor_id uuid;
    v_intento_id uuid;
    v_numero_intento smallint;
begin
    select l.area, l.fecha_ingreso_pecera
    into v_area, v_inicio_ronda
    from public.leads l
    where l.id = p_lead_id
    for update;

    if not found then
        raise exception 'Lead inexistente';
    end if;

    if v_area = 'ventas_0km'::public.area_lead then
        v_rol_requerido := 'vendedor_0km'::public.rol_app;
    elsif v_area = 'ventas_usados'::public.area_lead then
        v_rol_requerido := 'vendedor_usados'::public.rol_app;
    else
        raise exception 'Solo los leads de ventas pueden ingresar a la Pecera';
    end if;

    -- Dentro de una misma ronda, no se ofrece nuevamente el lead a un
    -- vendedor que ya lo dejó vencer o cuyo intento fue cancelado.
    -- Recepción puede iniciar una nueva ronda más adelante.
    select p.id
    into v_vendedor_id
    from public.perfiles p
    where p.activo = true
      and p.rol = v_rol_requerido
      and not exists (
          select 1
          from public.intentos_asignacion_lead ia_prev
          where ia_prev.lead_id = p_lead_id
            and ia_prev.vendedor_id = p.id
            and ia_prev.ofrecido_en >= coalesce(v_inicio_ronda, '-infinity'::timestamptz)
      )
    order by
        (
            select max(ia.ofrecido_en)
            from public.intentos_asignacion_lead ia
            join public.leads l2 on l2.id = ia.lead_id
            where ia.vendedor_id = p.id
              and l2.area = v_area
        ) asc nulls first,
        p.creado_en asc,
        p.id asc
    limit 1;

    if v_vendedor_id is null then
        update public.leads
        set
            estado = 'nuevo',
            responsable_actual_id = null
        where id = p_lead_id;

        return null;
    end if;

    select coalesce(max(ia.numero_intento), 0) + 1
    into v_numero_intento
    from public.intentos_asignacion_lead ia
    where ia.lead_id = p_lead_id;

    insert into public.intentos_asignacion_lead (
        lead_id,
        vendedor_id,
        numero_intento,
        estado,
        ofrecido_en,
        vence_en
    )
    values (
        p_lead_id,
        v_vendedor_id,
        v_numero_intento,
        'pendiente',
        now(),
        now() + interval '30 minutes'
    )
    returning id into v_intento_id;

    update public.leads
    set
        estado = 'en_pecera',
        responsable_actual_id = null,
        fecha_ingreso_pecera = coalesce(fecha_ingreso_pecera, now())
    where id = p_lead_id;

    return v_intento_id;
end;
$$;

create or replace function public.enviar_lead_a_pecera(
    p_lead_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_estado public.estado_lead;
begin
    if not public.tiene_rol(
        array[
            'superadmin'::public.rol_app,
            'recepcion'::public.rol_app
        ]
    ) then
        raise exception 'No tenés permiso para enviar leads a la Pecera';
    end if;

    select l.estado
    into v_estado
    from public.leads l
    where l.id = p_lead_id
    for update;

    if not found then
        raise exception 'Lead inexistente';
    end if;

    if v_estado in (
        'cerrado'::public.estado_lead,
        'perdido'::public.estado_lead
    ) then
        raise exception 'No se puede enviar un lead cerrado o perdido a la Pecera';
    end if;

    update public.intentos_asignacion_lead
    set
        estado = 'cancelado',
        finalizado_en = now()
    where lead_id = p_lead_id
      and estado = 'pendiente';

    -- Cada envío manual de Recepción abre una nueva ronda.
    update public.leads
    set
        fecha_ingreso_pecera = now(),
        responsable_actual_id = null
    where id = p_lead_id;

    return public._asignar_siguiente_vendedor(p_lead_id);
end;
$$;

create or replace function public.aceptar_lead(
    p_intento_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_intento public.intentos_asignacion_lead%rowtype;
begin
    select *
    into v_intento
    from public.intentos_asignacion_lead
    where id = p_intento_id
    for update;

    if not found then
        raise exception 'Intento de asignación inexistente';
    end if;

    if v_intento.vendedor_id <> auth.uid() then
        raise exception 'Este lead no fue ofrecido al usuario actual';
    end if;

    if v_intento.estado <> 'pendiente'::public.estado_intento_asignacion then
        return false;
    end if;

    if now() > v_intento.vence_en then
        update public.intentos_asignacion_lead
        set
            estado = 'vencido',
            finalizado_en = now()
        where id = p_intento_id;

        perform public._asignar_siguiente_vendedor(v_intento.lead_id);
        return false;
    end if;

    update public.intentos_asignacion_lead
    set
        estado = 'aceptado',
        aceptado_en = now(),
        finalizado_en = now()
    where id = p_intento_id;

    update public.leads
    set
        responsable_actual_id = v_intento.vendedor_id,
        estado = 'asignado',
        fecha_asignacion = now()
    where id = v_intento.lead_id;

    return true;
end;
$$;

-- Ejecutar periódicamente mediante Supabase Cron cuando se habilite.
create or replace function public.procesar_asignaciones_vencidas()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_intento record;
    v_cantidad integer := 0;
begin
    for v_intento in
        select ia.id, ia.lead_id
        from public.intentos_asignacion_lead ia
        where ia.estado = 'pendiente'
          and ia.vence_en <= now()
        order by ia.vence_en
        for update skip locked
    loop
        update public.intentos_asignacion_lead
        set
            estado = 'vencido',
            finalizado_en = now()
        where id = v_intento.id;

        perform public._asignar_siguiente_vendedor(v_intento.lead_id);
        v_cantidad := v_cantidad + 1;
    end loop;

    return v_cantidad;
end;
$$;

-- ============================================================
-- 12. FUNCIONES DE VISIBILIDAD
-- ============================================================

create or replace function public.puede_ver_lead(p_lead_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select
        case
            when public.tiene_rol(
                array[
                    'superadmin'::public.rol_app,
                    'recepcion'::public.rol_app
                ]
            ) then true

            when public.rol_actual() in (
                'vendedor_0km'::public.rol_app,
                'vendedor_usados'::public.rol_app
            ) then exists (
                select 1
                from public.leads l
                where l.id = p_lead_id
                  and (
                      l.responsable_actual_id = auth.uid()
                      or exists (
                          select 1
                          from public.intentos_asignacion_lead ia
                          where ia.lead_id = l.id
                            and ia.vendedor_id = auth.uid()
                            and ia.estado = 'pendiente'
                            and ia.vence_en > now()
                      )
                  )
            )

            when public.rol_actual() = 'repuestos'::public.rol_app then exists (
                select 1
                from public.leads l
                where l.id = p_lead_id
                  and l.area = 'repuestos'
            )

            when public.rol_actual() = 'detailing'::public.rol_app then exists (
                select 1
                from public.leads l
                where l.id = p_lead_id
                  and l.area = 'detailing'
            )

            else false
        end;
$$;

create or replace function public.puede_editar_lead(p_lead_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select
        case
            when public.tiene_rol(
                array[
                    'superadmin'::public.rol_app,
                    'recepcion'::public.rol_app
                ]
            ) then true

            when public.rol_actual() in (
                'vendedor_0km'::public.rol_app,
                'vendedor_usados'::public.rol_app
            ) then exists (
                select 1
                from public.leads l
                where l.id = p_lead_id
                  and l.responsable_actual_id = auth.uid()
            )

            when public.rol_actual() = 'repuestos'::public.rol_app then exists (
                select 1
                from public.leads l
                where l.id = p_lead_id
                  and l.area = 'repuestos'
            )

            when public.rol_actual() = 'detailing'::public.rol_app then exists (
                select 1
                from public.leads l
                where l.id = p_lead_id
                  and l.area = 'detailing'
            )

            else false
        end;
$$;

create or replace function public.puede_ver_persona(p_persona_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select
        public.tiene_rol(
            array[
                'superadmin'::public.rol_app,
                'recepcion'::public.rol_app
            ]
        )
        or exists (
            select 1
            from public.leads l
            where l.persona_id = p_persona_id
              and public.puede_ver_lead(l.id)
        );
$$;

-- ============================================================
-- 13. TRANSFERENCIAS ENTRE VENDEDORES
-- ============================================================

create table public.transferencias_lead (
    id uuid primary key default gen_random_uuid(),
    lead_id uuid not null references public.leads(id) on delete cascade,
    vendedor_anterior_id uuid references public.perfiles(id) on delete restrict,
    vendedor_nuevo_id uuid not null references public.perfiles(id) on delete restrict,
    motivo text not null,
    transferido_por uuid references public.perfiles(id) on delete restrict,
    creado_en timestamptz not null default now(),

    constraint transferencias_lead_motivo_no_vacio
        check (length(trim(motivo)) > 0),

    constraint transferencias_vendedores_distintos
        check (
            vendedor_anterior_id is null
            or vendedor_anterior_id <> vendedor_nuevo_id
        )
);

create index transferencias_lead_idx
    on public.transferencias_lead (lead_id, creado_en desc);

create or replace function public.transferir_lead(
    p_lead_id uuid,
    p_vendedor_nuevo_id uuid,
    p_motivo text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_lead public.leads%rowtype;
    v_rol_destino public.rol_app;
begin
    select *
    into v_lead
    from public.leads
    where id = p_lead_id
    for update;

    if not found then
        raise exception 'Lead inexistente';
    end if;

    if not (
        public.tiene_rol(
            array[
                'superadmin'::public.rol_app,
                'recepcion'::public.rol_app
            ]
        )
        or v_lead.responsable_actual_id = auth.uid()
    ) then
        raise exception 'No tenés permiso para transferir este lead';
    end if;

    select p.rol
    into v_rol_destino
    from public.perfiles p
    where p.id = p_vendedor_nuevo_id
      and p.activo = true;

    if v_rol_destino is null then
        raise exception 'El usuario de destino no existe o está inactivo';
    end if;

    if not public.rol_corresponde_area(v_rol_destino, v_lead.area) then
        raise exception 'El rol del usuario de destino no corresponde al área del lead';
    end if;

    if nullif(trim(p_motivo), '') is null then
        raise exception 'El motivo de transferencia es obligatorio';
    end if;

    update public.intentos_asignacion_lead
    set
        estado = 'cancelado',
        finalizado_en = now()
    where lead_id = p_lead_id
      and estado = 'pendiente';

    insert into public.transferencias_lead (
        lead_id,
        vendedor_anterior_id,
        vendedor_nuevo_id,
        motivo,
        transferido_por
    )
    values (
        p_lead_id,
        v_lead.responsable_actual_id,
        p_vendedor_nuevo_id,
        trim(p_motivo),
        auth.uid()
    );

    update public.leads
    set
        responsable_actual_id = p_vendedor_nuevo_id,
        estado = 'asignado',
        fecha_asignacion = now()
    where id = p_lead_id;
end;
$$;

-- ============================================================
-- 14. DERIVACIONES A OTRAS ÁREAS
-- ============================================================

create table public.derivaciones_lead (
    id uuid primary key default gen_random_uuid(),
    lead_origen_id uuid not null references public.leads(id) on delete restrict,
    lead_destino_id uuid not null references public.leads(id) on delete restrict,

    area_origen public.area_lead not null,
    area_destino public.area_lead not null,

    motivo text not null,
    derivado_por uuid references public.perfiles(id) on delete restrict,
    creado_en timestamptz not null default now(),

    constraint derivaciones_areas_distintas
        check (area_origen <> area_destino),

    constraint derivaciones_motivo_no_vacio
        check (length(trim(motivo)) > 0),

    constraint derivaciones_leads_distintos
        check (lead_origen_id <> lead_destino_id)
);

create index derivaciones_origen_idx
    on public.derivaciones_lead (lead_origen_id, creado_en desc);

create index derivaciones_destino_idx
    on public.derivaciones_lead (lead_destino_id, creado_en desc);

-- Una derivación entre áreas crea un nuevo lead para la misma persona.
-- De esta forma, la oportunidad comercial original no se pierde.
create or replace function public.derivar_lead(
    p_lead_origen_id uuid,
    p_area_destino public.area_lead,
    p_motivo text,
    p_usuario_destino_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_origen public.leads%rowtype;
    v_lead_destino_id uuid;
    v_rol_destino public.rol_app;
begin
    select *
    into v_origen
    from public.leads
    where id = p_lead_origen_id;

    if not found then
        raise exception 'Lead de origen inexistente';
    end if;

    if not public.puede_editar_lead(p_lead_origen_id) then
        raise exception 'No tenés permiso para derivar este lead';
    end if;

    if p_area_destino = v_origen.area then
        raise exception 'Para cambiar de responsable dentro de la misma área, usá transferir_lead';
    end if;

    if nullif(trim(p_motivo), '') is null then
        raise exception 'El motivo de derivación es obligatorio';
    end if;

    if p_usuario_destino_id is not null then
        select p.rol
        into v_rol_destino
        from public.perfiles p
        where p.id = p_usuario_destino_id
          and p.activo = true;

        if v_rol_destino is null then
            raise exception 'El usuario de destino no existe o está inactivo';
        end if;

        if not public.rol_corresponde_area(v_rol_destino, p_area_destino) then
            raise exception 'El rol del usuario de destino no corresponde al área';
        end if;
    end if;

    insert into public.leads (
        persona_id,
        canal_id,
        area,
        motivo,
        resumen_inicial,
        vehiculo_id,
        vehiculo_referencia,
        estado,
        responsable_actual_id,
        creado_por,
        fecha_asignacion
    )
    values (
        v_origen.persona_id,
        v_origen.canal_id,
        p_area_destino,
        'Derivación interna',
        trim(p_motivo),
        v_origen.vehiculo_id,
        v_origen.vehiculo_referencia,
        case
            when p_usuario_destino_id is null
                then 'nuevo'::public.estado_lead
            else 'asignado'::public.estado_lead
        end,
        p_usuario_destino_id,
        auth.uid(),
        case
            when p_usuario_destino_id is null then null
            else now()
        end
    )
    returning id into v_lead_destino_id;

    insert into public.derivaciones_lead (
        lead_origen_id,
        lead_destino_id,
        area_origen,
        area_destino,
        motivo,
        derivado_por
    )
    values (
        p_lead_origen_id,
        v_lead_destino_id,
        v_origen.area,
        p_area_destino,
        trim(p_motivo),
        auth.uid()
    );

    insert into public.interacciones (
        lead_id,
        usuario_id,
        tipo,
        comentario
    )
    values (
        v_lead_destino_id,
        auth.uid(),
        'nota_interna',
        'Lead generado por derivación. ' || trim(p_motivo)
    );

    return v_lead_destino_id;
end;
$$;

-- ============================================================
-- 15. VENTAS SIMPLES
-- ============================================================

create table public.ventas (
    id uuid primary key default gen_random_uuid(),
    persona_id uuid not null references public.personas(id) on delete restrict,
    lead_id uuid not null references public.leads(id) on delete restrict,

    -- Puede ser NULL para BMW 0 km mientras ese stock no viva en la base.
    vehiculo_id uuid references public.vehiculos(id) on delete set null,
    vehiculo_descripcion text,

    vendedor_id uuid not null references public.perfiles(id) on delete restrict,
    tipo public.tipo_venta not null,
    fecha_venta date not null default current_date,

    precio numeric(14,2),
    moneda public.moneda,
    comentario text,

    creado_por uuid references public.perfiles(id) on delete restrict,
    creado_en timestamptz not null default now(),
    actualizado_en timestamptz not null default now(),

    constraint ventas_vehiculo_identificado
        check (
            vehiculo_id is not null
            or nullif(trim(vehiculo_descripcion), '') is not null
        ),

    constraint ventas_precio_valido
        check (precio is null or precio >= 0),

    constraint ventas_precio_moneda
        check (
            (precio is null and moneda is null)
            or
            (precio is not null and moneda is not null)
        )
);

create index ventas_persona_idx
    on public.ventas (persona_id, fecha_venta desc);

create index ventas_vendedor_idx
    on public.ventas (vendedor_id, fecha_venta desc);

create index ventas_lead_idx
    on public.ventas (lead_id);

create trigger ventas_set_actualizado_en
before update on public.ventas
for each row execute function public.set_actualizado_en();

create or replace function public.cerrar_lead_desde_venta()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    update public.leads
    set
        estado = 'cerrado',
        responsable_actual_id = new.vendedor_id,
        fecha_cierre = coalesce(fecha_cierre, now())
    where id = new.lead_id;

    if new.vehiculo_id is not null then
        update public.vehiculos
        set estado = 'vendido'
        where id = new.vehiculo_id;
    end if;

    return new;
end;
$$;

create trigger ventas_cerrar_lead
after insert on public.ventas
for each row execute function public.cerrar_lead_desde_venta();

-- ============================================================
-- 16. AUDITORÍA
-- ============================================================

create table public.auditoria (
    id bigint generated always as identity primary key,
    usuario_id uuid references public.perfiles(id) on delete restrict,
    accion text not null,
    entidad text not null,
    entidad_id uuid,
    datos_anteriores jsonb,
    datos_nuevos jsonb,
    creado_en timestamptz not null default now()
);

create index auditoria_entidad_idx
    on public.auditoria (entidad, entidad_id, creado_en desc);

create index auditoria_usuario_idx
    on public.auditoria (usuario_id, creado_en desc);

create or replace function public.registrar_auditoria()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_entidad_id uuid;
begin
    if tg_op = 'DELETE' then
        v_entidad_id := old.id;

        insert into public.auditoria (
            usuario_id,
            accion,
            entidad,
            entidad_id,
            datos_anteriores,
            datos_nuevos
        )
        values (
            auth.uid(),
            'DELETE',
            tg_table_name,
            v_entidad_id,
            to_jsonb(old),
            null
        );

        return old;
    elsif tg_op = 'UPDATE' then
        v_entidad_id := new.id;

        insert into public.auditoria (
            usuario_id,
            accion,
            entidad,
            entidad_id,
            datos_anteriores,
            datos_nuevos
        )
        values (
            auth.uid(),
            'UPDATE',
            tg_table_name,
            v_entidad_id,
            to_jsonb(old),
            to_jsonb(new)
        );

        return new;
    else
        v_entidad_id := new.id;

        insert into public.auditoria (
            usuario_id,
            accion,
            entidad,
            entidad_id,
            datos_anteriores,
            datos_nuevos
        )
        values (
            auth.uid(),
            'INSERT',
            tg_table_name,
            v_entidad_id,
            null,
            to_jsonb(new)
        );

        return new;
    end if;
end;
$$;

create trigger auditoria_perfiles
after insert or update or delete on public.perfiles
for each row execute function public.registrar_auditoria();

create trigger auditoria_personas
after insert or update or delete on public.personas
for each row execute function public.registrar_auditoria();

create or replace function public.registrar_auditoria_lead_relevante()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    if tg_op = 'INSERT' then
        insert into public.auditoria (
            usuario_id,
            accion,
            entidad,
            entidad_id,
            datos_anteriores,
            datos_nuevos
        )
        values (
            auth.uid(),
            'INSERT',
            tg_table_name,
            new.id,
            null,
            to_jsonb(new)
        );

        return new;
    elsif tg_op = 'DELETE' then
        insert into public.auditoria (
            usuario_id,
            accion,
            entidad,
            entidad_id,
            datos_anteriores,
            datos_nuevos
        )
        values (
            auth.uid(),
            'DELETE',
            tg_table_name,
            old.id,
            to_jsonb(old),
            null
        );

        return old;
    end if;

    -- Evita llenar el log con cada actualización automática de fechas
    -- producida por una interacción. Solo audita cambios comerciales.
    if (
        old.persona_id,
        old.area,
        old.motivo,
        old.resumen_inicial,
        old.vehiculo_id,
        old.vehiculo_referencia,
        old.estado,
        old.responsable_actual_id,
        old.fecha_asignacion,
        old.fecha_cierre,
        old.motivo_perdida
    ) is distinct from (
        new.persona_id,
        new.area,
        new.motivo,
        new.resumen_inicial,
        new.vehiculo_id,
        new.vehiculo_referencia,
        new.estado,
        new.responsable_actual_id,
        new.fecha_asignacion,
        new.fecha_cierre,
        new.motivo_perdida
    ) then
        insert into public.auditoria (
            usuario_id,
            accion,
            entidad,
            entidad_id,
            datos_anteriores,
            datos_nuevos
        )
        values (
            auth.uid(),
            'UPDATE',
            tg_table_name,
            new.id,
            to_jsonb(old),
            to_jsonb(new)
        );
    end if;

    return new;
end;
$$;

create trigger auditoria_leads
after insert or update or delete on public.leads
for each row execute function public.registrar_auditoria_lead_relevante();

create trigger auditoria_intentos_asignacion
after insert or update or delete on public.intentos_asignacion_lead
for each row execute function public.registrar_auditoria();

create trigger auditoria_transferencias
after insert or update or delete on public.transferencias_lead
for each row execute function public.registrar_auditoria();

create trigger auditoria_derivaciones
after insert or update or delete on public.derivaciones_lead
for each row execute function public.registrar_auditoria();

create trigger auditoria_vehiculos
after insert or update or delete on public.vehiculos
for each row execute function public.registrar_auditoria();

create trigger auditoria_ventas
after insert or update or delete on public.ventas
for each row execute function public.registrar_auditoria();

-- ============================================================
-- 17. ROW LEVEL SECURITY
-- ============================================================

alter table public.perfiles enable row level security;
alter table public.personas enable row level security;
alter table public.canales_lead enable row level security;
alter table public.vehiculos enable row level security;
alter table public.imagenes_vehiculo enable row level security;
alter table public.leads enable row level security;
alter table public.historial_estados_lead enable row level security;
alter table public.interacciones enable row level security;
alter table public.intentos_asignacion_lead enable row level security;
alter table public.transferencias_lead enable row level security;
alter table public.derivaciones_lead enable row level security;
alter table public.ventas enable row level security;
alter table public.auditoria enable row level security;

-- ----------------------------
-- PERFILES
-- ----------------------------

create policy perfiles_ver_propio
on public.perfiles
for select
to authenticated
using (id = (select auth.uid()));

create policy perfiles_internos_ven_equipo
on public.perfiles
for select
to authenticated
using (public.es_usuario_interno());

create policy perfiles_superadmin_inserta
on public.perfiles
for insert
on authenticated
with check (
    public.tiene_rol(
        array['superadmin'::public.rol_app]
    )
);

create policy perfiles_superadmin_actualiza
on public.perfiles
for update
to authenticated
using (
    public.tiene_rol(
        array['superadmin'::public.rol_app]
    )
)
with check (
    public.tiene_rol(
        array['superadmin'::public.rol_app]
    )
);

-- No existe policy DELETE: los usuarios deben desactivarse, no borrarse.

-- ----------------------------
-- PERSONAS
-- ----------------------------

create policy personas_ver
on public.personas
for select
to authenticated
using (public.puede_ver_persona(id));

create policy personas_crear
on public.personas
for insert
to authenticated
with check (
    public.tiene_rol(
        array[
            'superadmin'::public.rol_app,
            'recepcion'::public.rol_app
        ]
    )
);

create policy personas_actualizar
on public.personas
for update
to authenticated
using (public.puede_ver_persona(id))
with check (public.puede_ver_persona(id));

-- No existe policy DELETE.

-- ----------------------------
-- CANALES
-- ----------------------------

create policy canales_ver
on public.canales_lead
for select
to authenticated
using (public.es_usuario_interno());

create policy canales_superadmin_crear
on public.canales_lead
for insert
to authenticated
with check (
    public.tiene_rol(
        array['superadmin'::public.rol_app]
    )
);

create policy canales_superadmin_actualizar
on public.canales_lead
for update
to authenticated
using (
    public.tiene_rol(
        array['superadmin'::public.rol_app]
    )
)
with check (
    public.tiene_rol(
        array['superadmin'::public.rol_app]
    )
);

-- ----------------------------
-- VEHÍCULOS
-- ----------------------------

create policy vehiculos_publicos
on public.vehiculos
for select
to anon
using (
    sitio = 'usados'
    and estado = 'publicado'
);

create policy vehiculos_internos_ver
on public.vehiculos
for select
to authenticated
using (public.es_usuario_interno());

create policy vehiculos_gestion_crear
on public.vehiculos
for insert
to authenticated
with check (
    public.tiene_rol(
        array[
            'superadmin'::public.rol_app,
            'vendedor_usados'::public.rol_app
        ]
    )
    and sitio = 'usados'
);

create policy vehiculos_gestion_actualizar
on public.vehiculos
for update
to authenticated
using (
    public.tiene_rol(
        array[
            'superadmin'::public.rol_app,
            'vendedor_usados'::public.rol_app
        ]
    )
)
with check (
    public.tiene_rol(
        array[
            'superadmin'::public.rol_app,
            'vendedor_usados'::public.rol_app
        ]
    )
);

create policy vehiculos_superadmin_eliminar
on public.vehiculos
for delete
to authenticated
using (
    public.tiene_rol(
        array['superadmin'::public.rol_app]
    )
);

-- ----------------------------
-- IMÁGENES DE VEHÍCULOS
-- ----------------------------

create policy imagenes_publicas
on public.imagenes_vehiculo
for select
to anon
using (
    exists (
        select 1
        from public.vehiculos v
        where v.id = vehiculo_id
          and v.sitio = 'usados'
          and v.estado = 'publicado'
    )
);

create policy imagenes_internos_ver
on public.imagenes_vehiculo
for select
to authenticated
using (public.es_usuario_interno());

create policy imagenes_gestion_crear
on public.imagenes_vehiculo
for insert
to authenticated
with check (
    public.tiene_rol(
        array[
            'superadmin'::public.rol_app,
            'vendedor_usados'::public.rol_app
        ]
    )
);

create policy imagenes_gestion_actualizar
on public.imagenes_vehiculo
for update
to authenticated
using (
    public.tiene_rol(
        array[
            'superadmin'::public.rol_app,
            'vendedor_usados'::public.rol_app
        ]
    )
)
with check (
    bucket_id = 'vehicle-images'
    and public.tiene_rol(
        array[
            'superadmin'::public.rol_app,
            'vendedor_usados'::public.rol_app
        ]
    )
);

create policy imagenes_gestion_eliminar
on public.imagenes_vehiculo
for delete
to authenticated
using (
    public.tiene_rol(
        array[
            'superadmin'::public.rol_app,
            'vendedor_usados'::public.rol_app
        ]
    )
);

-- ----------------------------
-- LEADS
-- ----------------------------

create policy leads_ver
on public.leads
for select
to authenticated
using (public.puede_ver_lead(id));

create policy leads_crear
on public.leads
for insert
to authenticated
with check (
    public.tiene_rol(
        array[
            'superadmin'::public.rol_app,
            'recepcion'::public.rol_app
        ]
    )
);

create policy leads_actualizar
on public.leads
for update
to authenticated
using (public.puede_editar_lead(id))
with check (public.puede_editar_lead(id));

-- No existe policy DELETE.

-- ----------------------------
-- HISTORIAL DE ESTADOS
-- ----------------------------

create policy historial_estados_ver
on public.historial_estados_lead
for select
to authenticated
using (public.puede_ver_lead(lead_id));

-- Solo se inserta mediante trigger.

-- ----------------------------
-- INTERACCIONES
-- ----------------------------

create policy interacciones_ver
on public.interacciones
for select
to authenticated
using (public.puede_ver_lead(lead_id));

create policy interacciones_crear
on public.interacciones
for insert
to authenticated
with check (
    public.puede_editar_lead(lead_id)
    and (
        usuario_id = (select auth.uid())
        or usuario_id is null
    )
);

create policy interacciones_actualizar
on public.interacciones
for update
to authenticated
using (
    usuario_id = (select auth.uid())
    or public.tiene_rol(
        array['superadmin'::public.rol_app]
    )
)
with check (
    usuario_id = (select auth.uid())
    or public.tiene_rol(
        array['superadmin'::public.rol_app]
    )
);

-- No existe policy DELETE.

-- ----------------------------
-- INTENTOS DE ASIGNACIÓN
-- ----------------------------

create policy intentos_asignacion_ver
on public.intentos_asignacion_lead
for select
to authenticated
using (
    vendedor_id = (select auth.uid())
    or public.tiene_rol(
        array[
            'superadmin'::public.rol_app,
            'recepcion'::public.rol_app
        ]
    )
);

-- Altas y modificaciones únicamente mediante funciones RPC.

-- ----------------------------
-- TRANSFERENCIAS
-- ----------------------------

create policy transferencias_ver
on public.transferencias_lead
for select
to authenticated
using (public.puede_ver_lead(lead_id));

-- Altas únicamente mediante función RPC.

-- ----------------------------
-- DERIVACIONES
-- ----------------------------

create policy derivaciones_ver
on public.derivaciones_lead
for select
to authenticated
using (
    public.puede_ver_lead(lead_origen_id)
    or public.puede_ver_lead(lead_destino_id)
);

-- Altas únicamente mediante función RPC.

-- ----------------------------
-- VENTAS
-- ----------------------------

create policy ventas_ver
on public.ventas
for select
to authenticated
using (
    vendedor_id = (select auth.uid())
    or public.tiene_rol(
        array[
            'superadmin'::public.rol_app,
            'recepcion'::public.rol_app
        ]
    )
);

create policy ventas_crear
on public.ventas
for insert
to authenticated
with check (
    (
        vendedor_id = (select auth.uid())
        and public.puede_editar_lead(lead_id)
    )
    or public.tiene_rol(
        array[
            'superadmin'::public.rol_app,
            'recepcion'::public.rol_app
        ]
    )
);

create policy ventas_actualizar
on public.ventas
for update
to authenticated
using (
    vendedor_id = (select auth.uid())
    or public.tiene_rol(
        array['superadmin'::public.rol_app]
    )
)
with check (
    vendedor_id = (select auth.uid())
    or public.tiene_rol(
        array['superadmin'::public.rol_app]
    )
);

-- No existe policy DELETE.

-- ----------------------------
-- AUDITORÍA
-- ----------------------------

create policy auditoria_superadmin_ver
on public.auditoria
for select
to authenticated
using (
    public.tiene_rol(
        array['superadmin'::public.rol_app]
    )
);

-- No hay policies de escritura: solo escriben triggers SECURITY DEFINER.

-- ============================================================
-- 18. GRANTS PARA LA DATA API
-- ============================================================

grant usage on schema public to anon, authenticated;

grant usage on type
    public.rol_app,
    public.area_lead,
    public.estado_lead,
    public.tipo_interaccion,
    public.estado_intento_asignacion,
    public.sitio_vehiculo,
    public.estado_vehiculo,
    public.moneda,
    public.tipo_venta
to authenticated;

grant usage on type
    public.sitio_vehiculo,
    public.estado_vehiculo,
    public.moneda
to anon;

grant select on public.vehiculos, public.imagenes_vehiculo to anon;

grant select, insert, update, delete
on
    public.perfiles,
    public.personas,
    public.canales_lead,
    public.vehiculos,
    public.imagenes_vehiculo,
    public.leads,
    public.historial_estados_lead,
    public.interacciones,
    public.intentos_asignacion_lead,
    public.transferencias_lead,
    public.derivaciones_lead,
    public.ventas,
    public.auditoria
to authenticated;

grant usage, select on all sequences in schema public to authenticated;

grant execute on function public.rol_actual() to authenticated;
grant execute on function public.es_usuario_interno() to authenticated;
grant execute on function public.tiene_rol(public.rol_app[]) to authenticated;
grant execute on function public.rol_corresponde_area(public.rol_app, public.area_lead) to authenticated;
grant execute on function public.puede_ver_lead(uuid) to authenticated;
grant execute on function public.puede_editar_lead(uuid) to authenticated;
grant execute on function public.puede_ver_persona(uuid) to authenticated;

grant execute on function public.enviar_lead_a_pecera(uuid) to authenticated;
grant execute on function public.aceptar_lead(uuid) to authenticated;
grant execute on function public.transferir_lead(uuid, uuid, text) to authenticated;
grant execute on function public.derivar_lead(uuid, public.area_lead, text, uuid) to authenticated;

grant execute on function public.procesar_asignaciones_vencidas() to service_role;

-- ============================================================
-- 19. STORAGE PARA IMÁGENES DE VEHÍCULOS
-- ============================================================

insert into storage.buckets (
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
)
values (
    'vehicle-images',
    'vehicle-images',
    true,
    10485760,
    array[
        'image/jpeg',
        'image/png',
        'image/webp'
    ]
)
on conflict (id) do nothing;

create policy vehicle_images_public_read
on storage.objects
for select
to public
using (bucket_id = 'vehicle-images');

create policy vehicle_images_internal_insert
on storage.objects
for insert
to authenticated
with check (
    bucket_id = 'vehicle-images'
    and public.tiene_rol(
        array[
            'superadmin'::public.rol_app,
            'vendedor_usados'::public.rol_app
        ]
    )
);

create policy vehicle_images_internal_update
on storage.objects
for update
to authenticated
using (
    bucket_id = 'vehicle-images'
    and public.tiene_rol(
        array[
            'superadmin'::public.rol_app,
            'vendedor_usados'::public.rol_app
        ]
    )
)
with check (
    bucket_id = 'vehicle-images'
    and public.tiene_rol(
        array[
            'superadmin'::public.rol_app,
            'vendedor_usados'::public.rol_app
        ]
    )
);

create policy vehicle_images_internal_delete
on storage.objects
for delete
to authenticated
using (
    bucket_id = 'vehicle-images'
    and public.tiene_rol(
        array[
            'superadmin'::public.rol_app,
            'vendedor_usados'::public.rol_app
        ]
    )
);

commit;

-- ============================================================
-- 20. PASOS MANUALES DESPUÉS DE EJECUTAR
-- ============================================================

-- 1) Crear tu usuario desde Authentication > Users.
--
-- 2) Convertirlo en superadmin reemplazando el correo:
--
-- update public.perfiles
-- set
--     rol = 'superadmin',
--     activo = true,
--     nombre = 'Simon',
--     apellido = 'Fredes'
-- where lower(email) = lower('TU_CORREO@EJEMPLO.COM');
--
-- 3) Crear el resto de usuarios desde Authentication > Users y luego
--    asignarles rol y activar su perfil.
--
-- Ejemplo:
--
-- update public.perfiles
-- set rol = 'recepcion', activo = true
-- where lower(email) = lower('recepcion@rheinmotor.com.ar');
--
-- Roles disponibles:
--   superadmin
--   recepcion
--   vendedor_0km
--   vendedor_usados
--   repuestos
--   detailing
--
-- 4) Habilitar Supabase Cron cuando quieras automatizar los vencimientos.
--    Programar esta función cada minuto:
--
-- select public.procesar_asignaciones_vencidas();
--
-- La función ya está creada; el job de Cron se configura más adelante.
-- ============================================================
