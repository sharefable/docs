const esbuild = require('esbuild');
const { copy } = require('esbuild-plugin-copy')

async function buildCli() {
  try {
    await esbuild.build({
      entryPoints: ['./src/cli.ts'],
      bundle: true,
      platform: 'node',
      packages: 'external',
      outfile: './dist/cli.mjs',
      format: 'esm',
      plugins: [
        copy({
          assets: [
            {
              from: ['../common/static/**/*'],
              to: ['./static'],
            },
          ],
        }),
      ],
    });

    console.log('Build successful!');
  } catch (error) {
    console.error('Error during build:', error);
    process.exit(1);
  }
}

buildCli();
