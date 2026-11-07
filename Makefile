.DEFAULT_GOAL := help
GOLANGCI := go run github.com/golangci/golangci-lint/v2/cmd/golangci-lint@latest

.PHONY: help install dev dev-api dev-web build build-api build-web test test-api test-web lint lint-api lint-web fmt

help: ## Show available targets
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

install: ## Install backend and frontend dependencies
	cd backend && go mod download
	cd frontend && pnpm install

dev: ## Run API (live reload) and web dev server together
	@$(MAKE) -j2 dev-api dev-web

dev-api: ## Run the Go API with live reload on :8080
	cd backend && go tool air

dev-web: ## Run the Vite dev server on :5173 (proxies /api to :8080)
	cd frontend && pnpm dev

build: build-api build-web ## Build both apps

build-api: ## Build the API binary into backend/bin/server
	cd backend && go build -trimpath -o bin/server ./cmd/server

build-web: ## Type-check and build the frontend into frontend/dist
	cd frontend && pnpm build

test: test-api test-web ## Run all tests

test-api: ## Run Go tests with the race detector
	cd backend && go test -race ./...

test-web: ## Run Vitest
	cd frontend && pnpm test

lint: lint-api lint-web ## Lint everything

lint-api: ## golangci-lint + go vet
	cd backend && go vet ./... && $(GOLANGCI) run ./...

lint-web: ## oxlint + TypeScript + Prettier check
	cd frontend && pnpm lint && pnpm typecheck && pnpm format:check

fmt: ## Format Go and TS sources
	cd backend && $(GOLANGCI) fmt ./...
	cd frontend && pnpm format
