FROM alpine:latest

RUN apk add --no-cache chromium
#RUN addgroup --system appuser && adduser --home /home/appuser --system --disabled-password appuser
#USER appuser
#WORKDIR /home/appuser

EXPOSE 9222

# List of Chromium Command Line Switches
# https://peter.sh/experiments/chromium-command-line-switches/
CMD ["/usr/bin/chromium-browser", \
  "--disable-default-apps", \
  "--disable-dev-shm-usage", \
  "--disable-extensions", \
  "--disable-gpu", \
  "--disable-prompt-on-repost", \
  "--disable-sync", \
  "--disable-translate", \
  "--headless", \
  "--metrics-recording-only", \
  "--mute-audio", \
  "--no-default-browser-check", \
  "--no-first-run", \
  "--no-sandbox", \
	"--safebrowsing-disable-auto-update", \
	"--ignore-certificate-errors", \
	"--ignore-ssl-errors", \
	"--ignore-certificate-errors-spki-list", \
	"--user-data-dir=/tmp", \
	"--remote-debugging-port=9222", \
	"--remote-debugging-address=0.0.0.0"]
