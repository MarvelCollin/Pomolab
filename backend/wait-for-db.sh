#!/bin/bash
# wait-for-db.sh

set -e

host="$1"
port="$2"
shift 2
cmd="$@"

until PGPASSWORD=$DB_PASSWORD psql -h "$host" -p "$port" -U "$DB_USERNAME" -d "$DB_DATABASE" -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - executing command"
exec $cmd