import test from 'node:test';
import assert from 'node:assert/strict';
import { parseBadging, assertAdvance } from './apk.mjs';

test('versionName stays 1.0 while versionCode is read from the real manifest', () => {
  const result = parseBadging("package: name='com.example.anime' versionCode='2' versionName='1.0' platformBuildVersionName='16'\nsdkVersion:'26'\n");
  assert.equal(result.version, '1.0');
  assert.equal(result.versionCode, 2);
  assert.equal(result.minAndroid, '8.0');
});
test('other packages and malformed or incompatible APK metadata cannot be published', () => {
  for (const output of ["package: name='other.app' versionCode='2' versionName='1.0'\nsdkVersion:'26'",
    "package: name='com.example.anime' versionCode='0' versionName='1.0'\nsdkVersion:'26'",
    "package: name='com.example.anime' versionCode='2' versionName='bad'\nsdkVersion:'26'",
    "package: name='com.example.anime' versionCode='2' versionName='1.0'\nsdkVersion:'99'"]) {
    assert.throws(() => parseBadging(output));
  }
});
test('publication refuses downgrades and reused codes but permits exact-file retries', () => {
  const current = { versionCode: 2, sha256: 'a'.repeat(64) };
  assert.throws(() => assertAdvance(current, { versionCode: 1, sha256: current.sha256 }));
  assert.throws(() => assertAdvance(current, { versionCode: 2, sha256: 'b'.repeat(64) }));
  assert.doesNotThrow(() => assertAdvance(current, current));
  assert.doesNotThrow(() => assertAdvance(current, { versionCode: 3, sha256: 'b'.repeat(64) }));
  assert.throws(() => assertAdvance({ versionCode: NaN }, current));
});
