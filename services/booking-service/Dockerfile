# Use the official Node.js 14 image as a base image
FROM node:20.15

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3002

# Start the application
CMD ["npm", "run", "start:dev"]
