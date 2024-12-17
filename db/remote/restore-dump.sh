#!/usr/bin/env zsh

set -e

DIR=$( cd -P -- "$(dirname -- "$(command -v -- "$0")")" && pwd -P )
ls $DIR/data/dump.sql > /dev/null

docker exec -i ts-db psql -U postgres template1 < $DIR/sql/pre-restore.sql
docker exec -i ts-db psql -U postgres dbmaster < $DIR/data/dump.sql
docker exec -i ts-db psql -U postgres dbmaster < $DIR/sql/post-restore.sql

blitz prisma migrate deploy

# TODO: It looks like this is broken. Need to do a clean test later(TM)…
# SEED_USER_ONLY=1 blitz db seed
