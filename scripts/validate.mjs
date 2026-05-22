#!/usr/bin/env node
/**
 * 꽃배달 직배송 플랫폼 — Validator
 * Usage: node scripts/validate.mjs
 *
 * 검증 항목:
 * 1. system.json 파싱 + 필수 필드 존재
 * 2. system.json.shops[].id 와 shops/{id}/ 폴더 일치
 * 3. system.json.posts[].id 와 posts/{id}/ 폴더 일치
 * 4. 필수 파일 존재 확인
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warns = [];
const info = [];

function ok(msg)   { info.push('✓ ' + msg); }
function warn(msg) { warns.push('⚠ ' + msg); }
function fail(msg) { errors.push('✗ ' + msg); }

function readJSON(relPath) {
  const full = join(ROOT, relPath);
  if (!existsSync(full)) { fail('파일 없음: ' + relPath); return null; }
  try { return JSON.parse(readFileSync(full, 'utf-8')); }
  catch (e) { fail('JSON 파싱 실패 (' + relPath + '): ' + e.message); return null; }
}

function validateDir(label, items, dirName, fileName) {
  const registeredIds = new Set(items.map(function (s) { return s.id; }));

  for (const item of items) {
    if (!item.id) { fail(label + '에 id 없음'); continue; }
    if (!item.name && !item.title) warn(item.id + ': name/title 필드 없음');

    const dir = join(ROOT, dirName, item.id);
    if (!existsSync(dir)) {
      fail(item.id + ': ' + dirName + '/' + item.id + '/ 폴더 없음');
      continue;
    }

    const data = readJSON(dirName + '/' + item.id + '/' + fileName);
    if (!data) continue;
    if (data.id !== item.id) {
      fail(item.id + ': ' + fileName + '의 id "' + data.id + '" !== system.json의 "' + item.id + '"');
    }
  }

  const parentDir = join(ROOT, dirName);
  if (existsSync(parentDir)) {
    try {
      const dirs = readdirSync(parentDir, { withFileTypes: true })
        .filter(function (d) { return d.isDirectory(); })
        .map(function (d) { return d.name; });
      for (const d of dirs) {
        if (!registeredIds.has(d)) {
          warn(dirName + '/' + d + '/ 가 system.json에 미등재');
        }
      }
    } catch (e) {
      warn(dirName + '/ 디렉터리 읽기 실패: ' + e.message);
    }
  }
}

// 1. system.json
const system = readJSON('system.json');
if (!system) process.exit(1);

if (!system.name) fail('system.json: name 필드 없음');
if (!system.version) fail('system.json: version 필드 없음');

const categories = system.categories || [];
ok('system.json — ' + categories.length + '개 상품 카테고리 정의');

// 2. shops 검증
const shops = system.shops || [];
ok('system.json — ' + shops.length + '개 업체 등재');
if (shops.length > 0) validateDir('업체', shops, 'shops', 'info.json');

// 3. posts 검증
const posts = system.posts || [];
ok('system.json — ' + posts.length + '개 블로그 글 등재');
if (posts.length > 0) validateDir('블로그 글', posts, 'posts', 'post.json');

// 4. 필수 파일 존재
['index.html', 'assets/css/main.css', 'assets/js/main.js'].forEach(function (f) {
  if (existsSync(join(ROOT, f))) ok(f + ' 존재');
  else fail(f + ' 없음');
});

// 결과
console.log('\n' + info.join('\n'));
if (warns.length) console.log('\n' + warns.join('\n'));
if (errors.length) console.log('\n' + errors.join('\n'));
console.log('\n결과: ' + info.length + ' OK / ' + warns.length + ' warn / ' + errors.length + ' error');
process.exit(errors.length ? 1 : 0);
