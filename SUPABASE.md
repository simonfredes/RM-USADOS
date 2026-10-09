# Catálogo público de RM Usados

Esta aplicación contiene únicamente la web pública. El panel administrativo y la autenticación pertenecen a otro proyecto.

El catálogo consulta la base compartida de Rhein Motor mediante la clave pública de Supabase, sin sesiones ni credenciales administrativas. Solo muestra registros de `vehiculos` con `sitio = 'usados'` y `estado = 'publicado'`, junto con `imagenes_vehiculo` y el bucket `vehicle-images`. Las políticas RLS existentes controlan el acceso público.

La base ya está inicializada. **No ejecutes una segunda migración inicial.** `supabase/migrations/rhein_motor_initial_schema.sql` documenta el esquema compartido y se conserva como referencia.

Configurá `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` en `.env.local` y en el hosting. Esta web no requiere `SUPABASE_SECRET_KEY`, `DATABASE_URL`, perfiles internos ni URLs de recuperación de contraseña.

Sin configuración válida o sin unidades publicadas, la colección muestra un estado vacío. Las imágenes editoriales de la portada están identificadas como referencias y no se presentan como unidades disponibles.
