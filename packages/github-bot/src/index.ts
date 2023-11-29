import { Probot } from "probot";
import { generatePRPreview } from "./build-pr";

export = (app: Probot) => {

  app.on('pull_request.synchronize', generatePRPreview)

  app.on('pull_request.opened', generatePRPreview);

};
