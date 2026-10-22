# Capturas reales de Otaku Verso

Fecha: 22 de octubre de 2026.

## Origen

Capturas tomadas mediante Android Debug Bridge en un **Redmi Note 9 Pro** conectado, con Otaku Verso (`com.example.anime`) abierta. Se recorrieron las pantallas reales, sin modificar el código Android, instalar otro APK ni generar interfaces ficticias.

| Archivo público | Pantalla capturada |
| --- | --- |
| `public/screenshots/home.webp` | Inicio desplazado a Continuar viendo y episodios recientes. |
| `public/screenshots/explore.webp` | Búsqueda y exploración por géneros, con filtros. |
| `public/screenshots/anime.webp` | Ficha real de Sousou no Frieren, idiomas, episodios, estado y sinopsis. |
| `public/screenshots/manga.webp` | Catálogo real de manga, populares y títulos en emisión. |

Las imágenes seleccionadas se inspeccionaron antes de publicar. Se descartaron tomas transitorias con desenfoque o avisos del sistema. Las capturas originales y los volcados de jerarquía quedan únicamente en `.local/captures`, excluido de Git y del despliegue.

## Preparación y diseño

- Capturas originales: 1080 × 2400 píxeles.
- Recorte: se retiran 102 píxeles superiores y 132 inferiores de barras del sistema; se conserva el contenido de la app sin reescribir títulos, controles, imágenes ni datos visibles.
- Salida WebP: 864 × 1733 píxeles. Las cuatro imágenes suman aproximadamente 539 KiB.
- Los marcos Android, cámara, botones laterales y reflejos del borde son CSS del componente `AndroidPhone.astro`. Las pantallas son las imágenes reales.
- La portada presenta las vistas de anime y manga. La galería permite elegir entre cuatro pantallas y ampliar cada captura.
- `public/social.webp` se actualizó con una captura de la nueva portada, con los teléfonos y la app real.

## Verificación

- Las cuatro pestañas cambian la imagen y su descripción; el cambio mediante flecha derecha funciona.
- «Ampliar captura» abre la imagen seleccionada en un diálogo. Se comprobó el cierre con el botón y el retorno del foco al control de ampliación.
- Revisada la adaptación en navegador a ancho móvil y escritorio, con ausencia de desplazamiento horizontal en las comprobaciones finales y teléfonos completos dentro de la portada de escritorio.
- El SDK sigue obteniendo la configuración pública de Firebase Hosting. La página muestra el estado de la versión desde Firestore y conserva el enlace del APK verificado.
- Estas capturas muestran el estado de la app y del catálogo en el momento de la toma. No representan una prueba completa de reproducción, lectura ni sincronización.
