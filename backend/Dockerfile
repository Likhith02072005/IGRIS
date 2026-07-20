FROM node:20-bookworm-slim

# Install PostgreSQL client, server, and clean up logs
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql \
    postgresql-contrib \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency configs
COPY package.json package-lock.json* ./

RUN npm install

# Copy source code and database configurations
COPY . .

# Generate Prisma Client
RUN npm run prisma:generate

# Build typescript source
RUN npm run build

# Make start.sh executable
RUN chmod +x start.sh

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["./start.sh"]
