# node 20 with yarn + npm + puppeteer 21.7.0 version
FROM ghcr.io/puppeteer/puppeteer:21.7.0

USER root

WORKDIR /usr/src/app

ENV PUPPETEER_DOWNLOAD_BASE_URL=https://storage.googleapis.com/chrome-for-testing-public
RUN npm install -g puppeteer@21.7.0

COPY package.json package.json
COPY yarn.lock yarn.lock
COPY packages/fs-ser/package.json packages/fs-ser/package.json
COPY packages/common/package.json packages/common/package.json
COPY packages/cli/package.json packages/cli/package.json
COPY packages/github-bot/package.json packages/github-bot/package.json

RUN yarn

COPY . .

RUN cd packages/common  && yarn build
RUN cd packages/fs-ser  && yarn build
RUN cd packages/cli  && yarn build && npm link
RUN cd packages/github-bot && yarn build

# # ENV NODE_ENV="production"

CMD ["./start-gh-bot.sh", "start" ]
