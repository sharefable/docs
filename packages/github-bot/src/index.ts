import { type ApplicationFunctionOptions, type Probot } from 'probot';
import { generatePRPreview } from './build-pr';
import { getManifestConfig } from './get-manifest-config';
import cors from 'cors';

export default (app: Probot, { getRouter }: ApplicationFunctionOptions): void => {
  app.on('pull_request.synchronize', generatePRPreview);

  app.on('pull_request.opened', generatePRPreview);

  if (getRouter) {
    const router = getRouter();
    router.use(cors());
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    router.get('/hello-world', getManifestConfig);
  }
};
