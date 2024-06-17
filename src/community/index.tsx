import React from "react";
import { createRoot } from "react-dom/client";

import { Community } from './Community';

const app = document.getElementById('app')
if (!app) throw new Error('no element found for id="app"')

const root = createRoot(app);
root.render(<Community />);
