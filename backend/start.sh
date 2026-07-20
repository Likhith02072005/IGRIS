#!/bin/bash
set -e

echo "Starting local PostgreSQL server inside container..."

# Ensure directory permissions
mkdir -p /var/run/postgresql
chown -R postgres:postgres /var/run/postgresql

# Initialize database if not already done
if [ ! -d "/var/lib/postgresql/data/base" ]; then
    echo "Initializing database cluster..."
    chown -R postgres:postgres /var/lib/postgresql/data
    su postgres -c "pg_ctl initdb -D /var/lib/postgresql/data"
    
    # Configure postgres to allow local connections
    echo "host all all 127.0.0.1/32 trust" >> /var/lib/postgresql/data/pg_hba.conf
    echo "host all all ::1/128 trust" >> /var/lib/postgresql/data/pg_hba.conf
fi

# Start Postgres in the background
su postgres -c "pg_ctl start -D /var/lib/postgresql/data -o '-p 5432' -l /tmp/postgres.log"

# Wait for Postgres to accept connections
echo "Waiting for PostgreSQL to start..."
until su postgres -c "pg_isready -p 5432" > /dev/null 2>&1; do
  sleep 1
done
echo "PostgreSQL started successfully!"

# Create role and database if they do not exist
echo "Setting up database role and tables..."
su postgres -c "psql -d postgres -c \"CREATE ROLE postgres WITH SUPERUSER LOGIN PASSWORD 'postgres';\"" 2>/dev/null || true
su postgres -c "psql -d postgres -c \"CREATE DATABASE astra_quant;\"" 2>/dev/null || true

# Run Prisma schema push and seeding
echo "Running Prisma migrations and seeding database..."
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/astra_quant?schema=public" npx prisma db push --schema=../database/prisma/schema.prisma --accept-data-loss
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/astra_quant?schema=public" npx ts-node src/seed.ts

echo "Starting Express backend server on port $PORT..."
# Bind the application port
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/astra_quant?schema=public" PORT=$PORT node dist/server.js
