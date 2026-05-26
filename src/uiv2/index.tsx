import React from 'react';
import { createRoot } from 'react-dom/client';
import { MainMenu } from './MainMenu';

const requireElementById = (id: string) => {
  const node = document.getElementById(id);
  if (!node) throw new Error(`No DOM node exists with id="${id}"`);
  return node;
}

createRoot(requireElementById('main-menu-v2')).render(<MainMenu />);
