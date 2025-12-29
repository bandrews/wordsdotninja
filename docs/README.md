# Nutrimatic Modern Architecture

This project rearchitects Nutrimatic from a CGI-based system to a modern backend service with a responsive frontend.

## Architecture Overview

### Current System (Legacy)
- **Frontend**: Basic HTML with inline CSS served via CGI
- **Backend**: Python CGI script that shells out to C++ `find-expr` binary
- **Limitations**: Not responsive, poor mobile experience, hard to deploy, security concerns

### New Architecture
- **Backend Service**: FastAPI-based REST service wrapping the C++ core
- **Frontend**: React-based responsive Progressive Web App
- **Benefits**: Modern UI/UX, mobile-first, easy deployment, future-ready for integrations

## Components

### Backend Service (`/api`)
- **Technology**: Python FastAPI with async support
- **Features**:
  - REST API for search functionality
  - Streaming responses for infinite scroll
  - Proper error handling and logging
  - Resource limit management
  - Health checks and monitoring endpoints
  - Docker containerization

### Frontend App (`/frontend`)
- **Technology**: React with Material-UI design system
- **Features**:
  - Responsive, mobile-first design
  - Infinite scroll for results
  - Improved frequency visualization
  - Integrated help and pattern examples
  - Progressive Web App capabilities
  - Offline caching for repeated searches

### C++ Core (Unchanged)
- The existing C++ `find-expr` binary and related tools remain unchanged
- Backend service wraps these tools via subprocess calls
- Maintains compatibility with existing index files

## API Endpoints

### Search
- `GET /api/search?q={query}&limit={limit}&offset={offset}` - Search with pagination
- `GET /api/search/stream?q={query}` - Streaming search for infinite scroll

### Metadata
- `GET /api/health` - Service health check
- `GET /api/syntax` - Pattern syntax reference
- `GET /api/examples` - Example queries and explanations

## Deployment

### Development
```bash
# Backend
cd api
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend  
cd frontend
npm install
npm start
```

### Production
```bash
# Using Docker Compose
docker-compose up -d
```

## Migration from CGI

The new system maintains full compatibility with existing queries and index files. The C++ binaries remain unchanged, only the web interface has been modernized.

## Future Integrations

The new architecture makes it easy to add:
- Discord bot integration
- Slack app
- Mobile applications
- Third-party API integrations 