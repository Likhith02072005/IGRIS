FROM node:20-alpine

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

EXPOSE 5000

CMD ["npm", "start"]
