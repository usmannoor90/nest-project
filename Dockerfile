# Dockerfile
FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source code
COPY . .

# Build the application
RUN npm run build

# Expose the port your app runs on
EXPOSE 8000

# Command to run the application
CMD ["npm", "run", "start:prod"]