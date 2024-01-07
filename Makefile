.PHONY: containerize version upgrade

version: root_v=`jq -r ".version" package.json`
version: cli_v=`jq -r ".version" packages/cli/package.json`
version: common_v=`jq -r ".version" packages/common/package.json`
version: fs_ser_v=`jq -r ".version" packages/fs-ser/package.json`
version: gh_bot_v=`jq -r ".version" packages/github-bot/package.json`
version:
	@echo "$(root_v) [package.json ]"
	@echo "$(cli_v) [cli/package.json ]"
	@echo "$(common_v) [common/package.json]"
	@echo "$(fs_ser_v) [fs-ser/package.json]"
	@echo "$(gh_bot_v) [github-bot/package.json]"

upgrade:
	@if [ -z "$(v)" ]; then \
        echo "upgrade [v]ersion is mandatory. Usage: make upgrade v=2.1.0"; \
        false ; \
	fi
	@jq ".version |= \"${v}\"" package.json > .tmp && mv .tmp package.json
	# @jq ".version |= \"${v}\"" packages/cli/package.json > .tmp && mv .tmp packages/cli/package.json
	# @jq ".version |= \"${v}\"" packages/common/package.json > .tmp && mv .tmp packages/common/package.json
	# @jq ".version |= \"${v}\"" packages/fs-ser/package.json > .tmp && mv .tmp packages/fs-ser/package.json
	# @jq ".version |= \"${v}\"" packages/github-bot/package.json > .tmp && mv .tmp packages/github-bot/package.json
	@echo "Upgraded to $(v)"


containerize: export SERVICE_NAME="documentden-gh-bot"
containerize: export AWS_ORG=`aws sts get-caller-identity --query "Account" --output text`
containerize: export AWS_REGION=ap-southeast-1
containerize: export ECR_IMAGE_TAG=$(AWS_ORG).dkr.ecr.$(AWS_REGION).amazonaws.com/$(SERVICE_NAME):$(v)
containerize:
	@if [ -z "$(v)" ]; then \
        echo "[v]ersion is mandatory. Usage: make containerize v=2.1.0"; \
        false ; \
	fi
	@echo "ECR tag: $(ECR_IMAGE_TAG)"
	docker build -t $(SERVICE_NAME) -t $(ECR_IMAGE_TAG) .
	aws ecr get-login-password --region $(AWS_REGION) | docker login --username AWS --password-stdin $(AWS_ORG).dkr.ecr.$(AWS_REGION).amazonaws.com
	docker push $(ECR_IMAGE_TAG)