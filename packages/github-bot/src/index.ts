import { ApplicationFunctionOptions, Probot } from "probot";
import { generatePRPreview } from "./build-pr";
import { getManifestConfig } from "./get-manifest-config";
import cors from "cors";

export default (app: Probot, { getRouter }: ApplicationFunctionOptions) => {

  // @ts-ignore
  app.on('pull_request.synchronize', generatePRPreview)

  // @ts-ignore
  app.on('pull_request.opened', generatePRPreview);

  if (getRouter) {
    const router = getRouter();
    router.use(cors());
    router.get("/hello-world", getManifestConfig);
  }
};
