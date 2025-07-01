#!/bin/bash

PROJECT_NAME=${1:-"myproject"}
IMAGE_PREFIX="$PROJECT_NAME"
POSTGRES_VOLUME="${PROJECT_NAME}_postgres-data"
NETWORK_NAME="${PROJECT_NAME}-net"
DOCKER_COMPOSE_FILE="Docker/docker-compose.yml"

check_env_files() {
    local env=$1
    if [ "$env" == "development" ]; then
        if [ ! -f .env.development ]; then
            echo "❌ Error: .env.development file not found! Please create this file."
            exit 1
        fi
    elif [ "$env" == "qa" ]; then
        if [ ! -f .env.qa ]; then
            echo "❌ Error: .env.qa file not found! Please create this file."
            exit 1
        fi
    elif [ "$env" == "production" ]; then
        if [ ! -f .env.production ]; then
            echo "❌ Error: .env.production file not found! Please create this file."
            exit 1
        fi
    fi

    # Check if docker-compose file exists
    if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
        echo "❌ Error: $DOCKER_COMPOSE_FILE file not found! Please create this file."
        exit 1
    fi
}

# Function to clean up containers, images, volumes, and network
cleanup() {
    local env=$1
    echo "🧹 Starting cleanup process for $PROJECT_NAME ($env environment)..."

    # Stop and remove containers based on environment
    if [ "$env" == "development" ]; then
        docker postgres_container client server >/dev/null || true
        docker rm postgres_container client server >/dev/null || true
    elif [ "$env" == "qa" ]; then
        docker stop qa-client qa-server qa-nginx 2>/dev/null || true
        docker rm qa-client qa-server qa-nginx 2>/dev/null || true
    elif [ "$env" == "production" ]; then
        docker stop prod-client prod-server nginx-prod 2>/dev/null || true
        docker rm prod-client prod-server nginx-prod 2>/dev/null || true
    fi

    echo "✅ Cleanup complete for $env environment."
}

# Function for complete teardown - stops all containers and removes all resources
complete_teardown() {
    echo "💥 Performing complete teardown for $PROJECT_NAME..."
    
    echo "🛑 Stopping all containers..."
    docker compose -f $DOCKER_COMPOSE_FILE down -v --remove-orphans
    
    echo "🗑️ Removing any remaining containers..."
    docker rm -f $(docker ps -a -q --filter name=${PROJECT_NAME}) 2>/dev/null || true

    echo "📦 Removing project images..."
    docker rmi $(docker images -q --filter "reference=${IMAGE_PREFIX}*") 2>/dev/null || true

    echo "🧊 Removing project volumes..."
    docker volume rm $(docker volume ls -q --filter name=${PROJECT_NAME}) 2>/dev/null || true

    echo "🌐 Removing project networks..."
    docker network rm $NETWORK_NAME 2>/dev/null || true
    docker network rm ${PROJECT_NAME}_prod-net 2>/dev/null || true
    docker network rm ${PROJECT_NAME}_qa-net 2>/dev/null || true
    docker network rm ${PROJECT_NAME}_queue-net 2>/dev/null || true

    echo "✅ Complete teardown finished. All containers, images, volumes, and networks for $PROJECT_NAME have been removed."
}

# Function to start services
start_services() {
    local env=$1
    local services=$2
    local build_options=$3

    echo "🚀 Starting services in $env environment..."
    
    if [ -n "$build_options" ]; then
        docker compose -f $DOCKER_COMPOSE_FILE --profile $env up $build_options $services
    else
        if [ "$env" == "development" ]; then
            # For development, we typically want to see logs
            docker compose -f $DOCKER_COMPOSE_FILE --profile $env up $services
        else
            # For QA and production, run in detached mode
            docker compose -f $DOCKER_COMPOSE_FILE --profile $env up -d $services
        fi
    fi
}

# Interactive menu function
show_menu() {
    echo "🌍 Select Environment:"
    echo "1) 🛠️ Development"
    echo "2) 🧪 QA"
    echo "3) 🚢 Production"
    echo "4) 🔥 Complete Teardown (all environments)"
    echo "5) ❌ Exit"
    read -p "Choice [1-5]: " env_choice

    case $env_choice in
    1) ENV="development" ;;
    2) ENV="qa" ;;
    3) ENV="production" ;;
    4) 
        complete_teardown
        exit 0
        ;;
    5) exit 0 ;;
    *)
        echo "⚠️ Invalid choice"
        return 1
        ;;
    esac

    check_env_files $ENV

    echo "🧩 Select Service:"
    echo "1) 🔄 All (Clean start)"
    echo "2) 🖥️ Server only"
    echo "3) 🌐 Client only"
    echo "4) 🔗 Server & Client"
    if [ "$ENV" != "development" ]; then
        echo "5) 🌐 Nginx only"
    fi
    echo "6) 🔙 Back"
    echo "7) ❌ Exit"
    read -p "Choice [1-7]: " service_choice

    return 0
}

# Main script logic
if [ $# -eq 0 ]; then
    echo "ℹ️  Usage: ./docker-manager.sh <project_name>"
    echo "⚠️  No project name provided, using default: $PROJECT_NAME"
fi

while true; do
    show_menu
    [ $? -eq 1 ] && continue

    # Adjust container names based on environment
    if [ "$ENV" == "development" ]; then
        SERVER="server"
        CLIENT="client"
    elif [ "$ENV" == "qa" ]; then
        SERVER="qa-server"
        CLIENT="qa-client"
        NGINX="qa-nginx"
    elif [ "$ENV" == "production" ]; then
        SERVER="prod-server"
        CLIENT="prod-client"
        NGINX="nginx-prod"
    fi

    case $service_choice in
    1)
        cleanup $ENV
        start_services $ENV "" "--build --force-recreate"
        ;;
    2) start_services $ENV "$SERVER" ;;
    3) start_services $ENV "$CLIENT" ;;
    4) start_services $ENV "$SERVER $CLIENT" ;;
    5)
        if [ "$ENV" != "development" ]; then
            start_services $ENV "$NGINX"
        else
            echo "⚠️ Invalid choice for development environment"
            continue
        fi
        ;;
    6) continue ;;
    7) exit 0 ;;
    *) 
        echo "⚠️ Invalid choice" 
        continue
        ;;
    esac
    break
done