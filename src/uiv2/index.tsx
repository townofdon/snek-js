import React from 'react';
import { createRoot } from 'react-dom/client';

import { IS_LOCALHOST } from '@/constants';
import { MainMenu } from './MainMenu';
import { SettingsMenu } from './SettingsMenu';
import { DebugMenu } from './DebugMenu';

const requireElementById = (id: string) => {
  const node = document.getElementById(id);
  if (!node) throw new Error(`No DOM node exists with id="${id}"`);
  return node;
}

createRoot(requireElementById('main-menu-v2')).render(
  <React.StrictMode>
    <MainMenu />
  </React.StrictMode>
);
createRoot(requireElementById('settings-menu-v2')).render(
  <React.StrictMode>
    <SettingsMenu />
  </React.StrictMode>
);
if (IS_LOCALHOST) {
  createRoot(requireElementById('debug-menu-v2')).render(
    <React.StrictMode>
      <DebugMenu />
    </React.StrictMode>
  );
}
