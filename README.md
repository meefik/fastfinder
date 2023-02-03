# fastfinder

Auto parts search engine.

## How to run the server

```sh
export PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium"
npm start
```

## How to build for production

```sh
npm run build
```

## Run tests

```sh
export PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium"
npm test
```

## Build Docker image

```sh
docker build --no-cache -f deploy/Dockerfile -t fastfinder .
```

## Run in Docker

```sh
docker run -d --name fastfinder --network host --cap-add=SYS_ADMIN \
  --tmpfs /tmp \
  -e "SESSION_KEY=secret" \
  fastfinder
```
