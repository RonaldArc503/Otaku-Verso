import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { javaEnvironment } from './apk.mjs';

function main() {
const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
let apk, notes, android = process.env.OTAKU_ANDROID_DIR || join(homedir(), 'AndroidStudioProjects/Anime');
let checkOnly = false;
while (args.length) {
  const name = args.shift();
  if (name === '--apk' && args.length) apk = resolve(args.shift());
  else if (name === '--android' && args.length) android = resolve(args.shift());
  else if (name === '--notes' && args.length) notes = resolve(args.shift());
  else if (name === '--check') checkOnly = true;
  else throw new Error('Uso: npm run app:release -- [--apk "ruta.apk"] [--android "proyecto"] [--notes "notas.txt"] [--check]');
}
function run(command, parameters, cwd = root, env = process.env) {
  const result = spawnSync(command, parameters, { cwd, env, stdio: 'inherit', windowsHide: true });
  if (result.error || result.status !== 0) throw new Error(`Falló ${command}. No se continuará con el siguiente paso.`);
}
if (!apk) {
  if (!existsSync(join(android, 'gradlew.bat')) && !existsSync(join(android, 'gradlew'))) throw new Error('No se encontró el proyecto Android. Usa --android.');
  if (!existsSync(join(android, 'keystore.properties'))) throw new Error('Configura keystore.properties local con key0, o genera el APK firmado desde Android Studio y ejecuta npm run app:release -- --apk "ruta/app-release.apk". Nunca publiques el archivo de contraseñas.');
  const env = { ...javaEnvironment(), JAVA_TOOL_OPTIONS: `${process.env.JAVA_TOOL_OPTIONS || ''} -Djava.net.preferIPv4Stack=true -Djdk.net.unixdomain.tmpdir=${process.platform === 'win32' ? 'C:\\Windows\\Temp' : '/tmp'}`.trim() };
  const parameters = [':app:assembleRelease', '--no-daemon', '--console=plain'];
  if (process.platform === 'win32') run('cmd.exe', ['/d', '/c', 'gradlew.bat', ...parameters], android, env);
  else run('./gradlew', parameters, android, env);
  apk = join(android, 'app/build/outputs/apk/release/app-release.apk');
}
const publishArgs = [join(root, 'scripts/publish-release.mjs'), apk];
if (notes) publishArgs.push('--notes', notes);
if (checkOnly) publishArgs.push('--check');
run(process.execPath, publishArgs);
if (checkOnly) return;
const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error('Ejecuta este comando mediante npm run app:release para compilar la web.');
run(process.execPath, [npmCli, 'run', 'build'], root, { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' });
// Firebase CLI is already installed locally on the maintainer machine; credentials stay local.
if (process.platform === 'win32') run('cmd.exe', ['/d', '/c', 'firebase.cmd', 'deploy', '--only', 'hosting', '--project', 'anime-rc', '--non-interactive'], root, { ...process.env, CI: 'true' });
else run('firebase', ['deploy', '--only', 'hosting', '--project', 'anime-rc', '--non-interactive'], root, { ...process.env, CI: 'true' });
console.log('Actualización publicada: GitHub Releases + Firestore + Firebase Hosting. Guarda src/data/release.json en Git.');
}

try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
