const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

class FakeAudioParam {
  constructor() {
    this.value = 0;
  }

  setValueAtTime(value) {
    this.value = value;
  }

  exponentialRampToValueAtTime(value) {
    this.value = value;
  }
}

class FakeAudioNode {
  constructor() {
    this.connections = [];
    this.gain = new FakeAudioParam();
    this.frequency = new FakeAudioParam();
    this.starts = 0;
    this.stops = 0;
  }

  connect(node) {
    this.connections.push(node);
    return node;
  }

  start() {
    this.starts += 1;
  }

  stop() {
    this.stops += 1;
  }
}

class FakeAudioContext {
  constructor() {
    this.state = 'suspended';
    this.currentTime = 0;
    this.oscillators = [];
    this.gains = [];
    this.destination = {};
  }

  createOscillator() {
    const node = new FakeAudioNode();
    this.oscillators.push(node);
    return node;
  }

  createGain() {
    const node = new FakeAudioNode();
    this.gains.push(node);
    return node;
  }

  resume() {
    this.state = 'running';
    return Promise.resolve();
  }
}

function loadGame() {
  const html = fs.readFileSync('game/index.html', 'utf8');
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const handlers = {};
  const elements = new Map();
  const canvasContext = { fillRect() {} };

  function element(id) {
    if (!elements.has(id)) {
      elements.set(id, {
        textContent: '',
        classList: { add() {}, remove() {} },
        addEventListener(event, handler) {
          handlers[`${id}:${event}`] = handler;
        },
        getContext() {
          return canvasContext;
        }
      });
    }
    return elements.get(id);
  }

  const document = {
    getElementById: element,
    addEventListener(event, handler) {
      handlers[`document:${event}`] = handler;
    }
  };
  const context = vm.createContext({
    document,
    window: { AudioContext: FakeAudioContext },
    AudioContext: FakeAudioContext,
    Math,
    setInterval() { return 1; },
    clearInterval() {},
    Promise
  });

  vm.runInContext(script, context);
  return { context, handlers };
}

test('plays a short sound only when food is eaten', () => {
  const { context } = loadGame();
  const audio = vm.runInContext('audioContext', context);

  assert.equal(audio.oscillators.length, 1, 'only the background oscillator starts initially');
  vm.runInContext("snake = [{x: 8, y: 10}, {x: 7, y: 10}, {x: 6, y: 10}]; dir = {x: 1, y: 0}; nextDir = dir; food = {x: 9, y: 10}; tick()", context);

  assert.equal(audio.oscillators.length, 2, 'eating food creates one sound-effect oscillator');
  assert.equal(audio.oscillators[1].starts, 1);
  assert.equal(audio.oscillators[1].stops, 1, 'the sound effect is one-shot');
});

test('keeps ambience running during play and restarts it after game over', () => {
  const { context, handlers } = loadGame();
  const audio = vm.runInContext('audioContext', context);
  const ambience = audio.oscillators[0];

  assert.equal(ambience.starts, 1);
  handlers['document:keydown']({ key: 'ArrowUp' });
  assert.equal(audio.state, 'running', 'the first key press unlocks browser audio');

  vm.runInContext("snake = [{x: 19, y: 10}, {x: 18, y: 10}, {x: 17, y: 10}]; dir = {x: 1, y: 0}; nextDir = dir; tick()", context);
  assert.equal(ambience.stops, 1, 'game over stops the background tone');

  handlers['restart:click']();
  assert.equal(audio.oscillators[1].starts, 1, 'restarting the game starts ambience again');
  assert.equal(audio.oscillators[1].stops, 0);
});
