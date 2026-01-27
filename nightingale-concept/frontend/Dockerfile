# -------------------------
# 1. Build stage
# -------------------------
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy only package files first for better caching
COPY package.json ./

# Install dependencies
RUN pnpm install

# Copy the rest of the project
COPY . .

# Build the Vite app
RUN pnpm build


# -------------------------
# 2. Production stage
# -------------------------
FROM nginx:stable-alpine AS production

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
