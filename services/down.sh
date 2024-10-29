#!/bin/bash

echo "Stopping Docker Compose files..."

# Stop each Docker Compose file in sequence and remove orphans

echo "Stopping api gateway docker-compose.yml..."
docker-compose -f ./api-gateway/docker-compose.yml down --remove-orphans

echo "Stopping user service docker-compose.yml..."
docker-compose -f ./user-service/docker-compose.yml down --remove-orphans

echo "Stopping notification service docker-compose.yml..."
docker-compose -f ./notification-service/docker-compose.yml down --remove-orphans

echo "Stopping services docker-compose.yml..."
docker-compose -f docker-compose.yml down --remove-orphans

echo "All Docker Compose files are stopped."


# Close all open Tilix terminal windows
echo "Closing all Tilix terminal windows..."
killall tilix
echo "All Tilix terminals have been closed."