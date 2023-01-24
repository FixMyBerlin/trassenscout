#!/usr/bin/env sh

set -e

DIR=$( cd -P -- "$(dirname -- "$(command -v -- "$0")")" && pwd -P )
ls $DIR/data/dump.sql > /dev/null
docker exec -i rsv-builder-db psql -U postgres template1 < $DIR/sql/pre-restore.sql
docker exec -i rsv-builder-db psql -U postgres postgres < $DIR/data/dump.sql
docker exec -i rsv-builder-db psql -U postgres postgres < $DIR/sql/post-restore.sql
blitz prisma migrate deploy
