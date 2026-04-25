#!/bin/bash

source "./_utils.sh"

#
# ARGS
#
CLEANUP=true

BUILD_DIR="../dist-prod"
TEMP_ARCHIVE_DIR="../archives"
VERSION=$(parseVersion "../package.json")
assertVarExists $VERSION

info "WELCOME TO THE PACKAGE SCRIPT!"
info "VERSION=${YELLOW}${VERSION}"

# Synchronize package.json versions
jq ".version = \"$VERSION\"" ../public/package.json > package.json.tmp && mv package.json.tmp ../public/package.json
PKG_VERSION=$(parseVersion "../public/package.json")
assertEqual $VERSION $PKG_VERSION "Version mismatch in package.json vs public/package.json."

info "\n✨ compiling production webpack build..."
npm run build -- --env package

info "\n📦 compiling native executable binaries..."
cd ..
rm -rf ./bundle
mkdir -p ./bundle/osx-arm64
mkdir -p ./bundle/osx-x64
mkdir -p ./bundle/win-x64
mkdir -p ./bundle/linux-x64

log "\nbundling osx-arm64"
./node_modules/.bin/nwbuild --mode=build --version=stable --glob=false --flavor=normal --platform=osx --arch=arm64 ./dist-prod
mv ./out/* ./bundle/osx-arm64/
mv ./bundle/osx-arm64/snek.app ./bundle/osx-arm64/snek-osx-arm64.app

log "\nbundling osx-x64"
./node_modules/.bin/nwbuild --mode=build --version=stable --glob=false --flavor=normal --platform=osx --arch=x64 ./dist-prod
mv ./out/* ./bundle/osx-x64/
mv ./bundle/osx-x64/snek.app ./bundle/osx-x64/snek-osx-x64.app

log "\nbundling win-x64"
./node_modules/.bin/nwbuild --mode=build --version=stable --glob=false --flavor=normal --platform=win --arch=x64 ./dist-prod
mv ./out/* ./bundle/win-x64/

log "\nbundling linux-x64"
./node_modules/.bin/nwbuild --mode=build --version=stable --glob=false --flavor=normal --platform=linux --arch=x64 ./dist-prod
mv ./out/* ./bundle/linux-x64/

rm -rf ./out

success "All done!"
