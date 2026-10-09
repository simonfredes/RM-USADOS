# RM Usados

Web pública de vehículos seleccionados, construida con Next.js 16, React 19 y Tailwind CSS 4. La administración vive en un proyecto separado.

## Desarrollo

```sh
npm install
cp .env.example .env.local
npm run dev
```

Abrí http://localhost:3000. Las credenciales públicas de Supabase habilitan el stock publicado; ver [SUPABASE.md](SUPABASE.md). La web usa Inter, alojada por Next.js en el propio sitio; el navegador no realiza llamadas a Google Fonts. Las fuentes BMW ya no se cargan. La hero usa la foto del local como fondo en móvil y la panorámica de referencia desde 768 px. El buscador permite combinar texto, marca y carrocería, y conserva los filtros al navegar al catálogo y recargar. También incluye accesos rápidos por marca y SUV.

## Validación

```sh
npm run lint
npm run build
npx playwright install chromium webkit
npm run test:e2e
```

Las pruebas cubren móvil, tablet y escritorio, menú y teclado, enlaces de contacto, filtros y persistencia, fotografías faltantes, texto largo, contraste y movimiento reducido. Las pruebas de catálogo con stock usan datos de prueba identificados y un servidor Supabase simulado, sin modificar la base compartida.

```sh
npm run test:e2e:catalog
```

Los informes de Playwright quedan en `playwright-report/` y los artefactos de pruebas en `test-results/`. La suite captura screenshots por viewport para revisión visual.

Los datos de contacto de `src/app/actions.ts` conservan los valores de ejemplo del proyecto. Actualizalos antes de publicar.
