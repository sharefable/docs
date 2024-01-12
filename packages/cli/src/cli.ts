#!/usr/bin/env node

// This file gets called from command line directly (as a script like bash) hence the shebang is required

import { program } from "commander";
import { fileURLToPath } from "url";
import * as log from "@fable-doc/common/dist/esm/log.js";
import { join, resolve, dirname } from "path";
import { tmpdir } from "os";
import { existsSync, mkdirSync, rmSync, copyFileSync, readdirSync } from "fs";
import { ExecSyncOptionsWithBufferEncoding, exec, execSync } from "child_process";
import { rm, copyFile, writeFile, cp } from "fs/promises";
import serialize from "@fable-doc/fs-ser/dist/esm/index.js";
import { generateManifestAndCombinedConfig, getUserConfig, handleComponentSwapping, parseGlobalPrefix } from "@fable-doc/common";
import { copyDirectory, generateIndexHtmlFile, generateRootCssFile, generateRouterFile, getProjectUrlTree } from "./utils";
import { watch } from "chokidar";

function getMonoIncNoAsId(): string {
  return (+(`${(+new Date() / 1000) | 0}${Math.random() * (10 ** 8) | 0}`)).toString(16);
}

// There are three kind of locations
// 1. Static files from this repo common/static -> systemland
// 2. User's documents i.e. repo on which fable-doc build command is ran -> userland
// 3. Temp location where build is generated -> distland

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const userlandLoc = resolve();
const distRoot = join(tmpdir(), "io.documentden.doc.dist");

const CACHE_FILES_ACROSS_RUNS = ["node_modules", "package.json", "package-lock.json"];

function getLocationMaker(land: "static" | "user" | "dist", ...pathPrefix: string[]) {
  return (...pathFrag: string[]): string => {
    switch (land) {
    case "static":
      return join(__dirname, "static", ...pathPrefix, ...pathFrag);
    case "user":
      return join(userlandLoc, ...pathPrefix, ...pathFrag);
    case "dist":
      return join(distRoot, ...pathPrefix, ...pathFrag);
    default:
      throw new Error(`#getLocationMaker not implemented for land ${  land}`);
    }
  };
}

const commonRmOpts = { recursive: true, force: true };

