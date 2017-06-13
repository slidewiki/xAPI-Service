#!/bin/bash

docker login -u="$DOCKER_USERNAME" -p="$DOCKER_PASSWORD"
docker build -t slidewiki/xapiservice ./
docker push slidewiki/xapiservice:latest-dev
