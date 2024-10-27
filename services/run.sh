  #!/bin/bash

  echo "Starting Docker Compose files..."

  # Start the first Docker Compose file and show its output
  echo "Starting services docker-compose.yml..."
  docker-compose -f docker-compose.yml up -d &

  echo "Starting api gateway docker-compose.yml..."
  docker-compose -f ./api-gateway/docker-compose.yml up &

  echo "Starting user service docker-compose.yml..."
  docker-compose -f ./user-service/docker-compose.yml up &


  echo "Starting notification service docker-compose.yml..."
  docker-compose -f ./notification-service/docker-compose.yml up &


  # Wait for all background jobs to complete
  wait

  echo "All Docker Compose files are running."