.PHONY: install build start dev clean test lint format docker-build docker-run docker-compose help

# Default target
all: help

# Install dependencies
install:
	@echo "Installing dependencies..."
	npm install

# Build the project
build:
	@echo "Building project..."
	npm run build

# Start the server
start:
	@echo "Starting MCP server..."
	npm start

# Run in development mode with hot reloading
dev:
	@echo "Starting in development mode..."
	npm run dev

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf dist
	rm -rf node_modules

# Run tests
test:
	@echo "Running tests..."
	npm test

# Run linter
lint:
	@echo "Running linter..."
	npm run lint

# Format code
format:
	@echo "Formatting code..."
	npm run format

# Build Docker image
docker-build:
	@echo "Building Docker image..."
	docker build -t mcp/atlassian .

# Run Docker container
docker-run:
	@echo "Running Docker container..."
	docker run -it --rm --env-file .env mcp/atlassian

# Run with Docker Compose
docker-compose:
	@echo "Running with Docker Compose..."
	docker-compose up -d

# Display help information
help:
	@echo "MCP Atlassian Makefile"
	@echo ""
	@echo "Usage:"
	@echo "  make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  install        Install dependencies"
	@echo "  build          Build the project"
	@echo "  start          Start the MCP server"
	@echo "  dev            Start in development mode with hot reloading"
	@echo "  clean          Clean build artifacts"
	@echo "  test           Run tests"
	@echo "  lint           Run linter"
	@echo "  format         Format code"
	@echo "  docker-build   Build Docker image"
	@echo "  docker-run     Run Docker container"
	@echo "  docker-compose Run with Docker Compose"
	@echo "  help           Display this help message" 