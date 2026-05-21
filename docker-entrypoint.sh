#!/bin/sh
set -e

# Extrair host e porta da DATABASE_URL se possível
# postgresql://user:password@host:port/dbname
DB_HOST=$(echo $DATABASE_URL | sed -e 's|.*@||' -e 's|:.*||' -e 's|/.*||')
DB_PORT=$(echo $DATABASE_URL | sed -e 's|.*:||' -e 's|/.*||')
[ -z "$DB_PORT" ] && DB_PORT=5432

echo "Waiting for PostgreSQL at $DB_HOST:$DB_PORT..."
until nc -z "$DB_HOST" "$DB_PORT"; do
  echo "Database is unavailable - sleeping..."
  sleep 2
done
echo "PostgreSQL is up!"

# Run migrations and start backend
echo "Running Database Migrations..."
cd /app/backend
npm run migrate || echo "Migrations failed, continuing anyway for debugging..."

echo "Starting Backend API..."
npm run start &
BACKEND_PID=$!

# Ensure temporary directories for NGINX exist
mkdir -p /tmp/nginx_client_body /tmp/nginx_proxy /tmp/nginx_fastcgi /tmp/nginx_uwsgi /tmp/nginx_scgi

# Start NGINX with explicit error log to stdout/stderr and no daemon
echo "Starting NGINX..."
nginx -e /dev/stderr -g 'daemon off; pid /tmp/nginx.pid;' &
NGINX_PID=$!

# Wait for both processes
wait $BACKEND_PID
wait $NGINX_PID
