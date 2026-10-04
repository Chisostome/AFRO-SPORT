#!/bin/bash
set -euo pipefail

APP_ID="com.chisostome.afrosport"
APP_NAME="AFRO SPORT"
VERSION="${APP_VERSION:-1.0.0}"
BUILD="${APP_BUILD_NUMBER:-1}"
LOGO="docs/assets/afro-sport-logo.jpg"
ASSET_DIR="ios/App/App/Assets.xcassets/AppIcon.appiconset"
PLIST="ios/App/App/Info.plist"

if [[ ! -f "$LOGO" ]]; then
  echo "Missing $LOGO"
  exit 1
fi

rm -rf "$ASSET_DIR"
mkdir -p "$ASSET_DIR"

sips -s format png "$LOGO" --out /tmp/afro-sport-icon-source.png >/dev/null
sips -z 1024 1024 /tmp/afro-sport-icon-source.png --out "$ASSET_DIR/AppIcon-1024.png" >/dev/null

make_icon() {
  local px="$1"
  local name="$2"
  sips -z "$px" "$px" /tmp/afro-sport-icon-source.png --out "$ASSET_DIR/$name" >/dev/null
}

make_icon 40 AppIcon-20@2x.png
make_icon 60 AppIcon-20@3x.png
make_icon 58 AppIcon-29@2x.png
make_icon 87 AppIcon-29@3x.png
make_icon 80 AppIcon-40@2x.png
make_icon 120 AppIcon-40@3x.png
make_icon 120 AppIcon-60@2x.png
make_icon 180 AppIcon-60@3x.png
make_icon 76 AppIcon-76.png
make_icon 152 AppIcon-76@2x.png
make_icon 167 AppIcon-83.5@2x.png

cat > "$ASSET_DIR/Contents.json" <<'JSON'
{
  "images": [
    {"filename":"AppIcon-20@2x.png","idiom":"iphone","scale":"2x","size":"20x20"},
    {"filename":"AppIcon-20@3x.png","idiom":"iphone","scale":"3x","size":"20x20"},
    {"filename":"AppIcon-29@2x.png","idiom":"iphone","scale":"2x","size":"29x29"},
    {"filename":"AppIcon-29@3x.png","idiom":"iphone","scale":"3x","size":"29x29"},
    {"filename":"AppIcon-40@2x.png","idiom":"iphone","scale":"2x","size":"40x40"},
    {"filename":"AppIcon-40@3x.png","idiom":"iphone","scale":"3x","size":"40x40"},
    {"filename":"AppIcon-60@2x.png","idiom":"iphone","scale":"2x","size":"60x60"},
    {"filename":"AppIcon-60@3x.png","idiom":"iphone","scale":"3x","size":"60x60"},
    {"filename":"AppIcon-20@2x.png","idiom":"ipad","scale":"2x","size":"20x20"},
    {"filename":"AppIcon-29@2x.png","idiom":"ipad","scale":"2x","size":"29x29"},
    {"filename":"AppIcon-40@2x.png","idiom":"ipad","scale":"2x","size":"40x40"},
    {"filename":"AppIcon-76.png","idiom":"ipad","scale":"1x","size":"76x76"},
    {"filename":"AppIcon-76@2x.png","idiom":"ipad","scale":"2x","size":"76x76"},
    {"filename":"AppIcon-83.5@2x.png","idiom":"ipad","scale":"2x","size":"83.5x83.5"},
    {"filename":"AppIcon-1024.png","idiom":"ios-marketing","scale":"1x","size":"1024x1024"}
  ],
  "info": {"author":"xcode","version":1}
}
JSON

/usr/libexec/PlistBuddy -c "Set :CFBundleDisplayName $APP_NAME" "$PLIST" || /usr/libexec/PlistBuddy -c "Add :CFBundleDisplayName string $APP_NAME" "$PLIST"
/usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString $VERSION" "$PLIST" || /usr/libexec/PlistBuddy -c "Add :CFBundleShortVersionString string $VERSION" "$PLIST"
/usr/libexec/PlistBuddy -c "Set :CFBundleVersion $BUILD" "$PLIST" || /usr/libexec/PlistBuddy -c "Add :CFBundleVersion string $BUILD" "$PLIST"
/usr/libexec/PlistBuddy -c "Set :CFBundleIdentifier $APP_ID" "$PLIST" || /usr/libexec/PlistBuddy -c "Add :CFBundleIdentifier string $APP_ID" "$PLIST"
/usr/libexec/PlistBuddy -c "Set :CFBundleIconName AppIcon" "$PLIST" || /usr/libexec/PlistBuddy -c "Add :CFBundleIconName string AppIcon" "$PLIST"
/usr/libexec/PlistBuddy -c "Set :ITSAppUsesNonExemptEncryption false" "$PLIST" || /usr/libexec/PlistBuddy -c "Add :ITSAppUsesNonExemptEncryption bool false" "$PLIST"
/usr/libexec/PlistBuddy -c "Set :UIDesignRequiresCompatibility true" "$PLIST" || /usr/libexec/PlistBuddy -c "Add :UIDesignRequiresCompatibility bool true" "$PLIST"

echo "Prepared iOS release: $APP_NAME $VERSION ($BUILD) — $APP_ID"
