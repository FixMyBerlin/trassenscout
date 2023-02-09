#!/usr/bin/env zsh

set -e

DIR=$( cd -P -- "$(dirname -- "$(command -v -- "$0")")" && pwd -P )
ls $DIR/data/dump.sql > /dev/null

alias psql="docker exec -i rsv-builder-db psql -U postgres"
psql template1 < $DIR/sql/pre-restore.sql
psql postgres < $DIR/data/dump.sql
psql postgres < $DIR/sql/post-restore.sql
blitz prisma migrate deploy
