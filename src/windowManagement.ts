import { DIMENSIONS } from "./constants";
import { lerp } from "./utils";
import { settings } from './stores/SettingsStore';
import { ResolutionMode } from "./types";

interface WindowState {
  targetScale: number,
  currentScale: number,
}

const state: WindowState = {
  targetScale: 1,
  currentScale: 1,
}

function calcTargetScale() {
  if (settings.resolutionMode === ResolutionMode.FillScreen) {
    const scaleX = window.innerWidth / DIMENSIONS.x;
    const scaleY = window.innerHeight / DIMENSIONS.y;
    const scaleToFit = Math.min(scaleX, scaleY);
    state.targetScale = scaleToFit;
  } else if (settings.resolutionMode === ResolutionMode.PixelPerfect) {
    let scale = 1;
    const tooBig = () => (DIMENSIONS.x * scale) > window.innerWidth || (DIMENSIONS.y * scale) > window.innerHeight;
    const tooSmall = () => window.innerWidth / (DIMENSIONS.x * scale) >= 2 || window.innerHeight / (DIMENSIONS.y * scale) >= 2;
    while (tooSmall()) {
      scale *= 2;
    }
    while (tooBig()) {
      scale /= 2;
    }
    state.targetScale = scale;
  }
}

function incrementallyScaleWindow() {
  calcTargetScale();
  if (state.targetScale !== state.currentScale) {
    state.currentScale = lerp(state.currentScale, state.targetScale, 0.1);
    const main = document.getElementById('main');
    main.style.width = `${DIMENSIONS.x}px`;
    main.style.height = `${DIMENSIONS.y}px`;
    main.style.transform = `scale(${state.currentScale})`;
  }
  requestAnimationFrame(incrementallyScaleWindow);
}

const query = new URLSearchParams(window.location.search);
const disableFullscreen = query.get('disableFullscreen') === 'true';

if (!disableFullscreen) {
  incrementallyScaleWindow();
}

// show/hide mouse cursor
let mouseTimeout: NodeJS.Timeout;
window.addEventListener('mousemove', handleMouseMove)
function handleMouseMove() {
  clearTimeout(mouseTimeout);
  document.body.classList.add('show-cursor');
  mouseTimeout = setTimeout(() => {
    document.body.classList.remove('show-cursor');
  }, 3000);
}
