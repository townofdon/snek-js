import { createRoot } from "react-dom/client";

import { editorMain } from './editor';

const app = document.getElementById('app')
if (!app) throw new Error('no element found for id="app"')

const root = createRoot(app);
root.render(editorMain());
