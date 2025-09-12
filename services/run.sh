#!/bin/bash
# Detect docker compose command (v2) or fallback to docker-compose (v1)
detect_docker_compose_cmd() {
  if command -v docker >/dev/null 2>&1; then
    # Check if 'docker compose' works
    if docker compose version >/dev/null 2>&1; then
      echo "docker compose"
      return
    fi
  fi
  # Fallback to docker-compose if installed
  if command -v docker-compose >/dev/null 2>&1; then
    echo "docker-compose"
    return
  fi
  echo "Error: Neither 'docker compose' nor 'docker-compose' command found." >&2
  exit 1
}

DOCKER_COMPOSE_CMD=$(detect_docker_compose_cmd)

LOCK_FILE="/tmp/up_microservices.lock"
rm -f "$LOCK_FILE"

open_terminal_right() {
    tilix --action=session-add-right --command "$1"
}

open_terminal_down() {
    tilix --action=session-add-down --command "$1"
}

RABBIT_MQ_PATH="./"
API_SERVICE_PATH="./api-service"
NOTIFICATIONS_SERVICE_PATH="./notification-service"

echo "Using Docker Compose command: $DOCKER_COMPOSE_CMD"

echo "Starting RABBIT MQ..."
tilix --command "bash -c 'cd $RABBIT_MQ_PATH && $DOCKER_COMPOSE_CMD up -d; touch $LOCK_FILE; exit;'" --new-process

sleep 3

echo "Waiting for RABBIT MQ to be ready..."
while [ ! -f "$LOCK_FILE" ]; do
    sleep 2
done
echo "RABBIT MQ is ready!"

echo "Starting API_SERVICE, NOTIFICATIONS_SERVICE..."
open_terminal_down "bash -c 'cd $API_SERVICE_PATH && $DOCKER_COMPOSE_CMD up; exec bash'"
open_terminal_right "bash -c 'cd $NOTIFICATIONS_SERVICE_PATH && $DOCKER_COMPOSE_CMD up; exec bash'"

echo "All services have been started."
