#!/usr/bin/env node

import { program } from 'commander';
import { writeFileSync, existsSync, mkdirSync, rmSync, renameSync } from 'fs';
import { execSync } from 'child_process';
import { join, resolve } from 'path';
import { indexJs, gitignore, webpackConfig, indexHtml } from './boilerplate-files'
import { tmpdir } from 'os'
import serialize from '@fable-doc/fs-ser/dist/esm/index.js'
import { generateRouterFile } from './utils';

program
  .command('start')
  .description('Start docs in current directory')
  .action(async () => {
    console.log('Loading...')

    const tempDir = join(tmpdir(), 'fable-doc-dist');
    
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir);
    }

    execSync(`rm -rf dist && rm -rf build && rm -rf mdx-dist`, { stdio: 'inherit', cwd: tempDir });

    const outputFile = join(tempDir, 'dist', 'src', 'router.js')
    
    const manifest = await serialize({ serStartsFromAbsDir: resolve(), outputFilePath: join(tempDir, 'mdx-dist') })
    
    // process.exit(1)

    execSync(`mkdir dist && cd dist && npm init -y`, { stdio: 'inherit', cwd: tempDir });

    writeFileSync(join(tempDir, 'dist', '.gitignore'), gitignore);

    writeFileSync(join(tempDir, 'dist', 'webpack.config.js'), webpackConfig);

    writeFileSync(join(tempDir, 'dist', 'index.html'), indexHtml);

    execSync(`cd dist && npm i react react-router-dom react-dom`, { stdio: 'inherit', cwd: tempDir });

    execSync(`cd dist && npm i -D @babel/core @babel/preset-env @babel/preset-react babel-loader html-webpack-plugin webpack webpack-cli webpack-dev-server`,
      { stdio: 'inherit', cwd: tempDir }
    );

    execSync(`cd dist && mkdir src`, { stdio: 'inherit', cwd: tempDir });

    renameSync(join(tempDir, 'mdx-dist'), join(tempDir, 'dist', 'src', 'mdx-dist'))

    writeFileSync(join(tempDir, 'dist', 'src', 'index.js'), indexJs);

    generateRouterFile(manifest, outputFile)

    execSync(`cd dist && npx webpack-dev-server --mode development --open`,
      { stdio: 'inherit', cwd: tempDir }
    );
  });


program
  .command('build')
  .description('Build docs in current directory')
  .action(async () => {
    console.log('Loading...')

    execSync(`rm -rf dist && rm -rf build & rm -rf mdx-dist`, { stdio: 'inherit' });

    const outputFile = join(resolve(), 'dist', 'src', 'router.js')
    const manifest = await serialize({ serStartsFromAbsDir: resolve(), outputFilePath: join(resolve(), 'mdx-dist') })

    execSync(`mkdir dist && cd dist && npm init -y`, { stdio: 'inherit' });

    writeFileSync(join(resolve(), 'dist', '.gitignore'), gitignore);

    writeFileSync(join(resolve(), 'dist', 'webpack.config.js'), webpackConfig);

    writeFileSync(join(resolve(), 'dist', 'index.html'), indexHtml);

    execSync(`cd dist && npm i react react-router-dom react-dom react-snap`, { stdio: 'inherit' });

    execSync(`cd dist && npm i -D @babel/core @babel/preset-env @babel/preset-react babel-loader html-webpack-plugin webpack webpack-cli webpack-dev-server`, { stdio: 'inherit' });

    execSync(`cd dist && mkdir src`, { stdio: 'inherit' });

    renameSync(join(resolve(), 'mdx-dist'), join(resolve(), 'dist', 'src', 'mdx-dist'))

    writeFileSync(join(resolve(), 'dist', 'src', 'index.js'), indexJs);
    
    generateRouterFile(manifest, outputFile)

    execSync(`cd dist && npx webpack --mode production`, { stdio: 'inherit' });

    execSync(`cd dist && npx react-snap`, { stdio: 'inherit' });

    renameSync(join(resolve(), 'dist', 'build'), join(resolve(), 'build'))

    rmSync(join(resolve(), 'dist'), { recursive: true })
  });


program.parse(process.argv);
