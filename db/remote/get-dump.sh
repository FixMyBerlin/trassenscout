#!/usr/bin/env bash

set -e

. ./.env.local
if ! [ -v DATABASE_URL_REMOTE ]; then
  echo '$DATABASE_URL_REMOTE is not set.'
  exit 1
fi

DIR=$( cd -P -- "$(dirname -- "$(command -v -- "$0")")" && pwd -P )
pg_dump $DATABASE_URL_REMOTE | grep -vE 'rdsadmin;|dbmasteruser;' > $DIR/data/dump.sql
ls -l $DIR/data/dump.sql
