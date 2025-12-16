#!/usr/bin/env bash
set -e

echo "==> Starting application..."
echo "==> Current directory: $(pwd)"

cd frontend

echo "==> Now in: $(pwd)"
echo "==> Starting Next.js..."
npm start
