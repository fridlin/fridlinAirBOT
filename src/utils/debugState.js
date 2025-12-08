const state = new Map();

function setDebugState(userId, mode, args = {}) {
  if (mode === null) {
    state.delete(userId);
    return;
  }
  state.set(userId, { mode, args });
}

function getDebugState(userId) {
  return state.get(userId) || null;
}

module.exports = { setDebugState, getDebugState };
