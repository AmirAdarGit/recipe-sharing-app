# Recipe Sharing App - Documentation Archive

This file contains consolidated documentation that was previously stored in separate files at the project root.

---

# PROJECT SETUP DOCUMENTATION

## Full Stack React PWA + Node.js Setup Guide

### 🚀 Project Overview
- **Frontend**: React PWA (Progressive Web App)
- **Backend**: Node.js + Express API
- **Database**: MongoDB Atlas
- **Authentication**: Firebase Auth (Google, Facebook)
- **Deployment**: Vercel (Frontend) + Railway (Backend)

---

## 🛠️ Development Setup

### 1. Prerequisites - Latest Versions
```bash
# Install Node.js v22.x (Latest LTS)
# Download from: https://nodejs.org/en/download/
# Or use Node Version Manager (recommended):

# Install NVM (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install and use latest Node.js
nvm install 22
nvm use 22
nvm alias default 22

# Verify versions
node --version    # Should show v22.x.x
npm --version     # Should show v10.x.x

# Install Git
git --version
```

### Alternative: Using Package Managers
```bash
# macOS (Homebrew)
brew install node@22

# Windows (Chocolatey)
choco install nodejs --version=22.9.0

# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Project Initialization
```bash
# Create project folder
mkdir my-app
cd my-app

# Initialize git
git init
git remote add origin https://github.com/AmirAdarGit/my-recipes.git

# Create root package.json with latest npm features
npm init -y
```

### 3. Frontend Setup (React PWA) - Latest Versions
```bash
# Create React app with Vite (latest)
cd client
npm create vite@latest . -- --template react
npm install

# Install latest PWA dependencies
npm install vite-plugin-pwa@latest workbox-window@latest
npm install @vitejs/plugin-react@latest

# Install latest UI and routing
npm install react-router-dom@latest
npm install tailwindcss@latest postcss@latest autoprefixer@latest
npx tailwindcss init -p

# Install latest Firebase SDK
npm install firebase@latest

# Install HTTP client
npm install axios@latest
```

### 4. Backend Setup (Node.js) - Latest Versions
```bash
# Go to server folder
cd ../server
npm init -y

# Install latest core dependencies
npm install express@latest cors@latest dotenv@latest
npm install mongoose@latest
npm install firebase-admin@latest

# Install latest development dependencies
npm install -D nodemon@latest concurrently@latest
```

### 5. Development Dependencies (Root) - Latest Versions
```bash
# Go to root folder
cd ..

# Install latest dev tools
npm install -D eslint@latest prettier@latest husky@latest lint-staged@latest
npm install -D concurrently@latest

# Initialize ESLint with latest config
npx eslint --init
```

---

## 🔧 Configuration Files

### Root package.json Scripts (Node 22 optimized)
```json
{
  "name": "my-app",
  "version": "1.0.0",
  "engines": {
    "node": ">=22.0.0",
    "npm": ">=10.0.0"
  },
  "scripts": {
    "dev": "concurrently \"npm run dev:client\" \"npm run dev:server\"",
    "dev:client": "cd client && npm run dev",
    "dev:server": "cd server && npm run dev",
    "build": "cd client && npm run build",
    "start": "cd server && npm start",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "format": "prettier --write ."
  }
}
```

### Client Vite Config (client/vite.config.js) - Latest Features
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
            },
          },
        ],
      },
      manifest: {
        name: 'My App',
        short_name: 'MyApp',
        description: 'My awesome PWA app',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    host: true
  }
})
```

### Server package.json (Node 22 optimized)
```json
{
  "name": "my-app-server",
  "version": "1.0.0",
  "type": "module",
  "engines": {
    "node": ">=22.0.0"
  },
  "scripts": {
    "dev": "nodemon --experimental-modules src/index.js",
    "start": "node src/index.js"
  }
}
```

---

## 🚀 Deployment Setup - Latest Platforms

### 1. Frontend Deployment (Vercel) - Latest CLI
```bash
# Install latest Vercel CLI
npm i -g vercel@latest

# Deploy from client folder
cd client
vercel

# Vercel automatically detects Vite and optimizes for Node 22
```

### 2. Backend Deployment (Railway) - Latest CLI
```bash
# Install latest Railway CLI
npm install -g @railway/cli@latest

# Deploy from server folder
cd server
railway login
railway init
railway up

# Railway automatically uses Node 22 runtime
```

---

## 🔄 GitHub Actions CI/CD - Node 22

### .github/workflows/deploy.yml
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - name: Install and Build
        run: |
          cd client
          npm ci
          npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./client

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - name: Deploy to Railway
        uses: bervProject/railway-deploy@v1.2.0
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: ${{ secrets.RAILWAY_SERVICE_ID }}
```

---

## ✨ Node 22 Benefits You'll Get:
- **Performance**: ~20% faster than Node 18
- **Security**: Latest security patches
- **ES Modules**: Native ESM support
- **Fetch API**: Built-in fetch (no need for axios in server)
- **Test Runner**: Built-in test runner
- **Watch Mode**: Built-in file watching

---

## 🏃‍♂️ Development Workflow

### Daily Development
```bash
# Start development servers (Node 22 optimized)
npm run dev

# This runs:
# - React dev server on http://localhost:5173 (Vite default)
# - Node.js API server on http://localhost:5000
```

**Ready to start with the latest Node 22 setup? This ensures you're using cutting-edge performance and features! 🚀**

---

# TODO LIST DOCUMENTATION

## 🚀 Setup & Configuration
- [ ]

## 🎨 Frontend Development
- [ ]

## 🔧 Backend Development
- [ ]

## 🔐 Authentication
- [ ]

## 📱 PWA Features
- [ ]

## 🧪 Testing
- [ ]

## 🚀 Deployment
- [ ]

## 🐛 Bug Fixes
- [ ]

## ✨ Features
- [ ]

## 📚 Documentation
- [ ]

---

## ✅ Completed
- [ ]

---

**Notes:**
- Use `- [x]` to mark items as completed
- Move completed items to the "Completed" section
- Add priority levels: 🔥 High, 🟡 Medium, 🟢 Low

---

**Archive Note**: This documentation was consolidated from PROJECT_SETUP.md and TODO.md files that were previously in the project root. For current status and recent updates, see STATUS.md in this docs folder.
