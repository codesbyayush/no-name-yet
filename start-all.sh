#!/bin/bash

# Start all OmniFeedback development servers
# Usage: ./start-all.sh

echo "🚀 Starting all OmniFeedback development servers..."
echo ""

# Kill any existing processes on our ports
echo "🔪 Cleaning up existing processes..."
lsof -ti:8080 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

echo "✅ Ports cleared"
echo ""

# Function to start a service in the background
start_service() {
    local service_name=$1
    local port=$2
    local directory=$3
    local command=$4
    
    echo "🔧 Starting $service_name on port $port..."
    cd "$directory" && $command &
    local pid=$!
    echo "   PID: $pid"
    cd - > /dev/null
    
    # Give it a moment to start
    sleep 2
}

# Start services
echo "📦 Building widget first..."
cd apps/widget && bun run build
cd - > /dev/null

echo ""
echo "🌐 Starting services..."

# Start API Server (port 8080)
start_service "API Server" 8080 "apps/server" "bun run dev"

# Start Widget Server (port 3000)
start_service "Widget Server" 3000 "apps/widget" "bun run dev"

# Start Web App (port 3001)
start_service "Web App" 3001 "apps/web" "bun run dev"

echo ""
echo "🎉 All services are starting up!"
echo ""
echo "📊 Service URLs:"
echo "   API Server:    http://localhost:8080"
echo "   Widget Server: http://localhost:3000"
echo "   Web App:       http://localhost:3001"
echo ""
echo "🧪 Test the widget integration:"
echo "   1. Open http://localhost:3001 in your browser"
echo "   2. Look for the feedback button in bottom-right corner"
echo "   3. Test bug reporting and suggestions"
echo "   4. Check the dashboard for widget status"
echo ""
echo "⚠️  To stop all servers, run: ./kill-servers.sh"
echo ""
echo "📝 Logs will appear below:"
echo "=================================="

# Wait for all background processes
wait