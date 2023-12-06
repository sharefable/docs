#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import { existsSync, mkdirSync, rmSync, renameSync, copyFileSync, cpSync } from 'fs';
import { ExecSyncOptionsWithBufferEncoding, execSync } from 'child_process';
import { join, resolve, dirname } from 'path';
import { tmpdir } from 'os'
import serialize from '@fable-doc/fs-ser/dist/esm/index.js'
import { generateRouterFile, getFilePaths, getUrlMap } from './utils';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

program
  .command('start')
  .description('Start docs in current directory')
  .action(async () => {

    console.log(chalk.blue('Loading'));

    const tempDir = join(tmpdir(), 'fable-doc-dist');

    if (!existsSync(tempDir)) mkdirSync(tempDir);

    await commonProcedure('start', tempDir)

    execSync(`cd dist && npx webpack-dev-server --mode development --open`,
      { stdio: 'inherit', cwd: tempDir }
    );
  });

const commonProcedure = async (command: 'build' | 'start', tempDir?: string) => {
  const execOptions: ExecSyncOptionsWithBufferEncoding = {
    stdio: 'inherit',
    cwd: command === 'start' ? tempDir : undefined,
  }

  const basePath = command === 'start' ? tempDir : resolve()

  execSync(`rm -rf dist && rm -rf build && rm -rf mdx-dist`, execOptions);

  execSync(`rm -rf dist && rm -rf build && rm -rf mdx-dist`);

  const outputRouterFile = join(basePath, 'dist', 'src', 'router.js')

  const manifest = await serialize({
    serStartsFromAbsDir: resolve(),
    outputFilePath: join(basePath, 'mdx-dist'),
    donotTraverseList: ["**/config.js"]
  })

  execSync(`mkdir dist && cd dist && npm init -y`, execOptions);

  copyFileSync(join(__dirname, 'static', 'gitignore'), join(basePath, 'dist', '.gitignore'));

  execSync(`cd dist && npm i react react-router-dom react-dom react-snap`, execOptions);

  execSync(`cd dist && npm i -D @babel/core @babel/preset-env @babel/preset-react babel-loader html-webpack-plugin webpack webpack-cli webpack-dev-server`, execOptions);

  execSync(`cd dist && mkdir src`, execOptions);

  copyFileSync(join(__dirname, 'static', 'webpack.config.js'), join(basePath, 'dist', 'webpack.config.js'));

  copyFileSync(join(__dirname, 'static', 'index.html'), join(basePath, 'dist', 'index.html'));

  copyFileSync(join(__dirname, 'static', 'index.js'), join(basePath, 'dist', 'src', 'index.js'));

  copyFileSync(join(__dirname, 'static', 'Layout.js'), join(basePath, 'dist', 'src', 'Layout.js'));

  const userConfigFilePath = join(resolve(), 'config.js')
  if (!existsSync(join(resolve(), 'config.js'))) {
    copyFileSync(join(__dirname, 'static', 'config.js'), userConfigFilePath);
  }

  copyFileSync(userConfigFilePath, join(basePath, 'dist', 'src', 'config.js'));

  const fileURL = new URL(`file://${userConfigFilePath}`);
  const userConfig = await import(fileURL.toString());
  const userUrlMap = userConfig.default.urlMapping

  renameSync(join(basePath, 'mdx-dist'), join(basePath, 'dist', 'src', 'mdx-dist'))

  const urlMap = getUrlMap(manifest, userUrlMap)

  generateRouterFile(outputRouterFile, urlMap)

  cpSync(
    join(__dirname, 'static', 'components'),
    join(basePath, 'dist', 'src', 'components'),
    { recursive: true }
  )
}

program
  .command('build')
  .description('Build docs in current directory')
  .action(async () => {
    console.log(chalk.blue('Loading'));

    await commonProcedure('build')

    execSync(`cd dist && npx webpack --mode production`, { stdio: 'inherit' });

    execSync(`cd dist && npx react-snap`, { stdio: 'inherit' });

    renameSync(join(resolve(), 'dist', 'build'), join(resolve(), 'build'))

    rmSync(join(resolve(), 'dist'), { recursive: true })
  });


program.parse(process.argv);
