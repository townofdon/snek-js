import React from "react";
import { createRoot } from "react-dom/client";

import { Editor } from './Editor';
import { VERSION } from "@/constants";

const app = document.getElementById('app')
if (!app) throw new Error('no element found for id="app"')

const root = createRoot(app);
root.render(<Editor />);

console.log(`editor version: ${VERSION}`);
