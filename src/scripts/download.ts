import { doc, getDoc } from 'firebase/firestore/lite';
import { db } from '../lib/firebase';
import { parseRelease, formatSize } from '../lib/release';

const button = document.querySelector<HTMLAnchorElement>('#apk-download');
const status = document.querySelector<HTMLElement>('#release-status');
const retry = document.querySelector<HTMLButtonElement>('#release-retry');
let loading = false;

async function loadRelease() {
  if (!button || !status || !retry || loading) return;
  loading = true;
  retry.hidden = true;
  status.textContent = 'Comprobando la versión oficial…';
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    const snapshot = await Promise.race([
      getDoc(doc(db, 'webPublic', 'app')),
      new Promise<never>((_, reject) => { timeout = setTimeout(() => reject(new Error('timeout')), 8000); }),
    ]);
    const release = snapshot.exists() ? parseRelease(snapshot.data()) : null;
    if (!release) throw new Error('Invalid release metadata');
    button.href = release.downloadUrl;
    document.querySelector('#release-version')!.textContent = `v${release.version}`;
    document.querySelector('#release-size')!.textContent = formatSize(release.sizeBytes);
    document.querySelector('#release-android')!.textContent = `Android ${release.minAndroid}+`;
    status.textContent = 'Última versión oficial, lista para descargar.';
  } catch {
    status.textContent = 'Mostramos la versión publicada. No pudimos comprobar si hay una actualización.';
    retry.hidden = false;
  } finally {
    clearTimeout(timeout);
    loading = false;
  }
}

retry?.addEventListener('click', () => void loadRelease());
void loadRelease();
