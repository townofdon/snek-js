import React from 'react';
import { createRoot } from 'react-dom/client';

import { IS_LOCALHOST, IS_PREVIEW } from '@/constants';
import { TitleScreen } from './TitleScreen';
import { SettingsMenu } from './SettingsMenu';
import { DebugMenu } from './DebugMenu';
import { LevelSelectMenu } from './LevelSelectMenu';
import { GameModeMenu } from './GameModeMenu';
import { SaveSlotMenu } from './SaveSlotMenu';

const requireElementById = (id: string) => {
  const node = document.getElementById(id);
  if (!node) throw new Error(`No DOM node exists with id="${id}"`);
  return node;
}

createRoot(requireElementById('settings-menu-v2')).render(
  <React.StrictMode>
    <SettingsMenu />
  </React.StrictMode>
);
if (!IS_PREVIEW) {
  createRoot(requireElementById('title-screen-v2')).render(
    <React.StrictMode>
      <TitleScreen />
    </React.StrictMode>
  );
}
if (!IS_PREVIEW) {
  createRoot(requireElementById('level-select-menu-v2')).render(
    <React.StrictMode>
      <LevelSelectMenu />
    </React.StrictMode>
  );
}
if (!IS_PREVIEW) {
  createRoot(requireElementById('game-mode-menu-v2')).render(
    <React.StrictMode>
      <GameModeMenu />
    </React.StrictMode>
  );
}
if (!IS_PREVIEW) {
  createRoot(requireElementById('save-slot-menu-v2')).render(
    <React.StrictMode>
      <SaveSlotMenu />
    </React.StrictMode>
  );
}
if (IS_LOCALHOST) {
  createRoot(requireElementById('debug-menu-v2')).render(
    <React.StrictMode>
      <DebugMenu />
    </React.StrictMode>
  );
}
