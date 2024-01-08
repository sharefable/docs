#!/usr/bin/env node
import { program } from "commander";
import * as log from "@fable-doc/common/dist/esm/log.js";
import { fileURLToPath } from "url";
import { join, resolve, dirname } from "path";
import { tmpdir } from "os";

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
const distRoot = join(tmpdir(), "io.documentden.doc.build");

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

const runProcedure = async (command: "build" | "start", ctx: {
  ref: string
}): Promise<string> => {
  log.info(`Starting ${command} ...`);

  const getStaticFileLoc = getLocationMaker("static");
  const getUserFileLoc = getLocationMaker("user");
  const getDistFileLoc = getLocationMaker("dist", ctx.ref);
  log.debug("Locations: ", JSON.stringify({
    staticFileLoc: getStaticFileLoc(),
    userFileLoc: getUserFileLoc(),
    distFileLoc: getDistFileLoc()
  }, null, 2));

  return "";
};

program.command("build")
  .description("Build docs in the current directory. Make sure you run this command from top of the dir")
  .option("--ref <type>", "Unique run details", getMonoIncNoAsId())
  .action(async (options: Record<string, string>) => {
    const start = performance.now();
    await runProcedure("build", { ref: options.ref });
    log.info(`Completed. Built in ${Math.floor((performance.now() - start) / 1000) + 1} secs!`);
  });

program.parse(process.argv);