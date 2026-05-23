/*
 * P0b.3 Prototype Store
 * Classic browser script. Keeps legacy runtime compatible while centralizing
 * base/current state creation and reset behavior.
 */
(function () {
  if (window.__agentTeamPrototypeStore) return;

  function clone(value) {
    return JSON.parse(JSON.stringify(value || {}));
  }

  let baseState = null;
  let currentState = null;

  function syncGlobalState() {
    window.currentState = currentState;
    window.baseState = baseState;
  }

  function init(initialBaseState) {
    baseState = clone(initialBaseState);
    currentState = clone(baseState);
    syncGlobalState();
    return currentState;
  }

  function getBaseState() {
    return baseState;
  }

  function getState() {
    return currentState;
  }

  function replaceState(nextState) {
    currentState = clone(nextState);
    syncGlobalState();
    return currentState;
  }

  function resetState(nextBaseState) {
    if (nextBaseState) baseState = clone(nextBaseState);
    currentState = clone(baseState);
    syncGlobalState();
    return currentState;
  }

  function patchState(patch) {
    Object.assign(currentState, patch || {});
    syncGlobalState();
    return currentState;
  }

  window.__agentTeamPrototypeStore = Object.freeze({
    version: 'p0b.3',
    kind: 'classic-script-prototype-store',
    init,
    getBaseState,
    getState,
    replaceState,
    resetState,
    patchState,
    cloneState: clone,
  });
})();
