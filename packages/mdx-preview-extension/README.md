# MDX Preview extension

This github extension provides a live preview for MDX files directly on github.

## Getting Started
1. Clone the repository
2. Install the dependencies:
`yarn install`

if you get error - The engine "node" is incompatible with this module. use `yarn install --ignore-engines` instead.
3. Build the extension: `yarn build`
4. Load the build by clicking on "Load unpacked" and select build folder.

## Usage
Navigate to any github repository containing MDX file. Click on edit option for that file. 
When you click on the extension, live preview will be activated and you will be able to preview mdx code in your github.

You can also import and use react code in your mdx file and preview it in github by taking the imports from esm.sh

Exampl mdx code with React:

```
---
title: Sample MDX File
---

# Welcome to My MDX File

This is a sample MDX file that includes a React component.

## Custom Component

Now, let's use a custom React component in this MDX file.


import {Button} from 'https://esm.sh/antd'
export const CustomComponent = ({ message }) => (
  <div style={{ backgroundColor: 'black', padding: '16px', borderRadius: '4px', color:'white' }}>
    <Button type='primary'>Click me</Button>
    <p>{message}</p>
  </div>
 );

 <CustomComponent message='this is ant button'/>
```