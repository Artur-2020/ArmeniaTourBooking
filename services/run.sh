#!/bin/bash

echo "Starting Docker Compose files..."

# Start the first Docker Compose file and show its output
echo "Starting services docker-compose.yml..."
docker-compose -f docker-compose.yml up &

# Start the second Docker Compose file and show its output
echo "Starting api gateway docker-compose.yml..."
docker-compose -f ./api-gateway/docker-compose2.yml up &

# Start the third Docker Compose file and show its output
echo "Starting docker-compose3.yml..."
docker-compose -f docker-compose3.yml up &

# Wait for all background jobs to complete
wait

echo "All Docker Compose files are running."