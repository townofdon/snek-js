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

log "\n📦 compiling production webpack build..."
npm run build -- --env package

log "\n🔨 compiling native executable binaries..."
npm run nwbuild
