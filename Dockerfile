# Build Stage
FROM node:20-alpine as build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . ./
RUN npm run build

# Production Serving Stage
FROM nginx:alpine
# Copy our custom Nginx config for React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy the built React app from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Cloud Run defaults to port 8080
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
