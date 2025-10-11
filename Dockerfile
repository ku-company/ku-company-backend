FROM node:23

# Set working directory
WORKDIR /app

# Copy package files first (to use build cache)
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the source code
COPY . .

# Generate Prisma client BEFORE building TypeScript
RUN npx prisma generate

# Build the TypeScript code
RUN npm run build

# Expose the API port
EXPOSE 8000

# Start app (development mode)
CMD ["npm", "run", "dev"]