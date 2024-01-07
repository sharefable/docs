#!/bin/bash

# Usage
# ./run.sh <version_of_docker_image_in_ecr>
# ./run.sh 1.0.1

# Parameter store's secrets must be written in hierarchy `/project/branch/secret_name`
PARAM_PATH=/documentden/gh-bot/prod
n=`expr ${#PARAM_PATH} + 1`

docker pull 556055615522.dkr.ecr.ap-southeast-1.amazonaws.com/documentden-gh-bot:$1

aws --region=ap-south-1 ssm get-parameters --names \
  $(aws --region=ap-south-1 ssm describe-parameters \
        --parameter-filters "Key=Path,Values=$PARAM_PATH" \
        --no-paginate | jq -r '.Parameters | map(.Name) | join(" ")' \
  ) | jq -r ".Parameters | map(\"\(.Name[$n:])=\(.Value|tostring)\") | .[]" > env.dkr

docker run --net=host --rm --name docxrun --env-file env.dkr \
    556055615522.dkr.ecr.ap-southeast-1.amazonaws.com/documentden-gh-bot:$1
