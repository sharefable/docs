#!/bin/bash

[ -f .env ] && mv .env .env.bkp

if [[ -z "${WEBHOOK_PROXY_URL}" ]]; then
  echo "WEBHOOK_PROXY_URL is not set"
  exit 1
fi

if [[ -z "${APP_ID}" ]]; then
  echo "APP_ID is not set"
  exit 1
fi

if [[ -z "${PRIVATE_KEY}" ]]; then
  echo "PRIVATE_KEY is not set"
  exit 1
fi

if [[ -z "${WEBHOOK_SECRET}" ]]; then
  echo "WEBHOOK_SECRET is not set"
  exit 1
fi

if [[ -z "${GITHUB_CLIENT_ID}" ]]; then
  echo "GITHUB_CLIENT_ID is not set"
  exit 1
fi

if [[ -z "${GITHUB_CLIENT_SECRET}" ]]; then
  echo "GITHUB_CLIENT_SECRET is not set"
  exit 1
fi


cat >packages/github-bot/.env <<!EOF
WEBHOOK_PROXY_URL=${WEBHOOK_PROXY_URL}
APP_ID=${APP_ID}
PRIVATE_KEY="${PRIVATE_KEY}"
WEBHOOK_SECRET=${WEBHOOK_SECRET}
GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID}
GITHUB_CLIENT_SECRET=${GITHUB_CLIENT_SECRET}
!EOF

cd packages/github-bot
yarn start