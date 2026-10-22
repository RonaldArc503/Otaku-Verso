# Otaku Verso — web oficial

Landing en español creada con **Astro + TypeScript**, npm, Firebase Hosting y Cloud Firestore. Firebase: **anime-rc**. El proyecto Android usa **animelatinorc**; esta web no cambia sus servicios.

- Web: https://anime-rc.web.app
- Código y APK: https://github.com/RonaldArc503/Otaku-Verso
- El código de la web se guarda en Git; los APK se adjuntan a **GitHub Releases**, no al historial del repositorio.

## Desarrollo

Requiere Node.js 22.23.4 o superior y npm 9.6.5 o superior. Comprobado con Node.js 24.

```sh
npm ci
npm run dev
npm run build
```

## Firebase y descarga

`src/lib/firebase.ts` contiene la configuración pública proporcionada para la web. La página lee únicamente **webPublic/app** en Firestore, valida sus campos y solo acepta enlaces HTTPS de APK en Releases de este repositorio.

Campos del documento: `version` (string), `versionCode` (number), `downloadUrl` (string), `sizeBytes` (number), `minAndroid` (string), `publishedAt` (YYYY-MM-DD), `sha256` (string) y `releaseNotes` (string).

Las reglas de `webPublic/app` permiten obtener el documento públicamente y bloquean escrituras desde clientes y listados. Las actualizaciones administrativas utilizan la sesión local de Firebase CLI. **Las reglas abiertas preexistentes del resto de anime-rc se conservaron para no afectar servicios ajenos; necesitan una revisión independiente.** No guardes información privada en esas colecciones sin corregir primero su acceso.

Si Firestore falla, permanece disponible la última versión verificada de `src/data/release.json` y aparece un aviso con opción de reintento. La descarga funciona también sin JavaScript. Las estadísticas de Google Analytics solo se cargan tras el consentimiento; las fuentes e imágenes se sirven localmente.

## Publicar una actualización del APK

1. Genera y verifica el APK con una firma compatible con versiones anteriores. El script no compila Android ni cambia su firma; los valores de versión y código deben coincidir con el APK.
2. Inicia sesión en Firebase CLI y Git Credential Manager. El script usa sus credenciales en memoria, nunca las escribe en el repositorio.
3. Desde esta carpeta, ejecuta (usa una versión nueva y su versionCode real):

```sh
npm run release:publish -- "C:/ruta/app-release.apk" 1.1 2
```

El script crea un borrador en GitHub Releases, adjunta `otaku-verso.apk`, publica, vuelve a descargar el APK y compara SHA-256. Solo entonces actualiza Firestore y el respaldo estático local. No sobrescribe versiones ya publicadas. Puedes repetir el comando con el mismo archivo para recuperar una publicación interrumpida: verifica que el APK existente sea idéntico antes de actualizar Firestore.

Firestore actualiza la página sin nuevo despliegue. Para actualizar también el respaldo sin JavaScript, despliega y guarda `src/data/release.json` en Git.

## Desplegar la web

```sh
firebase login
npm run deploy
```

El despliegue habitual solo publica Hosting. Las reglas se despliegan por separado y deben revisarse antes de cambiarlas:

```sh
firebase deploy --only firestore:rules --project anime-rc
```

## Contenido y recursos

Logo aportado por el propietario. Ilustración original generada mediante image_gen, optimizada como WebP; prompt en `docs/image-prompt.md`. La ilustración es decorativa y no representa una captura de la app. Los textos legales de la app se copiaron del cliente Android actual; la política de la web describe su tratamiento por separado.

`docs/VALIDACION.md` registra las verificaciones y los límites de esta entrega.
