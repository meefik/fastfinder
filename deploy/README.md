# Prepare and run image

## Build image

```sh
docker build --no-cache -f deploy/Dockerfile -t ghcr.io/meefik/fastfinder:latest .
```

## Push image to GutHub Packages registry

```sh
docker login ghcr.io -u USERNAME
docker push ghcr.io/meefik/fastfinder:latest
```

See [Working with the Container registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)

## Run container

```sh
docker run -d --name fastfinder --restart always --cap-add=SYS_ADMIN \
  --tmpfs /tmp \
  -p 8443:443 \
  -p 8080:80 \
  -e "PORT=8443" \
  -e "HTTP_PORT=8080" \
  -e "SESSION_KEY=secret" \
  -e "MONGO_URI=mongodb://admin:secret@localhost:27017/fastfinder?authSource=admin" \
  -e "SSL_KEY=-----BEGIN RSA PRIVATE KEY-----\n..." \
  -e "SSL_CERT=-----BEGIN CERTIFICATE-----\n..." \
  ghcr.io/meefik/fastfinder:latest
```
