# Revisión de la hero con buscador — RM Usados

Fecha: 9 de octubre de 2026.

La portada presenta una imagen de fondo, el mensaje «Encontrá tu próximo auto.» y el buscador dentro de la hero. Conserva Inter, negro, blanco y azul. La foto del local se usa en móvil; desde 768 px se usa la panorámica de referencia, identificada como tal. La fotografía se adapta al fondo con un recorte y una capa oscura para asegurar la lectura.

## Búsqueda

Texto libre, marca y carrocería se combinan y llegan al catálogo mediante los parámetros `q`, `marca` y `carroceria`. Los filtros permanecen al recargar y se pueden limpiar. Los accesos rápidos por marca y SUV también filtran el catálogo. Las opciones de búsqueda no implican disponibilidad de stock; los resultados proceden del inventario publicado.

## Responsive y revisión visual

- Chromium móvil: 390 × 844.
- Chromium tablet: 768 × 1024.
- Chromium escritorio: 1440 × 900.
- WebKit móvil: 390 × 844.
- Barrido adicional de portada y catálogo: 320, 360, 390, 640, 768, 1024 y 1440 px, sin desborde horizontal.

En móvil, el buscador presenta texto libre, un botón para desplegar marca y carrocería, y la búsqueda a todo el ancho. Los filtros desplegados se apilan a ancho completo para conservar nombres largos. Los accesos rápidos forman una grilla de dos columnas. En tablet, marca y carrocería permanecen visibles en dos columnas. Desde 1024 px se presenta en una fila. Las búsquedas rápidas se acomodan sin scroll horizontal. La nueva carrocería también se puede modificar en el catálogo, cuyos filtros reorganizan sus columnas para conservar las etiquetas legibles.

Capturas inspeccionadas de portada móvil, tablet y escritorio, portada de 320 px y catálogo tablet. El catálogo aparece inmediatamente después de la hero.

## Validación enfocada en este cambio

Build y lint correctos. Trece casos aprobados: portada en cuatro entornos, accesibilidad automatizada en cuatro entornos, búsqueda combinada y accesos rápidos en cuatro entornos, y un barrido responsive completo. Tres combinaciones del barrido se omiten intencionalmente por corresponder solo al proyecto de escritorio. La prueba de búsqueda espera la navegación antes de comprobar las tarjetas.

Además se aprobó el caso de teclado en Chromium móvil: enlace para saltar al contenido y foco visible. Las pruebas de stock usan un servidor local con datos de prueba; no modifican la base compartida. El análisis con axe no detectó infracciones WCAG 2.2 AA en las páginas y el menú examinados. No se probaron dispositivos físicos ni un lector de pantalla.

## Capturas

- [Hero móvil](mobile-hero.png), [tablet](tablet-hero.png), [escritorio](desktop-hero.png), [WebKit móvil](webkit-hero.png).
- [Portada de 320 px](home-320.png).
- [Catálogo móvil](mobile-catalog.png), [tablet](tablet-catalog.png), [escritorio](desktop-catalog.png).

## Ajuste posterior de la hero móvil

Se corrigieron los campos estrechos y la altura excesiva. A 375 px, la hero pasó de aproximadamente 685 a 603 px de altura, con títulos de 28 px, menos espacio vertical y filtros desplegables. La marca Mercedes-Benz se muestra completa al abrir los filtros. Los controles conservan al menos 44 px de altura y los campos mantienen 16 px de fuente.

Revisión visual adicional a 320, 375, 390, 768 y 1440 px en Chromium y 390 px en WebKit, incluyendo apertura/cierre de filtros y selección persistente al cerrarlos. Seis casos enfocados aprobados en Chromium móvil, WebKit móvil y escritorio: búsqueda combinada y accesibilidad. La comprobación del buscador móvil cubre apertura con teclado y envío de filtros después de cerrar el desplegable.

Capturas: [móvil de 375 px](hero-mobile-fix-chromium-375.png), [filtros y marca larga a 320 px](hero-mobile-fix-chromium-320-filters.png).

## Control de filtros en escritorio

La captura comunicada mostraba el control móvil en escritorio y una flecha sin tamaño definido. Una carga limpia del servidor local presentó la fila correctamente; no se pudo reproducir esa captura en dicha carga. Se aislaron los estilos del control y de sus campos en `HeroSearch.module.css`, importado por el componente, y se añadieron dimensiones intrínsecas de 18 × 18 px al SVG.

Verificación: a 1440 y 1920 px, el control móvil permanece oculto y los cuatro campos/acciones se alinean en una fila; el buscador mide aproximadamente 113 px de alto. A 768 px se muestran ambos filtros en la distribución de tablet. A 390 px se conserva el desplegable móvil y su selección al cerrarlo. Build y lint correctos; cuatro casos enfocados aprobados en Chromium escritorio y WebKit móvil.

Capturas: [escritorio de 1440 px](hero-desktop-correction-1440.png), [1920 px](hero-desktop-correction-1920.png), [tablet](hero-desktop-correction-768.png), [móvil](hero-desktop-correction-390.png).