const runProcedure = async (command: "build" | "start" | "reload", ctx: {
  ref: string
}): Promise<void> => {
  log.info(`Starting ${command}...`);

  const getStaticFileLoc = getLocationMaker("static");
  const getUserFileLoc = getLocationMaker("user");
  const getDistFileLoc = getLocationMaker("dist", ctx.ref, "dist");
  const userlandRoot = getUserFileLoc();
  const distlandRoot = getDistFileLoc();

  log.debug("Locations: ", JSON.stringify({
    staticFileLoc: getStaticFileLoc(),
    userFileLoc: getUserFileLoc(),
    distFileLoc: getDistFileLoc()
  }, null, 2));

  const FILES = {
    mdx_dist_dir: {
      distLand: getDistFileLoc("src", "mdx-dist"),
    },
    build_dir: {
      userLand: getUserFileLoc("build"),
      distLand: getDistFileLoc("build"),
    },
    router_js: {
      distLand: getDistFileLoc("src", "router.js"),
    },
    root_css: {
      distLand: getDistFileLoc("src", "root.css"),
    },
    package_json: {
      staticLand: getStaticFileLoc("package.json"),
      distLand: getDistFileLoc("package.json"),
    },
    webpack_config_js: {
      staticLand: getStaticFileLoc("webpack.config.js"),
      distLand: getDistFileLoc("webpack.config.js")
    },
    index_html: {
      staticLand: getStaticFileLoc("index.html"),
      distLand: getDistFileLoc("index.html")
    },
    index_js: {
      staticLand: getStaticFileLoc("index.js"),
      distLand: getDistFileLoc("src", "index.js")
    },
    app_ctx_js: {
      staticLand: getStaticFileLoc("application-context.js"),
      distLand: getDistFileLoc("src", "application-context.js")
    },
    wrapper_js: {
      staticLand: getStaticFileLoc("Wrapper.js"),
      distLand: getDistFileLoc("src", "Wrapper.js")
    },
    index_css: {
      staticLand: getStaticFileLoc("index.css"),
      distLand: getDistFileLoc("src", "index.css")
    },
    layout_dir: {
      staticLand: getStaticFileLoc("layouts"),
      distLand: getDistFileLoc("src", "layouts")
    },
    config_file: {
      staticLand: getStaticFileLoc("config.js"),
      userLand: getUserFileLoc("config.js"),
      distLand: getDistFileLoc("config.js"),
    },
    config_json_file: {
      distLand: getDistFileLoc("src", "config.json"),
    },
    manifest_file: {
      distLand: getDistFileLoc("src", "manifest.json")
    },
    link_tree_json: {
      distLand: getDistFileLoc("src", "link-tree.json")
    },
    static_assets_dir: {
      staticLand: getStaticFileLoc("assets"),
      distLand: getDistFileLoc("src", "assets")
    },
    user_analytics_file: {
      userLand: getUserFileLoc("analytics.js"),
      distLand: getDistFileLoc("analytics.js")
    },
    sitemap_gen_file: {
      staticLand: getStaticFileLoc("sitemap-gen.mjs"),
      distLand: getDistFileLoc("src", "sitemap-gen.mjs")
    }
  };

  // You might notice we are using sync verion of fs calls. This is not an issue as one instance of this module gets
  // created for every run of `fable-doc build` i.e. new process gets created for each call to the command.
  // Inside the same process all calls (or atleast some calls) are blocking as it does not hamper parallelism
  // as parallelism is established by spawning new process.
  // Also sync calls are easier to read & debug.

  if (!existsSync(distRoot)) mkdirSync(distRoot);
  if (!existsSync(distlandRoot)) mkdirSync(distlandRoot, { recursive: true });

  // Since this procedure is called during live development, any edit to mdx needs to be rebuilt
  // We delete the old mdx dist dirs (as opposed to incrementally crud of the file) and recreate it again.
  rmSync(FILES.mdx_dist_dir.distLand, commonRmOpts);

  // At the end of the build process the build dir from distland gets copied to userland. Instead of incremntal
  // crud on file we rebuild the whole userland files and replace the old build dir with new one
  // (so far we did not see much performance issue)
  rmSync(FILES.build_dir.userLand, commonRmOpts);

  command !== "reload" && await Promise.all(
    readdirSync(distlandRoot).map(item =>
      CACHE_FILES_ACROSS_RUNS.includes(item)
        ? Promise.resolve() /* do not delete cached file */
        : rm(getDistFileLoc(item), commonRmOpts)
    )
  );

  const manifest = await serialize({
    serStartsFromAbsDir: userlandRoot,
    outputFilePath: FILES.mdx_dist_dir.distLand,
    donotTraverseList: ["**/config.js"]
  });

  const execOptions: ExecSyncOptionsWithBufferEncoding = {
    stdio: "inherit",
    cwd: distlandRoot,
  };


  if (command !== "reload") {
    log.info("Preparing packages...");
    copyFileSync(FILES.package_json.staticLand, join(distRoot, "package.json"));
    execSync("npm i", { cwd: distRoot, stdio: "inherit" });

    log.info("Preparing assets and files..");
    await Promise.all([
      FILES.webpack_config_js,
      FILES.index_js,
      FILES.app_ctx_js,
      FILES.wrapper_js,
      FILES.index_css,
      FILES.package_json,
      FILES.sitemap_gen_file
    ].map(file => copyFile(file.staticLand, file.distLand)));

    if(existsSync(FILES.layout_dir.distLand)) rmSync(FILES.layout_dir.distLand);
    // TODO[priority=low] in windows cp might fail if staticLand and distLand is in two different volume
    await Promise.all([
      FILES.layout_dir,
      FILES.static_assets_dir
    ].map(file => cp(file.staticLand, file.distLand, { recursive: true })));
  }

  // TODO need work on config merging, merged config needs to be passed to componentSwapping
  // TODO fable-doc init to copy site.json, config.json, some sample component to userland

  if (!existsSync(FILES.config_file.userLand)) {
    copyFileSync(FILES.config_file.staticLand, FILES.config_file.userLand);
  }
  const userConfig = getUserConfig(FILES.config_file.userLand);

  const combinedData = generateManifestAndCombinedConfig(userConfig, manifest, userlandRoot);
  await Promise.all([
    writeFile(FILES.config_json_file.distLand, JSON.stringify(combinedData.config, null, 2), "utf8"),
    writeFile(FILES.manifest_file.distLand, JSON.stringify(combinedData.manifest, null, 2), "utf8"),
  ]);

  // TODO[priority=medium] handleComponentSwapping uses string ops to figure out import. Use AST to figure
  // out import / export
  await handleComponentSwapping(FILES.config_file.userLand, combinedData.config, distlandRoot, FILES.layout_dir.staticLand);

  const isAnalyticsFilePresent = existsSync(FILES.user_analytics_file.userLand);
  if(isAnalyticsFilePresent) {
    copyFileSync(FILES.user_analytics_file.userLand, FILES.user_analytics_file.distLand);
  }
  generateIndexHtmlFile(FILES.index_html.distLand, isAnalyticsFilePresent, parseGlobalPrefix(combinedData.config.urlMapping.globalPrefix));    


  getProjectUrlTree(manifest.tree, combinedData.config.urlMapping, FILES.link_tree_json.distLand);

  generateRouterFile(FILES.router_js.distLand, combinedData.config.urlMapping);
  generateRootCssFile(FILES.root_css.distLand, combinedData.config.theme);

  if (command === "reload") return;

  (command === "build" ? execSync : exec)(`npm run ${command}`, execOptions);
  if (command === "build")
    // We can't run cpSync here as these two dirs can be part of two different volumes (windows)
    // cp does not work at that time
    copyDirectory(FILES.build_dir.distLand, FILES.build_dir.userLand);
};

