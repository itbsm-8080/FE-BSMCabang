#!/bin/bash

TAG="$1"
set -e

if [ -z "$TAG" ]; then
	echo "Please provide Tag name"
	exit 1;
fi

echo "--------------- Building docker image -------------"
docker build -t sakai_nuxt:$TAG .
