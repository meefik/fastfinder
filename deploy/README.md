# Prepare and run image

## Build image

```sh
docker build -f deploy/Dockerfile -t public.ecr.aws/<id>/<name> .
```

## Push image to AWS repository

```sh
aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws/<id>
docker push public.ecr.aws/<id>/<name>
```

See [AWS CLI Quick setup](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-quickstart.html)

## Run container

```sh
docker volume create cache
docker run -d --name parser --restart always --cap-add=SYS_ADMIN \
  --tmpfs /tmp \
  -p 8080:8080 \
  -e "API_KEY=secret" \
  public.ecr.aws/<id>/<name>
```
