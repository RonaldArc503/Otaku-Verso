import { createRequire } from 'node:module';
import { join } from 'node:path';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const require = createRequire(import.meta.url);
const cliRoot = process.env.FIREBASE_TOOLS_ROOT || join(process.env.APPDATA || '', 'npm/node_modules/firebase-tools');
const auth = require(join(cliRoot, 'lib/auth.js'));

export async function firebaseRequest(path, options = {}) {
  const account = auth.getGlobalDefaultAccount();
  if (!account) throw new Error('Primero ejecuta firebase login.');
  const tokens = await auth.getAccessToken(account.tokens.refresh_token, ['https://www.googleapis.com/auth/cloud-platform']);
  const response = await fetch(path, { ...options, headers: { Authorization: `Bearer ${tokens.access_token}`, 'Content-Type': 'application/json', ...options.headers } });
  if (!response.ok) throw new Error(`Firebase ${response.status}: ${(await response.text()).slice(0, 600)}`);
  return response.status === 204 ? null : response.json();
}

export async function writeReleaseMetadata(release, expectedUpdateTime) {
  const fields = Object.fromEntries(Object.entries(release).map(([key, value]) => [key, typeof value === 'number' ? { integerValue: String(value) } : { stringValue: value }]));
  const precondition = expectedUpdateTime ? `?currentDocument.updateTime=${encodeURIComponent(expectedUpdateTime)}` : '';
  await firebaseRequest(`https://firestore.googleapis.com/v1/projects/anime-rc/databases/(default)/documents/webPublic/app${precondition}`, { method: 'PATCH', body: JSON.stringify({ fields }) });
  console.log('Firestore: webPublic/app actualizado.');
}

if (process.argv[2] === 'prepare-rules') {
  const active = await firebaseRequest('https://firebaserules.googleapis.com/v1/projects/anime-rc/releases/cloud.firestore');
  const ruleset = await firebaseRequest(`https://firebaserules.googleapis.com/v1/${active.rulesetName}`);
  const original = ruleset.source.files.find(file => file.name === 'firestore.rules')?.content;
  if (!original || !/^rules_version\s*=\s*'2';\s*service cloud\.firestore\s*\{\s*match \/databases\/\{database\}\/documents\s*\{\s*match \/\{document=\*\*\}\s*\{\s*allow read, write: if true;\s*\}\s*\}\s*\}\s*$/.test(original)) {
    throw new Error('Las reglas remotas cambiaron. Revisa y conserva sus contratos antes de desplegar.');
  }
  await mkdir('.local', { recursive: true });
  await writeFile('.local/firestore-before.rules', original);
  await writeFile('.local/firestore-before-release.json', JSON.stringify(active, null, 2));
  await writeFile('firestore.rules', `rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Website release metadata: public single-document reads, no client writes.
    match /webPublic/app {
      allow get: if true;
      allow list, create, update, delete: if false;
    }

    // Preserve the pre-existing project's access contract outside webPublic.
    // These legacy open rules require a separate review before being restricted.
    match /{rootCollection}/{document=**} {
      allow read, write: if rootCollection != 'webPublic';
    }
  }
}
`);
  console.log('Reglas preparadas; respaldo local guardado. Solo webPublic cambia de acceso.');
}

if (process.argv[2] === 'seed-release') {
  await writeReleaseMetadata(JSON.parse(await readFile('src/data/release.json', 'utf8')));
}
