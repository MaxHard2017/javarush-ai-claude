"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const html = fs.readFileSync("tetris/index.html", "utf8");
const script = html.match(/<script>([\s\S]*)<\/script>/)[1];
const sandbox = { module: { exports: {} }, console };
vm.runInNewContext(script, sandbox, { filename: "tetris/index.html" });
const { gravityDelay } = sandbox.module.exports;

assert.equal(gravityDelay(0), 500, "до 100 очков интервал должен быть 500 мс");
assert.equal(gravityDelay(99), 500, "на 99 очках интервал ещё не меняется");
assert.equal(gravityDelay(100), 450, "на 100 очках интервал сокращается на 10%");
assert.equal(gravityDelay(200), 405, "на 200 очках сокращение применяется повторно");
assert.equal(gravityDelay(100000), 120, "интервал не должен быть меньше 120 мс");

console.log("soft speedup tests passed");
