const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const elements = {
  score: { textContent: '0' },
  guess: { value: '7' },
  check: { addEventListener(type, handler) { this.handler = handler; } },
  message: { textContent: '' },
};

const html = fs.readFileSync('game/index.html', 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
vm.runInNewContext(script, {
  Math: { floor: () => 6, random: () => 0.5 },
  Number,
  document: {
    getElementById(id) {
      return elements[id];
    },
  },
});

elements.check.handler();
assert.equal(elements.message.textContent, 'Угадал!');
assert.equal(String(elements.score.textContent), '1', 'счётчик на экране должен увеличиться');
console.log('PASS');
