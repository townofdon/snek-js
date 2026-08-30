import React from 'react';
import { createRoot } from 'react-dom/client';
import { MainMenu } from './MainMenu';
import { SettingsMenu } from './SettingsMenu';

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
