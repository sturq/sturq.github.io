#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const AUTHOR = 'sturq';
const HTML_PATH = 'projects/index.html';
const START_MARKER = '<!-- contributions:start -->';
const END_MARKER = '<!-- contributions:end -->';

function gh(kind) {
  const args = [
    'search', kind,
    '--author', AUTHOR,
    '--limit', '100',
    '--json', 'url,title,repository,number,state,body,updatedAt,isPullRequest',
  ];
  return JSON.parse(execFileSync('gh', args, { encoding: 'utf8' }));
}

const prs = gh('prs').filter(p => !p.repository.nameWithOwner.startsWith(`${AUTHOR}/`));
const issues = gh('issues')
  .filter(i => !i.repository.nameWithOwner.startsWith(`${AUTHOR}/`))
  .filter(i => i.isPullRequest === false);

const stateRank = { merged: 0, open: 1, closed: 2 };
const sorter = (a, b) => {
  const r = (stateRank[a.state] ?? 3) - (stateRank[b.state] ?? 3);
  if (r) return r;
  return b.updatedAt.localeCompare(a.updatedAt);
};

function shortDesc(body, title) {
  const fallback = title.toLowerCase();
  if (!body) return fallback;
  const stripped = body
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^#+\s.*$/gm, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/[*_]([^*_]+)[*_]/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  if (!stripped) return fallback;
  const firstSentence = stripped.split(/(?<=[.!?])\s/)[0];
  const text = firstSentence.length > 200
    ? stripped.slice(0, 180).trim() + '…'
    : firstSentence;
  const lower = text.toLowerCase();
  return /[.!?…]$/.test(lower) ? lower : lower + '.';
}

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function card(item, kind) {
  const repo = item.repository.name;
  const label = `${repo} · ${kind} #${item.number} · ${item.state}`;
  const title = item.title.toLowerCase();
  const desc = shortDesc(item.body, item.title);
  return `  <a class="card reveal" href="${esc(item.url)}" target="_blank" rel="noopener">
    <div class="label">${esc(label)}</div>
    <div class="title">${esc(title)}</div>
    <div class="desc">${esc(desc)}</div>
    <div class="arrow">→</div>
  </a>`;
}

const cards = [
  ...prs.sort(sorter).map(p => card(p, 'pr')),
  ...issues.sort(sorter).map(i => card(i, 'issue')),
];

const html = readFileSync(HTML_PATH, 'utf8');
const a = html.indexOf(START_MARKER);
const b = html.indexOf(END_MARKER);
if (a === -1 || b === -1) {
  console.error(`markers not found in ${HTML_PATH}`);
  process.exit(1);
}
const before = html.slice(0, a + START_MARKER.length);
const after = html.slice(b);
const block = '\n' + cards.join('\n') + '\n  ';
const updated = before + block + after;

if (updated === html) {
  console.log('no change');
} else {
  writeFileSync(HTML_PATH, updated);
  console.log(`updated ${HTML_PATH} (${cards.length} cards)`);
}