program.command("build")
  .description("Build docs in the current directory. Make sure you run this command from top of the dir")
  .option("--ref <type>", "Unique run details", getMonoIncNoAsId())
  .action(async (options: Record<string, string>) => {
    const start = performance.now();
    await runProcedure("build", { ref: options.ref });
    log.info(`Completed. Built in ${Math.floor((performance.now() - start) / 1000) + 1} secs!`);
  });

program.command("start")
  .description("Build docs in the current directory and start dev server. Make sure you run this command from top of the dir")
  .option("--ref <type>", "Unique run details", getMonoIncNoAsId())
  .action(async (options: Record<string, string>) => {
    const start = performance.now();
    let reloading = false;

    watch(resolve(), {
      ignored: [/node_modules/, "**/.git", "**/.git/**"],
      ignoreInitial: true
    })
      .on("all", async () => {
        if (reloading) return;
        reloading = true;
        try {
          await runProcedure("reload", { ref: options.ref });
        } catch (e) {
          log.err(e);
        }
        reloading = false;
      });

    await runProcedure("start", { ref: options.ref });
    log.info(`Completed. Built in ${Math.floor((performance.now() - start) / 1000) + 1} secs!`);
    log.info("Server running on :8080");
  });

program.parse(process.argv);

// TODO eslint working
// TODO favicon support in header
// TODO component casing issue that siddhi has seen when helping sid build his first doc
// TODO fix config changes

// TODO post processing
//      - image(rawgithubcontent.githubcom -> our cdn)
//      - link tags
//      - seo report
//      - broken links

// TODO preview stuff
// TODO[minor] inline png, jpeg