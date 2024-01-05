#!/usr/bin/env node

import { program } from 'commander';
import { existsSync, mkdirSync, rmSync, renameSync, copyFileSync, cpSync, readdirSync } from 'fs';
import { ExecSyncOptionsWithBufferEncoding, exec, execSync } from 'child_process';
import { join, resolve, dirname } from 'path';
import { tmpdir } from 'os'
import serialize from '@fable-doc/fs-ser/dist/esm/index.js'
import {
  copyDirectory,
  generateRootCssFile,
  generateRouterFile,
  generateSidepanelLinks,
  writeUserConfigAndManifest
} from './utils';
import { fileURLToPath } from 'url';
import {
  generateUserAndDefaultCombinedConfig,
  getUserConfig,
  handleComponentSwapping,
  info
} from '@fable-doc/common';
import { watch } from 'chokidar'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DO_NOT_DELETE_DIRS_ACROSS_REBUILD = ['node_modules', 'package.json', 'package-lock.json']

const commonProcedure = async (command: 'build' | 'start'): Promise<string> => {
  info("Starting...")

  const tempDir = join(tmpdir(), 'fable-doc-dist');
  if (!existsSync(tempDir)) mkdirSync(tempDir);
  const execOptions: ExecSyncOptionsWithBufferEncoding = { cwd: tempDir }
  const distLoc = join(tempDir, 'dist')
  if (!existsSync(distLoc)) mkdirSync(distLoc);

  rmSync(join(tempDir, 'mdx-dist'), { recursive: true, force: true })
  rmSync(join(resolve(), 'dist'), { recursive: true, force: true })
  rmSync(join(resolve(), 'build'), { recursive: true, force: true })
  rmSync(join(resolve(), 'mdx-dist'), { recursive: true, force: true })
  const outputRouterFile = join(distLoc, 'src', 'router.js')
  const outputRootCssFile = join(distLoc, 'src', 'root.css');
  readdirSync(distLoc).map(item => {
    if (!DO_NOT_DELETE_DIRS_ACROSS_REBUILD.includes(item)) {
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
  info("Preparing packages...")
  execSync(`cd dist && npm i && mkdir src`, execOptions);
  info("Preparing assets and files...")
  copyFileSync(join(__dirname, 'static', 'webpack.config.js'), join(distLoc, 'webpack.config.js'));
  copyFileSync(join(__dirname, 'static', 'index.html'), join(distLoc, 'index.html'));
  copyFileSync(join(__dirname, 'static', 'index.js'), join(distLoc, 'src', 'index.js'));
  copyFileSync(join(__dirname, 'static', 'application-context.js'), join(distLoc, 'src', 'application-context.js'));
  copyFileSync(join(__dirname, 'static', 'Wrapper.js'), join(distLoc, 'src', 'Wrapper.js'));
  copyFileSync(join(__dirname, 'static', 'index.css'), join(distLoc, 'src', 'index.css'));
  const userConfigFilePath = join(resolve(), 'config.js')
  if (!existsSync(userConfigFilePath)) copyFileSync(join(__dirname, 'static', 'config.js'), userConfigFilePath);
  const userConfig = getUserConfig(userConfigFilePath);
  handleComponentSwapping(userConfigFilePath, userConfig, distLoc, join(__dirname, 'static', 'layouts'));
  const combinedData = generateUserAndDefaultCombinedConfig(
    userConfig,
    manifest,
    resolve()
  )
  writeUserConfigAndManifest(
    combinedData.config,
    combinedData.manifest,
    join(distLoc, 'src', "config.json"),
    join(distLoc, 'src', "manifest.json")
  )
  renameSync(join(tempDir, 'mdx-dist'), join(distLoc, 'src', 'mdx-dist'))
  const layoutFolder = join(distLoc, 'src', 'layouts');
  if(existsSync(layoutFolder)) rmSync(layoutFolder)
  cpSync(
    join(__dirname, 'static', 'layouts'),
    layoutFolder,
    { recursive: true }
  )
  generateRouterFile(outputRouterFile, combinedData.config.urlMapping)
  generateSidepanelLinks(
    manifest.tree,
    combinedData.config.urlMapping,
    join(distLoc, 'src', "sidepanel-links.json")
  )
  generateRootCssFile(outputRootCssFile, combinedData.config.theme);
  cpSync(
    join(__dirname, 'static', 'assets'),
    join(distLoc, 'src', 'assets'),
    { recursive: true }
  )

  if (command === 'build') {
    execSync(`cd dist && npm run ${command}`, execOptions);
    info("Ready!")
  } else {
    info("Ready!")
    exec(`cd dist && npm run ${command}`, execOptions);
  }

  return distLoc
}

const reloadProcedure = async (): Promise<void> => {
  info("Reloading")

  const tempDir = join(tmpdir(), 'fable-doc-dist');
  if (!existsSync(tempDir)) mkdirSync(tempDir);
  const distLoc = join(tempDir, 'dist')
  if (!existsSync(distLoc)) mkdirSync(distLoc);

  rmSync(join(tempDir, 'mdx-dist'), { recursive: true, force: true })
  rmSync(join(resolve(), 'dist'), { recursive: true, force: true })
  rmSync(join(resolve(), 'build'), { recursive: true, force: true })
  rmSync(join(resolve(), 'mdx-dist'), { recursive: true, force: true })
  rmSync(join(tempDir, 'dist', 'src', 'mdx-dist'), { recursive: true, force: true })

  const outputRouterFile = join(distLoc, 'src', 'router.js');
  const outputRootCssFile = join(distLoc, 'src', 'root.css');
  const manifest = await serialize({
    serStartsFromAbsDir: resolve(),
    outputFilePath: join(tempDir, 'mdx-dist'),
    donotTraverseList: ["**/config.js"]
  })
  const userConfigFilePath = join(resolve(), 'config.js')
  if (!existsSync(userConfigFilePath)) copyFileSync(join(__dirname, 'static', 'config.js'), userConfigFilePath);
  const userConfig = getUserConfig(userConfigFilePath);
  handleComponentSwapping(userConfigFilePath, userConfig, distLoc, join(__dirname, 'static', 'layouts'));
  const combinedData = generateUserAndDefaultCombinedConfig(
    userConfig,
    manifest,
    resolve()
  )
  writeUserConfigAndManifest(
    combinedData.config,
    combinedData.manifest,
    join(distLoc, 'src', "config.json"),
    join(distLoc, 'src', "manifest.json")
  )
  renameSync(join(tempDir, 'mdx-dist'), join(distLoc, 'src', 'mdx-dist'))
  generateRouterFile(outputRouterFile, combinedData.config.urlMapping);
  generateRootCssFile(outputRootCssFile, combinedData.config.theme);
  generateSidepanelLinks(
    manifest.tree,
    combinedData.config.urlMapping,
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
    info(`Built in ${Math.round((end - start) / 1000)} secs!`)
  });


program.parse(process.argv);
