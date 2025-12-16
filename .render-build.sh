#!/usr/bin/env bash
set -e

echo "==> Current directory: $(pwd)"
echo "==> Listing root directory:"
ls -la

echo "==> Changing to frontend directory..."
cd frontend

echo "==> Now in: $(pwd)"
echo "==> Listing frontend directory:"
ls -la

echo "==> Installing dependencies..."
npm install

echo "==> Building application..."
npm run build

echo "==> Build complete!"
