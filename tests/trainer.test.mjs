import assert from 'node:assert/strict';
import test from 'node:test';
import { writeFile, unlink } from 'node:fs/promises';
import { build } from 'esbuild';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { advancedQuestions, dailyQuestions, topics } from '../app/advanced.ts';

test('bank has valid unique IDs, answers, and all learning stages', () => {
  assert.equal(advancedQuestions.length, 24);
  assert.equal(new Set(advancedQuestions.map(q => q.id)).size, 24);
  for (const q of advancedQuestions) {
    assert.equal(new Set(q.options).size, 4);
    assert.ok(q.options.includes(q.answer));
    assert.ok(q.steps.length >= 2);
    if (q.board) {
      const cards = `${q.hand} ${q.board}`.split(' ');
      assert.equal(new Set(cards).size, cards.length, q.id);
    }
  }
  assert.deepEqual(new Set(advancedQuestions.map(q => q.topic)), new Set(topics.slice(1)));
});

test('worked numbers agree with independent calculations', () => {
  const byId = (id) => advancedQuestions.find(q => q.id === `adv-${String(id).padStart(3,'0')}`);
  const weighted = weights => weights.reduce((sum,w,i) => sum + w * [13,33,31,56][i], 0) / weights.reduce((a,b) => a+b);
  assert.ok(byId(10).answer.includes(weighted([3,6,12,16]).toFixed(2)));
  assert.ok(byId(11).answer.includes(weighted([3,6,12,4]).toFixed(2)));
  assert.ok(byId(14).answer.includes((weighted([3,6,12,4]) - 30).toFixed(2)));
  assert.equal(30 / (40+30+30), .30);
  assert.equal((300+.5*100)/1000, .35);
  assert.equal(Math.ceil(.3*12/(1-.3)), Number(byId(16).answer));
  assert.equal(48*47*46*45*44/120, 1712304);
});

test('daily practice is stable, unique, and covers all five topics', () => {
  for (let day = 1; day <= 31; day++) {
    const bank = dailyQuestions(new Date(2026, 8, day));
    assert.equal(bank.length, 20);
    assert.equal(new Set(bank.map(q => q.id)).size, 20);
    assert.deepEqual(bank, dailyQuestions(new Date(2026, 8, day, 23, 59)));
    assert.equal(new Set(bank.map(q => q.topic)).size, 5);
  }
});

test('practice hides answers, filters topics, preserves history, retries and ends at 20', async () => {
  const generated = new URL('./.trainer-generated.mjs', import.meta.url);
  const bundled = await build({entryPoints:['app/page.tsx'], bundle:true, write:false, format:'esm', platform:'node', packages:'external', jsx:'automatic'});
  await writeFile(generated, bundled.outputFiles[0].text);
  const {default: Home} = await import(generated.href);
  const dom = new JSDOM('<div id="root"></div>', {url:'http://localhost/'});
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const key = 'gto-review-trainer-attempts-v1';
  const legacy = {questionId:'pf-001',type:'preflop',spot:'legacy',hand:'A5s',selected:'Fold',answer:'Open 2.5BB',correct:false,leak:'BTN 過緊',timestamp:1};
  window.localStorage.setItem(key, JSON.stringify([legacy]));
  window.localStorage.setItem('gto-review-hands-v1', JSON.stringify(['my saved hand']));
  const root = createRoot(document.getElementById('root'));
  const click = async (label) => {
    const button = [...document.querySelectorAll('button')].find(b => b.textContent === label || b.querySelector('span')?.textContent === label);
    assert.ok(button, `missing button ${label}`);
    await act(async () => button.click());
  };
  const answer = async () => {
    await act(async () => document.querySelector('.answer-grid button').click());
  };
  try {
    await act(async () => root.render(React.createElement(Home)));
    assert.deepEqual(JSON.parse(window.localStorage.getItem(key)), [legacy]);
    await click('進階決策訓練');
    assert.ok(document.querySelector('h3').textContent.includes('A5s'));
    assert.equal(document.querySelector('.solution-steps'), null);
    assert.equal(document.querySelector('.tag-cloud'), null);
    await answer();
    assert.ok(document.querySelector('.solution-steps'));
    const n = JSON.parse(window.localStorage.getItem(key)).length;
    await answer();
    assert.equal(JSON.parse(window.localStorage.getItem(key)).length, n);
    await click('Combo 與頻率');
    assert.ok(document.querySelector('h3').textContent.includes('AA'));
    assert.equal(document.querySelector('.solution-steps'), null);
    await click('翻前基礎');
    assert.ok(!document.querySelector('.spot-details').textContent.includes('偏純 open'));
    await click('錯題本');
    await click('重新作答');
    assert.equal(document.querySelector('.solution-steps'), null);
    await answer();
    await click('返回錯題本');
    assert.ok(document.querySelector('.review-list'));
    await click('每日 20 題');
    for (let i=0; i<20; i++) {
      await answer();
      await click(i===19 ? '查看本輪成績' : '下一題');
    }
    assert.ok(document.body.textContent.includes('本輪 20 題完成'));
    assert.equal(document.querySelector('.answer-grid'), null);
    await click('再練一輪');
    assert.ok(document.querySelector('.question-meta').textContent.includes('題目 1 / 20'));
    await click('牌局筆記');
    assert.ok(document.body.textContent.includes('my saved hand'));
  } finally {
    await act(async () => root.unmount());
    dom.window.close();
    delete globalThis.window;
    delete globalThis.document;
    await unlink(generated);
  }
});
