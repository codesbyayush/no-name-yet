#!/bin/bash

# Kill all development servers for OmniFeedback project
# Ports: 8080 (server), 3000 (widget), 3001 (web)

echo "🔪 Killing all OmniFeedback development servers..."

# Function to kill process on a specific port
kill_port() {
    local port=$1
    local service_name=$2
    
    pids=$(lsof -ti:$port 2>/dev/null)
    if [ -n "$pids" ]; then
        echo "  Killing $service_name on port $port (PIDs: $pids)"
        echo $pids | xargs kill -9 2>/dev/null
    else
        echo "  No process found on port $port ($service_name)"
    fi
}

# Kill each service
kill_port 8080 "Server"
kill_port 3000 "Widget"
kill_port 3001 "Web"

echo ""
echo "✅ All servers terminated!"
echo ""
echo "To restart services:"
echo "  Server:  cd apps/server && bun run dev"
echo "  Widget:  cd apps/widget && bun run dev"
echo "  Web:     cd apps/web && bun run dev"