#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import { existsSync, mkdirSync, rmSync, renameSync, copyFileSync, cpSync, readdirSync, readFileSync, readFile } from 'fs';
import { ExecSyncOptionsWithBufferEncoding, exec, execSync } from 'child_process';
import { join, resolve, dirname } from 'path';
import { tmpdir } from 'os'
import serialize from '@fable-doc/fs-ser/dist/esm/index.js'
import { copyDirectory, generateRootCssFile, generateRouterFile, generateSidepanelLinks, generateUserAndDefaultCombinedConfig, getUserConfig } from './utils';
import { fileURLToPath } from 'url';
import { watch } from 'chokidar'
import { Config } from './types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PERSISTENT_TOOLING_ARTIFACTS = ['node_modules', 'package.json', 'package-lock.json']

const commonProcedure = async (command: 'build' | 'start'): Promise<string> => {
  console.log(chalk.blue('Starting...'));

  const tempDir = join(tmpdir(), 'fable-doc-dist');

  if (!existsSync(tempDir)) mkdirSync(tempDir);

  const execOptions: ExecSyncOptionsWithBufferEncoding = {
    // stdio: 'inherit',
    cwd: tempDir,
  }

  const distLoc = join(tempDir, 'dist')

  if (!existsSync(distLoc)) mkdirSync(distLoc);

  execSync(`rm -rf mdx-dist`, execOptions);

  // Deletes the dist in user project directory
  execSync(`rm -rf dist && rm -rf build && rm -rf mdx-dist`);

  const outputRouterFile = join(distLoc, 'src', 'router.js')
  const outputRootCssFile = join(distLoc, 'src', 'root.css');
  readdirSync(distLoc).map(item => {
    if (!PERSISTENT_TOOLING_ARTIFACTS.includes(item)) {
      rmSync(join(distLoc, item), { recursive: true })
    }
  })

  const manifest = await serialize({
    serStartsFromAbsDir: resolve(),
    outputFilePath: join(tempDir, 'mdx-dist'),
    donotTraverseList: ["**/config.js"]
  })

  copyFileSync(join(__dirname, 'static', 'package.json'), join(distLoc, 'package.json'));

  copyFileSync(join(__dirname, 'static', 'gitignore'), join(distLoc, '.gitignore'));

  console.log(chalk.blue('Preparing packages..'));

  execSync(`cd dist && npm i && mkdir src`, execOptions);

  console.log(chalk.blue('Preparing assets and files..'));

  copyFileSync(join(__dirname, 'static', 'webpack.config.js'), join(distLoc, 'webpack.config.js'));

  copyFileSync(join(__dirname, 'static', 'index.html'), join(distLoc, 'index.html'));

  copyFileSync(join(__dirname, 'static', 'index.js'), join(distLoc, 'src', 'index.js'));

  copyFileSync(join(__dirname, 'static', 'Layout.js'), join(distLoc, 'src', 'Layout.js'));

  copyFileSync(join(__dirname, 'static', 'Wrapper.js'), join(distLoc, 'src', 'Wrapper.js'));

  copyFileSync(join(__dirname, 'static', 'index.css'), join(distLoc, 'src', 'index.css'));

  const userConfigFilePath = join(resolve(), 'config.js')
  if (!existsSync(userConfigFilePath)) {
    copyFileSync(join(__dirname, 'static', 'config.js'), userConfigFilePath);
  }

  const userConfig = getUserConfig(userConfigFilePath);

  const config = generateUserAndDefaultCombinedConfig(
    userConfig,
    manifest,
    join(distLoc, 'src', "config.json"),
    join(distLoc, 'src', "manifest.json")
  )

  renameSync(join(tempDir, 'mdx-dist'), join(distLoc, 'src', 'mdx-dist'))

  generateRouterFile(outputRouterFile, config.urlMapping)

  generateSidepanelLinks(
    manifest.tree,
    config.urlMapping,
    join(distLoc, 'src', "sidepanel-links.json")
  )
  generateRootCssFile(outputRootCssFile, config.theme);

  cpSync(
    join(__dirname, 'static', 'components'),
    join(distLoc, 'src', 'components'),
    { recursive: true }
  )

  cpSync(
    join(__dirname, 'static', 'assets'),
    join(distLoc, 'src', 'assets'),
    { recursive: true }
  )

  
  if (command === 'build') {
    execSync(`cd dist && npm run ${command}`, execOptions);
    console.log(chalk.blue('Ready!'));
  } else {
    console.log(chalk.blue('Ready!'));
    exec(`cd dist && npm run ${command}`, execOptions);
  }

  return distLoc
}

const reloadProcedure = async (): Promise<void> => {
  console.log(chalk.blue('Reloading'));

  const tempDir = join(tmpdir(), 'fable-doc-dist');

  if (!existsSync(tempDir)) mkdirSync(tempDir);

  const execOptions: ExecSyncOptionsWithBufferEncoding = {
    // stdio: 'inherit',
    cwd: tempDir,
  }

  const distLoc = join(tempDir, 'dist')

  if (!existsSync(distLoc)) mkdirSync(distLoc);

  execSync(`rm -rf mdx-dist`, execOptions);

  // Deletes the dist in user project directory
  execSync(`rm -rf dist && rm -rf build && rm -rf mdx-dist`);

  execSync(`cd dist && cd src && rm -rf mdx-dist`, execOptions);

  const outputRouterFile = join(distLoc, 'src', 'router.js');
  const outputRootCssFile = join(distLoc, 'src', 'root.css');

  const manifest = await serialize({
    serStartsFromAbsDir: resolve(),
    outputFilePath: join(tempDir, 'mdx-dist'),
    donotTraverseList: ["**/config.js"]
  })

  const userConfigFilePath = join(resolve(), 'config.js')
  if (!existsSync(userConfigFilePath)) {
    copyFileSync(join(__dirname, 'static', 'config.js'), userConfigFilePath);
  }

  const userConfig = getUserConfig(userConfigFilePath);

  const config = generateUserAndDefaultCombinedConfig(
    userConfig,
    manifest,
    join(distLoc, 'src', "config.json"),
    join(distLoc, 'src', "manifest.json"),
  )

  renameSync(join(tempDir, 'mdx-dist'), join(distLoc, 'src', 'mdx-dist'))

  generateRouterFile(outputRouterFile, config.urlMapping);
  generateRootCssFile(outputRootCssFile, config.theme);

  generateSidepanelLinks(
    manifest.tree,
    config.urlMapping,
    join(distLoc, 'src', "sidepanel-links.json")
  )
}

program
  .command('start')
  .description('Start docs in current directory')
  .action(async () => {
    let reloading = false

    watch(resolve(), {
      // @TODO: ignore all dot folders like .components
      ignored: [/node_modules/, "**/.git", "**/.git/**"],
      ignoreInitial: true
    })
      .on('all', async () => {
        if (reloading) return
        reloading = true
        try {
          await reloadProcedure()
        } catch (e) {
          console.error(e)
        }
        reloading = false
      });

    await commonProcedure('start')
  });

program
  .command('build')
  .description('Build docs in current directory')
  .action(async () => {
    const start = performance.now()

    const distLoc = await commonProcedure('build')

    copyDirectory(join(distLoc, 'build'), join(resolve(), 'build'))

    const end = performance.now()

    console.log(`Built in ${Math.round((end - start) / 1000)} secs!`)
  });


program.parse(process.argv);
