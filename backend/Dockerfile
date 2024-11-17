# Use an official Node runtime as the base image
FROM node:18

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies and NestJS CLI globally
RUN npm install && npm install -g @nestjs/cli

# Copy the rest of the application code to the working directory
COPY . .

# Expose port 3000
EXPOSE 3000

# The command to run the application will be specified in docker-compose
CMD ["npm", "run", "start:dev"]