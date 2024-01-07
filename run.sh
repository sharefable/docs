#!/bin/bash

# Parameter store's secrets must be written in hierarchy `/project/branch/secret_name`
PARAM_PATH=/documentden/gh-bot/prod
n=`expr ${#PARAM_PATH} + 1`

docker pull 556055615522.dkr.ecr.ap-southeast-1.amazonaws.com/documentden-gh-bot:latest

aws --region=ap-south-1 ssm get-parameters --names \
  $(aws --region=ap-south-1 ssm describe-parameters \
        --parameter-filters "Key=Path,Values=$PARAM_PATH" \
        --no-paginate | jq -r '.Parameters | map(.Name) | join(" ")' \
  ) | jq -r ".Parameters | map(\"\(.Name[$n:])=\(.Value|tostring)\") | .[]" > env.dkr

docker run --net=host --rm --name docxrun --env env.dkr \
    556055615522.dkr.ecr.ap-southeast-1.amazonaws.com/documentden-gh-bot:latest
