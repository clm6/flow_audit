#!/bin/bash
set -e

# Start Ollama in the background
ollama serve &
OLLAMA_PID=$!

# Wait for Ollama to be ready
echo "Waiting for Ollama to start..."
for i in {1..30}; do
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo "Ollama is ready!"
        break
    fi
    sleep 1
done

# Pull the model (default: llama3.2, can be overridden with OLLAMA_MODEL env var)
MODEL=${OLLAMA_MODEL:-llama3.2}
echo "Pulling model: $MODEL"
ollama pull $MODEL || echo "Warning: Model pull failed, but continuing..."

# Keep Ollama running
wait $OLLAMA_PID

