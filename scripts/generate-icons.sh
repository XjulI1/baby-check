#!/bin/bash

# Script pour générer automatiquement toutes les icônes et splash screens
# nécessaires pour une PWA et pour l'installation sur iOS

# Vérifier si le chemin de l'image source est fourni
if [ $# -lt 1 ]; then
  echo "Usage: $0 <chemin-vers-image-source> [couleur-fond]"
  echo "Example: $0 ../logo.png '#FFFFFF'"
  exit 1
fi

SOURCE_IMAGE=$1
BG_COLOR=${2:-"#FFFFFF"}

# Créer le répertoire de sortie s'il n'existe pas
ICONS_DIR="../public/icons"
mkdir -p $ICONS_DIR

# Vérifier si ImageMagick est installé
if ! command -v magick &> /dev/null; then
  echo "ImageMagick n'est pas installé. Installation en cours..."
  if [[ "$OSTYPE" == "darwin"* ]]; then
    brew install imagemagick
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    sudo apt-get install -y imagemagick
  else
    echo "Système non reconnu. Veuillez installer ImageMagick manuellement."
    exit 1
  fi
fi

echo "Génération des icônes PWA..."

# Tailles d'icônes standard pour PWA
SIZES=("72x72" "96x96" "128x128" "144x144" "152x152" "192x192" "384x384" "512x512")

for size in "${SIZES[@]}"; do
  echo "Génération de l'icône $size..."
  
  magick "$SOURCE_IMAGE" \
    -background "$BG_COLOR" \
    -gravity center \
    -resize "$size" \
    -extent "$size" \
    "$ICONS_DIR/icon-$size.png"
done

echo "Génération des icônes Apple Touch..."

# Tailles pour les icônes iOS
APPLE_SIZES=("120x120" "152x152" "167x167" "180x180")

for size in "${APPLE_SIZES[@]}"; do
  echo "Génération de l'icône Apple $size..."
  
  magick "$SOURCE_IMAGE" \
    -background "$BG_COLOR" \
    -gravity center \
    -resize "$size" \
    -extent "$size" \
    "$ICONS_DIR/apple-touch-icon-$size.png"
done

echo "Génération des splash screens iOS..."

# Configurations pour les splash screens iOS (taille x hauteur)
SPLASH_CONFIGS=(
  "2048x2732"  # iPad Pro 12.9"
  "1668x2388"  # iPad Pro 11"
  "1536x2048"  # iPad Air/Mini
  "1125x2436"  # iPhone X/XS/11 Pro
  "1242x2688"  # iPhone XS Max/11 Pro Max
  "828x1792"   # iPhone XR/11
  "750x1334"   # iPhone 8/7/6s/6
  "640x1136"   # iPhone SE/5s/5
)

# Créer une image splash simple avec le logo centré
create_splash() {
  local width=$1
  local height=$2
  local logo_size=$((width < height ? width / 3 : height / 3))
  
  echo "Génération du splash screen ${width}x${height}..."
  
  # Créer l'image splash avec le logo centré en une seule commande
  magick -size "${width}x${height}" "xc:${BG_COLOR}" \
    \( "$SOURCE_IMAGE" -resize "${logo_size}" \) \
    -gravity center -composite \
    "$ICONS_DIR/apple-splash-${width}x${height}.png"
}

for config in "${SPLASH_CONFIGS[@]}"; do
  width=${config%x*}
  height=${config#*x}
  create_splash $width $height
done

echo "Génération des icônes et splash screens terminée avec succès!"
echo "Tous les fichiers ont été sauvegardés dans $ICONS_DIR"
