#!/bin/bash

# Script pour tagger et pousser des images Docker vers dockregistry.xju.fr

# Vérifier si l'image est fournie
if [ $# -lt 1 ]; then
  echo "Usage: $0 <image-name> [tag]"
  echo "Example: $0 baby-check-api latest"
  exit 1
fi

IMAGE_NAME=$1
TAG=${2:-latest}  # Utiliser 'latest' comme tag par défaut si non spécifié

# Configuration de la registry
REGISTRY="dockregistry.xju.fr"

# Construire le nom complet de l'image
FULL_IMAGE_NAME="$REGISTRY/$IMAGE_NAME:$TAG"

echo "Tagging image $IMAGE_NAME:$TAG as $FULL_IMAGE_NAME..."
docker tag "$IMAGE_NAME:$TAG" "$FULL_IMAGE_NAME"

echo "Pushing image $FULL_IMAGE_NAME to registry..."
docker push "$FULL_IMAGE_NAME"

echo "Image successfully pushed to $REGISTRY"
