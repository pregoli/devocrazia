# Getting Started with Docker Containers

Docker has revolutionized how we develop, ship, and run applications. This guide will help you understand the fundamentals and get started with containerization.

## What is Docker?

Docker is a platform that uses OS-level virtualization to deliver software in packages called containers. Containers are isolated from one another and bundle their own software, libraries, and configuration files.

### Why Use Docker?

- **Consistency**: "It works on my machine" becomes a thing of the past
- **Isolation**: Applications run in isolated environments
- **Portability**: Run anywhere Docker is supported
- **Efficiency**: Lightweight compared to virtual machines

## Installing Docker

First, install Docker Desktop for your operating system:

```bash
# Verify installation
docker --version

# Test with hello-world
docker run hello-world
```

## Your First Dockerfile

A Dockerfile is a text document that contains instructions for building a Docker image.

```dockerfile
# Use an official Node.js runtime as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

## Building and Running

Build your image:

```bash
docker build -t my-app:1.0 .
```

Run a container from your image:

```bash
docker run -p 3000:3000 my-app:1.0
```

## Docker Compose

For multi-container applications, Docker Compose is essential:

```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - db
  db:
    image: postgres:14
    environment:
      POSTGRES_PASSWORD: example
```

> **Important**: Never commit sensitive information like passwords to your Dockerfile or docker-compose.yml. Use environment variables or secrets management.

## Common Docker Commands

```bash
# List running containers
docker ps

# List all containers
docker ps -a

# Stop a container
docker stop <container-id>

# Remove a container
docker rm <container-id>

# List images
docker images

# Remove an image
docker rmi <image-id>
```

## Best Practices

1. **Use official base images** when possible
2. **Keep images small** by using alpine variants
3. **Use .dockerignore** to exclude unnecessary files
4. **Run as non-root user** for security
5. **Use multi-stage builds** for production

## Conclusion

Docker simplifies deployment and ensures consistency across different environments. Start by containerizing a simple application and gradually adopt more advanced features as you become comfortable with the basics.
