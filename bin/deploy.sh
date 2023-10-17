#!/bin/bash

source "./_utils.sh"


#
# ARGS
#
CLEANUP=false
VERSION=$(parseVersion)
assertVarExists $VERSION

#
# POPULATE VARS
#
USERNAME=$(readEnvVar ITCHIO_USERNAME)
GAME=$(readEnvVar ITCHIO_GAME)
CHANNEL=$(readEnvVar ITCHIO_CHANNEL)
IS_MAC_OS=$(readEnvVar IS_MAC_OS)
assertVarExists $USERNAME
assertVarExists $GAME
assertVarExists $CHANNEL
assertVarExists $IS_MAC_OS

SAFE_VERSION="${VERSION//./$'-'}"
ROOT_DIR=$PWD
BUILD_DIR="../dist-prod"
TEMP_ARCHIVE_DIR="../archives"
ZIPFILE="$TEMP_ARCHIVE_DIR/build-${SAFE_VERSION}.zip"

assertFileExists "${BUILD_DIR}/index.html"

#
# SCRIPT
#
info "WELCOME TO THE ITCHIO DEPLOYMENT SCRIPT!"
info "USER=${YELLOW}${USERNAME}"
info "GAME=${YELLOW}${GAME}"
info "About to push version ${RED}${VERSION}${CYAN} - proceed?"
prompt "(y/n)"

mkdir -p $TEMP_ARCHIVE_DIR

# zip
if $IS_MAC_OS
then
  # apparently mac zip cannot add files from a parent or sibling directory
  cd ../
  BUILD_DIR="./dist-prod"
  TEMP_ARCHIVE_DIR="./archives"
  ZIPFILE="$TEMP_ARCHIVE_DIR/build-${SAFE_VERSION}.zip"
  assertFileExists "${BUILD_DIR}/index.html"
  log "creating zip archive for ${ZIPFILE} from ${BUILD_DIR}..."
  zip -rq $ZIPFILE $BUILD_DIR
  assertFileExists $ZIPFILE
else
  log "creating zip archive for ${ZIPFILE}..."
  7z a $ZIPFILE $BUILD_DIR > ./NUL
  assertFileExists $ZIPFILE
fi

log "deploying to itch.io..."

# push to itch.io
butler push $ZIPFILE "${USERNAME}/${GAME}:${CHANNEL}" --userversion $VERSION

# cleanup
rm -rf "./NUL"
rm -rf "../NUL"
if $CLEANUP; then
  rm -rf $TEMP_ARCHIVE_DIR
fi

cd $ROOT_DIR
success "All done!"
