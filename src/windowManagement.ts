import { DIMENSIONS } from "./constants";

window.addEventListener('resize', handleWindowResize)

const SCALE_STEP_SIZE = 0.05;

interface WindowState {
  isResizing: boolean,
  targetScale: number,
  currentScale: number,
}

const state: WindowState = {
  isResizing: false,
  targetScale: 1,
  currentScale: 1,
}

function handleWindowResize() {
  const scaleX = window.innerWidth / DIMENSIONS.x;
  const scaleY = window.innerHeight / DIMENSIONS.y;
  const scaleToFit = Math.min(scaleX, scaleY);
  state.targetScale = scaleToFit;
  if (!state.isResizing) {
    state.isResizing = true;
    incrementallyScaleWindow();
  }
}

function incrementallyScaleWindow() {
  if (state.targetScale === state.currentScale) {
    state.isResizing = false;
    return;
  }
  if (state.currentScale < state.targetScale) {
    state.currentScale = Math.min(state.currentScale + SCALE_STEP_SIZE, state.targetScale);
  } else {
    state.currentScale = Math.max(state.currentScale - SCALE_STEP_SIZE, state.targetScale);
  }
  const main = document.getElementById('main');
  main.style.transform = `scale(${state.currentScale})`;
  requestAnimationFrame(incrementallyScaleWindow);
}

handleWindowResize();
