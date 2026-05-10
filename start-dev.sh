#!/bin/bash
echo "🚀 Starting Farewell 2024-26 Dev Servers..."

# Backend
echo "📦 Starting backend on :5000..."
cd backend && npm install && npm run dev &

# Frontend
echo "🎨 Starting frontend on :3000..."
cd ../frontend && npm install && npm run dev &

wait
