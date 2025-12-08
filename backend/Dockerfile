# Simple Dockerfile for backend
FROM golang:1.25-alpine AS builder

WORKDIR /app
COPY . .

# Download dependencies
RUN go mod download

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/RIP/main.go

# Runtime stage
FROM alpine:latest

WORKDIR /root/

# Copy binary from builder
COPY --from=builder /app/main .

# Expose port 8090
EXPOSE 8090

# Run the application
CMD ["./main"]
