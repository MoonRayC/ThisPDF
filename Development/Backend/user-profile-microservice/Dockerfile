# Use official Node.js LTS image
FROM node:22

# Set working directory inside container
WORKDIR /app

# Copy dependency manifests first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the service port
EXPOSE 3002

# Start the app
CMD ["sh", "-c", "node server.js"]
