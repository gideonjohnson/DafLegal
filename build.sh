#!/bin/bash
set -e

# Build script for Render deployment
# This handles being run from root or frontend directory

if [ -d "frontend" ]; then
  echo "==> Running from root directory"
  cd frontend
elif [ -f "package.json" ]; then
  echo "==> Already in frontend directory"
else
  echo "==> ERROR: Cannot find frontend directory or package.json"
  exit 1
fi

echo "==> Installing dependencies..."
npm ci

echo "==> Building application..."
npm run build

echo "==> Build completed successfully!"
