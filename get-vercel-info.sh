#!/bin/bash

echo "🔍 Getting Vercel project information..."
echo ""

cd client

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

echo "Linking project to get IDs..."
vercel link

if [ -f ".vercel/project.json" ]; then
    echo ""
    echo "📋 Your Vercel project information:"
    echo "=================================="
    
    PROJECT_ID=$(cat .vercel/project.json | grep -o '"projectId":"[^"]*"' | cut -d'"' -f4)
    ORG_ID=$(cat .vercel/project.json | grep -o '"orgId":"[^"]*"' | cut -d'"' -f4)
    
    echo "PROJECT_ID: $PROJECT_ID"
    echo "ORG_ID: $ORG_ID"
    echo ""
    echo "🔧 Add these to your GitHub repository secrets:"
    echo "VERCEL_TOKEN: [Your token from Vercel dashboard]"
    echo "PROJECT_ID: $PROJECT_ID"
    echo "ORG_ID: $ORG_ID"
else
    echo "❌ Failed to link project. Please check your Vercel authentication."
fi
