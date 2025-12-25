FROM ollama/ollama:latest

# Expose Ollama API port
EXPOSE 11434

# Copy startup script
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Use startup script that pulls model and starts service
CMD ["/start.sh"]

