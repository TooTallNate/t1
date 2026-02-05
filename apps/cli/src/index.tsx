#!/usr/bin/env node
import { render } from "ink";
import { App } from "./components/App.js";

const { waitUntilExit } = render(<App />);

waitUntilExit().then(() => {
	process.exit(0);
});
