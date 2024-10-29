#!/bin/bash
# Define a temporary lock file to indicate when 'make up' is complete
LOCK_FILE="/tmp/up_microservices.lock"

# Ensure the lock file does not already exist
rm -f "$LOCK_FILE"

# Function to open a new terminal session in the same Tilix window
open_terminal_right() {
    tilix --action=session-add-right --command "$1"
}

open_terminal_down() {
    tilix --action=session-add-down --command "$1"
}

# Define paths for each service
RABBIT_MQ_PATH="./"
API_GATEWAY_PATH="./api-gateway"
USERS_SERVICE_PATH="./user-service"
NOTIFICATIONS_SERVICE_PATH="./notification-service"

# Start RABBIT MQ in detached mode
echo "Starting RABBIT MQ..."


tilix --command "bash -c 'cd $RABBIT_MQ_PATH && docker-compose up -d; touch $LOCK_FILE; exit;'" --new-process

# Wait 3 seconds

sleep 3
# Wait until RABBIT_MQ is healthy
echo "Waiting for RABBIT MQ to be ready..."
while [ ! -f "$LOCK_FILE" ]; do
    sleep 2  # Poll every 2 seconds
done
echo "RABBIT MQ is ready!"

# Start API_GATEWAY, USERS_SERVICE, and NOTIFICATIONS_SERVICE in separate Tillix terminals
echo "Starting API_GATEWAY, USERS_SERVICE, and NOTIFICATIONS_SERVICE..."

open_terminal_down "bash -c 'cd $API_GATEWAY_PATH && docker-compose up; exec bash'"
open_terminal_right "bash -c 'cd $USERS_SERVICE_PATH && docker-compose up; exec bash'"
open_terminal_down "bash -c 'cd $NOTIFICATIONS_SERVICE_PATH && docker-compose up; exec bash'"

echo "All services have been started."
