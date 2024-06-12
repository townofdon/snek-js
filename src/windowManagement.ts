import { DIMENSIONS } from "./constants";
import { lerp } from "./utils";

window.addEventListener('resize', handleWindowResize)

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
  state.currentScale = lerp(state.currentScale, state.targetScale, 0.1);
  const main = document.getElementById('main');
  main.style.width = `${DIMENSIONS.x}px`;
  main.style.height = `${DIMENSIONS.y}px`;
  main.style.transform = `scale(${state.currentScale})`;
  requestAnimationFrame(incrementallyScaleWindow);
}

const query = new URLSearchParams(window.location.search);
const disableFullscreen = query.get('disableFullscreen') === 'true';

if (!disableFullscreen) {
  handleWindowResize();
}
