# CLAUDE.md - Recipe Sharing App Context

This file provides comprehensive context for AI assistance on the Recipe Sharing App project.

## 📋 Project Overview

**Recipe Sharing App** is a full-stack Progressive Web Application (PWA) for sharing and discovering recipes. Built with modern technologies and deployed to production with CI/CD automation.

### Purpose

- Allow users to create, share, and discover recipes
- Provide offline-capable PWA experience
- Support social features like favorites, collections, and user profiles
- Scale to handle thousands of users with proper authentication and performance optimization

### Current Status: ✅ FOUNDATION PHASE COMPLETE

- ✅ Development environment working
- ✅ Production deployment operational
- ✅ CI/CD pipeline configured
- ✅ API connectivity established
- 📝 Ready for core feature development

## 🏗️ Architecture

### Tech Stack

```
Frontend: React 19 + Vite 7 + Tailwind CSS + PWA
Backend:  Node.js 22 + Express 5 + MongoDB Atlas
Auth:     Firebase Auth (planned)
Deploy:   Vercel (Frontend) + Railway (Backend)
CI/CD:    GitHub Actions
```

### Project Structure

```
├── client/          # React PWA frontend
│   ├── src/
│   │   ├── App.jsx           # Main app component
│   │   ├── config/api.js     # API configuration
│   │   └── ...
│   ├── vite.config.js        # Vite + PWA config
│   └── package.json          # Frontend dependencies
├── server/          # Node.js Express backend  
│   ├── src/
│   │   └── index.js          # Main server file
│   └── package.json          # Backend dependencies
├── docs/            # Documentation
│   ├── STATUS.md             # Current status
│   ├── ROADMAP.md            # Feature planning
│   ├── ARCHIVE.md            # Setup documentation
│   └── CLAUDE.md             # This file
└── package.json     # Root workspace config
```

## 🔗 URLs & Environments

### Production

- **Frontend**: https://recipe-sharing-mmgidbsx1-amir-adars-projects.vercel.app/
- **Backend**: https://recipe-sharing-app-production.up.railway.app
- **Health Check**: https://recipe-sharing-app-production.up.railway.app/api/health

### Development

- **Frontend**: http://localhost:5173 (Vite dev server)
- **Backend**: http://localhost:5000 (Express server)
- **Health Check**: http://localhost:5000/api/health

## ⚡ Quick Commands

### Development Workflow

```bash
# Start development (from root)
npm run dev                    # Starts both client and server

# Individual services
cd client && npm run dev       # Frontend only
cd server && npm run dev       # Backend only

# Build for production
cd client && npm run build     # Build frontend
```

### Key Files to Know

- `client/src/config/api.js` - API URL configuration with environment detection
- `client/vite.config.js` - PWA and build configuration
- `server/src/index.js` - Main server entry point
- `docs/ROADMAP.md` - Comprehensive feature planning
- `docs/STATUS.md` - Current deployment status

## 🎯 Current Development Context

### Phase: Core Feature Development

The foundation is complete. Next priorities according to roadmap:

1. **Recipe Management** (Phase 1 - MVP)

   - Recipe CRUD operations
   - Image upload and storage
   - Basic browsing and search
2. **Authentication Integration**

   - Firebase Auth setup
   - User profiles and protected routes
3. **PWA Features**

   - Offline functionality
   - Push notifications
   - App installation

### Key Considerations

- **Modern Dependencies**: Using latest versions (React 19, Node 22, Express 5)
- **PWA Ready**: Service worker and manifest configured
- **API Design**: RESTful endpoints with proper error handling
- **Environment Config**: Automatic environment detection for API URLs
- **CI/CD**: Automated testing and deployment on push to main

## 🛠️ Development Guidelines

### Code Style

- ES modules everywhere (`type: "module"`)
- React functional components with hooks
- Tailwind CSS for styling
- Axios for HTTP requests
- Express with modern async/await patterns

### Environment Variables

- Development: Use .env.local files (gitignored)
- Production: Set via deployment platform UI
- API URLs: Handled automatically in `client/src/config/api.js`

### Testing Strategy (Planned)

- Frontend: Jest + React Testing Library
- Backend: Jest + Supertest
- E2E: Playwright or Cypress
- Coverage: 95%+ target

## 📚 Documentation Structure

- **README.md**: Quick start and overview
- **docs/STATUS.md**: Real-time deployment status
- **docs/ROADMAP.md**: Detailed feature planning with timelines
- **docs/ARCHIVE.md**: Historical setup documentation
- **docs/CLAUDE.md**: This context file

## 🔍 Debugging & Health Checks

### API Health Check

```bash
# Test backend health
curl https://recipe-sharing-app-production.up.railway.app/api/health
# Should return: {"status":"OK","message":"Server is healthy!"}
```

### Common Issues

- **CORS**: Already configured in server/src/index.js
- **Environment Variables**: Check .env files and deployment settings
- **API Connectivity**: Verify URLs in client/src/config/api.js

## 🚀 Next Steps

Based on the roadmap, immediate development priorities:

1. **Database Schema**: Design MongoDB collections for recipes, users
2. **API Endpoints**: Implement recipe CRUD operations
3. **Frontend Components**: Recipe creation, listing, and detail views
4. **Authentication**: Firebase Auth integration
5. **Testing**: Establish testing framework and write initial tests

## 🤖 AI Assistant Guidelines

When helping with this project:

1. **Check Current Status**: Always refer to docs/STATUS.md for latest deployment info
2. **Follow Roadmap**: Use docs/ROADMAP.md for feature prioritization
3. **Maintain Architecture**: Keep frontend/backend separation clean
4. **Modern Practices**: Leverage Node 22 and React 19 features
5. **PWA First**: Consider offline functionality in all features
6. **Test Coverage**: Write tests for new functionality
7. **Documentation**: Update relevant docs when making changes

### Common Tasks

- Adding API endpoints: Update server/src/index.js and add route files
- New React components: Follow existing patterns in client/src/
- Environment config: Use existing .env pattern and API config
- Deployment: Push to main triggers automatic CI/CD

---

**Last Updated**: August 3, 2025
**Project Phase**: Foundation Complete → Core Development
**Key Focus**: Recipe management features and user authentication
