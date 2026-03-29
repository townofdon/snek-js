import React from "react";
import { createRoot } from "react-dom/client";
import { AStarTester } from "./AStarTester";

const app = document.getElementById('app')
if (!app) throw new Error('no element found for id="app"')

const root = createRoot(app);
root.render(<AStarTester />);
