#!/bin/sh
set -e

# Start backend
echo "Starting Backend API..."
cd /app/backend
npm run start &
BACKEND_PID=$!

# Start NGINX
echo "Starting NGINX..."
nginx -g 'daemon off;' &
NGINX_PID=$!

# Wait for both processes
wait $BACKEND_PID
wait $NGINX_PID
