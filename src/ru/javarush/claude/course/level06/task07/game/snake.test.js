const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

function createGame() {
  const elements = new Map();
  const listeners = new Map();
  const context = {
    document: {
      getElementById(id) {
        if (!elements.has(id)) {
          elements.set(id, {
            textContent: '',
            classList: { add() {}, remove() {} },
            addEventListener(event, callback) {
              listeners.set(`${id}:${event}`, callback);
            }
          });
        }
        return elements.get(id);
      },
      addEventListener(event, callback) {
        listeners.set(`document:${event}`, callback);
      }
    },
    setInterval() { return 1; },
    clearInterval() {},
    Math: Object.create(Math)
  };
  context.document.getElementById('board').getContext = () => ({
    fillRect() {},
    set fillStyle(value) {}
  });
  vm.createContext(context);
  vm.runInContext(script, context);
  return {
    context,
    listeners,
    setState(snake, grew) {
      vm.runInContext(`snake = ${JSON.stringify(snake)}; grew = ${grew};`, context);
    }
  };
}

test('allows the head to enter the cell vacated by the tail', () => {
  const game = createGame();
  game.setState([
    { x: 1, y: 3 },
    { x: 2, y: 2 },
    { x: 1, y: 2 },
    { x: 1, y: 3 }
  ], false);

  assert.equal(game.context.checkCollision(), false);
});

test('keeps the tail collision when the snake grows', () => {
  const game = createGame();
  game.setState([
    { x: 1, y: 3 },
    { x: 2, y: 2 },
    { x: 1, y: 2 },
    { x: 1, y: 3 }
  ], true);

  assert.equal(game.context.checkCollision(), true);
});

