// Run with jsdom available: npm install --no-save jsdom, then node tests/privacy-dom.test.cjs.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { JSDOM } = require('jsdom');
(async () => {
  const root = path.resolve(__dirname, '..');
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const dom = new JSDOM(html, { url: 'https://example.test/Translation/', runScripts: 'outside-only' });
  const w = dom.window;
  w.HTMLElement.prototype.scrollIntoView = () => {};
  const toolkit = await import(pathToFileURL(path.join(root, 'src/teacher-toolkit.js')));
  const qr = await import(pathToFileURL(path.join(root, 'src/student-qr.js')));
  const translator = await import(pathToFileURL(path.join(root, 'src/translator-service.js')));
  const posts = [], lookups = [];
  Object.assign(w, toolkit, qr, translator, {
    submitLessonCase: async payload => { posts.push(payload); return { ok: true, status_label: '관리자 승인중' }; },
    resubmitLessonCase: async (id, pw, payload) => { posts.push(payload); return { ok: true }; },
    getSavedMyCaseIds: () => ['11111111-1111-1111-1111-111111111111'],
    fetchMyCases: async (ids, pw) => { lookups.push({ids, pw}); return { items: [] }; }
  });
  const source = fs.readFileSync(path.join(root, 'app.js'), 'utf8')
    .replace(/^import\s+[\s\S]*?from\s+['"][^'"]+['"];\s*/gm, '')
    .replace(/^export /gm, '')
    .replace("document.addEventListener('DOMContentLoaded', init);", '')
    + '\nwindow.testApp = { cacheElements, bindCaseSharingEvents, handleSubmitCaseForm, openCaseWritePanel, loadAndRenderMyCases, handleOpenStudentQrModal, closeStudentQrModal, state };';
  w.eval(source);
  const app = w.testApp, el = id => w.document.getElementById(id);
  app.cacheElements(); app.bindCaseSharingEvents();
  const confirmIds = ['chk-case-factual', 'chk-case-nopii', 'chk-case-rights'];
  const all = value => confirmIds.forEach(id => { el(id).checked = value; });
  const submit = () => app.handleSubmitCaseForm({ preventDefault() {} });
  el('case-input-goal').value = 'Synthetic test review.';
  el('case-input-passcode').value = 'synthetic-passcode';
  await submit(); assert.equal(posts.length, 0);
  all(true); el('chk-case-nopii').checked = false;
  await submit(); assert.equal(posts.length, 0);
  all(true); await submit(); assert.equal(posts.length, 1);
  for (const field of ['confirmed_factual', 'confirmed_no_pii', 'confirmed_public_rights']) assert.equal(posts[0][field], true);
  for (const id of confirmIds) assert.equal(el(id).checked, false);
  assert.equal(el('case-input-passcode').value, '');
  assert.equal(el('my-cases-passcode-input').value, '');
  assert.equal(w.localStorage.getItem('multilingual_translator_my_case_pw_v1'), null);
  all(true); app.openCaseWritePanel({id:'synthetic-id', lesson_goal:'Edit test'});
  for (const id of confirmIds) assert.equal(el(id).checked, false);
  all(true); el('case-input-goal').dispatchEvent(new w.Event('input', { bubbles: true }));
  for (const id of confirmIds) assert.equal(el(id).checked, false);
  await app.loadAndRenderMyCases(); assert.equal(lookups.length, 0);
  assert(el('my-cases-list').textContent.includes('비밀번호를 입력'));
  el('my-cases-passcode-input').value = 'synthetic-passcode';
  await app.loadAndRenderMyCases(); assert.equal(lookups.length, 1);
  const setDoc = (count, text) => {
    app.state.parsedDoc = { fileName:'test.pptx', items:Array.from({length:count}, (_,i)=>({id:String(i),sourceText:text,locationLabel:String(i)})) };
    app.state.itemStates = new Map(app.state.parsedDoc.items.map(x=>[x.id,{finalText:'Hello'}]));
  };
  setDoc(1, '안녕'); app.handleOpenStudentQrModal();
  assert(el('img-student-share-qr').src.startsWith('data:image/gif;base64,'));
  assert(!el('img-student-share-qr').classList.contains('hidden'));
  assert(el('input-student-share-url').value.includes('#student-view='));
  app.closeStudentQrModal();
  assert(el('student-qr-modal').classList.contains('hidden'));
  setDoc(25, '긴 문장 '.repeat(40)); app.handleOpenStudentQrModal();
  assert.equal(el('img-student-share-qr').getAttribute('src'), null);
  assert(el('img-student-share-qr').classList.contains('hidden'));
  assert(el('student-share-feedback').textContent.includes('길어'));
  assert(el('input-student-share-url').value.length > 1800);
  setDoc(1, '안녕'); app.handleOpenStudentQrModal();
  assert(el('img-student-share-qr').src.startsWith('data:image/gif;base64,'));
  assert(!el('img-student-share-qr').classList.contains('hidden'));
  console.log('PASS DOM: missing/partial consent, submit/reset/password clear, edit/content-change reconsent, manual password lookup, short/long/reopened local QR.');

  global.DOMParser = w.DOMParser; global.XMLSerializer = w.XMLSerializer;
  global.JSZip = require(path.join(root, 'vendor/jszip.min.js'));
  const processor = await import(pathToFileURL(path.join(root, 'src/document-processor.js')));
  for (const name of ['sample-science-lesson.pptx', 'sample-science-activity.hwpx']) {
    const bytes = fs.readFileSync(path.join(root, 'samples', name));
    const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    const parsed = await processor.extractDocumentFromBuffer(name, buffer);
    assert(parsed.items.length > 0);
    const translations = new Map(parsed.items.map(item=>[item.id, 'Synthetic translation']));
    const output = await processor.buildTranslatedDocument(parsed, translations, { outputMode:'replace' });
    const zip = await global.JSZip.loadAsync(output.uint8Array || output.bytes || output);
    assert(Object.keys(zip.files).length > 0);
    console.log('PASS document extract/rebuild:', name, parsed.items.length, 'text items');
  }
  dom.window.close();
})().catch(error => { console.error(error); process.exit(1); });
