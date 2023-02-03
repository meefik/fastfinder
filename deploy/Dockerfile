FROM alpine:latest

ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium-browser"

RUN apk add --no-cache chromium
RUN addgroup --system appuser && adduser --home /home/appuser --system --disabled-password appuser

COPY --chmod=0755 ./dist/server.bin /usr/local/bin/server.bin

USER appuser
WORKDIR /home/appuser

EXPOSE 3000

CMD ["/usr/local/bin/server.bin"]
