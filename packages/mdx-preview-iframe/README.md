# MDX Preview Iframe

This is a companion webpage for the Github extension -  MDX preview extension

## Getting Started
1. Clone the repository
2. Install the dependencies:
`yarn install`

if you get error - The engine "node" is incompatible with this module. use `yarn install --ignore-engines` instead.
2. Start the development server: `yarn dev`

This webpage will be accessible at: `http://localhost:5173/`

## Working

When the Github extension sends MD code via postMessage, this webpage use esbuild-wasm to bundle the code and inject it into a script tag dynamically.
