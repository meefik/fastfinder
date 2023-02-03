FROM node:18-alpine

ENV PORT=8080
ENV API_KEY="secret"
ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium-browser"

#ARG DEBIAN_FRONTEND=noninteractive
#RUN apt update && apt install chromium -y --no-install-recommends && apt clean
#RUN groupadd -r appuser && useradd -r -g appuser -d /home/appuser appuser

RUN apk add --no-cache chromium
RUN addgroup --system appuser && adduser --home /home/appuser --system --disabled-password appuser

USER appuser
WORKDIR /home/appuser
COPY ["./src", "./package.json", "./package-lock.json", "/home/appuser/"]
RUN npm ci --only=production

EXPOSE 8080

CMD ["node", "server.js"]
