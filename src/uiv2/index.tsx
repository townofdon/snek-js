import React from 'react';
import { createRoot } from 'react-dom/client';

function UIV2Root() {
  return <div></div>
}

const domNode = document.getElementById('ui-v2');
if (!domNode) throw new Error(`No DOM node exists with id "ui-v2"`)
const root = createRoot(domNode);
root.render(<UIV2Root />);
