# Prepare images and run containers

## Build and push images

### Build all images for YC

```sh
docker compose build --pull
```

### Build the specified image for YC

```sh
docker compose build --pull <service>
```

### Login to GutHub Packages registry

```sh
docker login ghcr.io -u <USERNAME>
```

See [Working with the Container registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)

### Push images to GutHub Packages registry

```sh
docker push ghcr.io/meefik/<NAME>:latest
```

## Run and stop containers

### Create and run containers

```sh
DOMAIN_NAME=fastfinder.autos
SESSION_KEY=secret
MONGO_SECRET=secret

docker compose up -d --no-build
```

All environment variables can be saved to an `.env` file.

### Stop and remove containers

```sh
docker compose down
```
