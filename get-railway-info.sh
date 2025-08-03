#!/bin/bash

echo "🚂 Getting Railway project information..."
echo ""

cd server

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "Installing Railway CLI..."
    npm install -g @railway/cli@latest
fi

echo "Please make sure you're logged into Railway CLI first:"
echo "Run: railway login"
echo ""

# Check if user is logged in
if railway whoami &> /dev/null; then
    echo "✅ You are logged into Railway CLI"
    echo ""
    
    echo "📋 Your Railway projects:"
    echo "========================"
    railway projects
    echo ""
    
    echo "🔧 To get your service ID:"
    echo "1. Run: railway link"
    echo "2. Select your project and service"
    echo "3. The service ID will be shown or you can run: railway status"
    echo ""
    echo "📝 Add these to your GitHub repository secrets:"
    echo "RAILWAY_TOKEN: [Your token from Railway dashboard]"
    echo "RAILWAY_SERVICE_ID: [Your service ID from railway link/status]"
else
    echo "❌ You are not logged into Railway CLI"
    echo ""
    echo "Please run the following commands:"
    echo "1. railway login"
    echo "2. railway link (to link your project)"
    echo "3. railway status (to see your service ID)"
    echo ""
    echo "Then add these to your GitHub repository secrets:"
    echo "RAILWAY_TOKEN: [Your token from Railway dashboard]"
    echo "RAILWAY_SERVICE_ID: [Your service ID from railway status]"
fi
