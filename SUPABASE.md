# Catálogo público de RM Usados

Esta aplicación contiene únicamente la web pública. El panel administrativo y la autenticación pertenecen a otro proyecto.

El catálogo consulta la base compartida de Rhein Motor mediante la clave pública de Supabase, sin sesiones ni credenciales administrativas. La clave pública no puede leer las tablas `vehiculos` ni `imagenes_vehiculo`. El sitio llama a la función `catalogo_usados_publico()`, que solo devuelve los usados publicados (`sitio = 'usados'`, `estado = 'publicado'`) con columnas públicas explícitas (sin dominio ni datos internos) y las rutas de sus imágenes en orden. Las imágenes se sirven por URL pública desde el bucket `vehicle-images`. La función se define en el proyecto de Rhein Motor (`db/rhein_motor_module_7_catalogo_publico_migration.sql`).

La base ya está inicializada. **No ejecutes una segunda migración inicial.** `supabase/migrations/rhein_motor_initial_schema.sql` documenta el esquema compartido y se conserva como referencia.

Configurá `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` en `.env.local` y en el hosting. Esta web no requiere `SUPABASE_SECRET_KEY`, `DATABASE_URL`, perfiles internos ni URLs de recuperación de contraseña.

Sin configuración válida o sin unidades publicadas, la colección muestra un estado vacío. Las imágenes editoriales de la portada están identificadas como referencias y no se presentan como unidades disponibles.
