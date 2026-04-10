# ---- Build Stage ----
# Use the latest Node.js image as the base for the build stage.
FROM node:latest AS builder

# Set the working directory inside the container.
WORKDIR /app

# Copy package.json and package-lock.json to the working directory.
COPY package*.json ./

# Install all dependencies using npm (clean install ensures no unnecessary packages).
RUN npm ci

# Copy the entire source code into the container's working directory.
COPY . .

# Build the application. The build output will be stored in the ".output" directory.
RUN npm run build

# ---- Production Stage ----
# Use the latest Node.js image as the base for the production stage.
FROM node:latest

# Set the working directory inside the container.
WORKDIR /app

# Copy the built application and related package files from the build stage.
COPY --from=builder /app/.output /app/.output
COPY --from=builder /app/package*.json ./

# Start the application using Node.js.
CMD ["node", ".output/server/index.mjs"]