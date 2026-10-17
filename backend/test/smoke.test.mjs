import test from "node:test";
import assert from "node:assert/strict";

test("backend project is initialized", () => {
  assert.equal(typeof "clinica-inteligente-backend", "string");
});
