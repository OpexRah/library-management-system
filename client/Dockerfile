# Stage 1: Build the app
FROM node:18-bullseye-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy built static files to NGINX default location
COPY --from=builder /app/dist /usr/share/nginx/html

# Optional: Replace default NGINX config to handle React routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
