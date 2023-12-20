import { ApplicationFunctionOptions, Probot } from "probot";
import { generatePRPreview } from "./build-pr";
import { getManifestConfig } from "./get-manifest-config";

export default (app: Probot, { getRouter }: ApplicationFunctionOptions) => {

  // @ts-ignore
  app.on('pull_request.synchronize', generatePRPreview)

  // @ts-ignore
  app.on('pull_request.opened', generatePRPreview);

  if (getRouter) {
    const router = getRouter()
    router.get("/hello-world", getManifestConfig);
  }
};
