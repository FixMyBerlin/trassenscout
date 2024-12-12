#!/usr/bin/env zsh

set -e

usage() { echo "Usage: get-dump.sh [-s]" 1>&2; exit 1; }

while getopts 'sh' OPTION; do
  case "$OPTION" in
    s) USE_STAGING=1 ;;
    h) usage ;;
    ?) usage ;;
  esac
done

. ./.env.local
if [ $USE_STAGING ]; then
  if ! [ -v DATABASE_URL_STAGING ]; then
    echo 'DATABASE_URL_STAGING is not set.'
    exit 1
  else
    DATABASE_URL=$DATABASE_URL_STAGING
    echo "Getting dump from staging database..."
  fi
else
  if ! [ -v DATABASE_URL_PRODUCTION ]; then
    echo 'DATABASE_URL_PRODUCTION is not set.'
    exit 1
  else
    DATABASE_URL=$DATABASE_URL_PRODUCTION
    echo "Getting dump from production database..."
  fi
fi

DIR=$( cd -P -- "$(dirname -- "$(command -v -- "$0")")" && pwd -P )

docker run -it --rm --entrypoint pg_dump postgres $DATABASE_URL | grep -vE 'rdsadmin;|dbmasteruser;' > $DIR/data/dump.sql

# Show first 5 lines
head -n 5 $DIR/data/dump.sql
ls -l $DIR/data/dump.sql
