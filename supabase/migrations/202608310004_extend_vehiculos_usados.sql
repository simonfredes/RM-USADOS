-- Extensión incremental para la base institucional ya inicializada.
-- No recrea tablas, tipos, funciones, triggers ni políticas existentes.
begin;

alter table public.vehiculos
  add column if not exists motor text,
  add column if not exists dominio text,
  add column if not exists ubicacion text;

create unique index if not exists vehiculos_dominio_unico
  on public.vehiculos (upper(dominio))
  where dominio is not null and length(trim(dominio)) > 0;

comment on column public.vehiculos.motor is 'Motorización o denominación comercial del motor.';
comment on column public.vehiculos.dominio is 'Patente/dominio normalizado en mayúsculas, sin espacios.';
comment on column public.vehiculos.ubicacion is 'Ubicación general de la unidad.';

commit;

notify pgrst, 'reload schema';
