# Nutrimatic Rearchitecture TODO

## Phase 1: Analysis and Planning
- [x] Analyze current CGI-based system in cgi_scripts/cgi-search.py
- [x] Understand C++ backend structure and dependencies 
- [x] Review usage documentation and pattern syntax
- [x] Design new architecture with backend service and frontend
- [x] Choose technology stack for backend service
- [x] Choose UI framework and design system for frontend

## Phase 2: Backend Service Development
- [x] Create Python/FastAPI backend service to replace CGI
- [x] Implement REST API endpoints for search functionality
- [x] Add streaming support for infinite scroll
- [x] Handle resource limits and timeouts properly
- [x] Add proper error handling and logging
- [x] Create Docker container for easy deployment

## Phase 3: Frontend Development  
- [x] Set up React application with responsive design
- [x] Implement beautiful, mobile-first UI
- [x] Add infinite scroll for search results
- [x] Improve frequency/score visualization 
- [x] Create integrated help and quick reference
- [x] Make it a Progressive Web App (PWA)
- [x] Add comprehensive pattern examples and tutorials

## Phase 4: Production-Ready Improvements
- [x] Remove help content from API endpoints and embed in frontend
- [x] Create unified nginx reverse proxy configuration  
- [x] Fix React API URL to use relative paths (/api) instead of env vars
- [x] Create production-ready docker-compose configuration
- [x] Set up unified port structure (frontend at /, API at /api)
- [x] Add development workflow with hot-reloading support
- [x] Create C++ build instructions and artifact placement docs

## Phase 5: Bug Resolution and Enhancements
- [x] Review and resolve all issues identified in bugs.md
- [x] Implement comprehensive export functionality (copy/download)
- [x] Add user-friendly notifications for export actions
- [x] Maintain responsive design consistency
- [x] Enhance help documentation with beginner-friendly explanations
- [x] Add categorized syntax reference with expandable details
- [x] Create step-by-step tutorial for newcomers
- [x] Organize examples by difficulty level

## Phase 6: C++ Docker Build Integration
- [x] Create a Dockerfile for building the C++ `find-expr` binary.
- [x] Add a `builder` service to `docker-compose.yml` that uses the new Dockerfile.
- [x] Configure the `builder` service to output the `find-expr` binary to the shared `./bin` directory.
- [x] Make the `api` service in `docker-compose.yml` depend on the `builder` service.
- [x] Update `README.md` to reflect the new Docker-based C++ build process.

## Phase 7: Testing and Bug Fixes
- [x] Fix index file path issue (can't open "/data/merged.index")
- [x] Implement multiple dictionary support (wikipedia.index and 12dicts.index)
- [x] Add dictionary selection dropdown to frontend
- [x] Fix HelpPanel vertical overflow issue
- [x] Optimize docker-compose health check timing
- [x] Test complete system end-to-end
- [x] Validate all functionality works correctly

## Phase 8: UI Cleanup and Modernization (Current)
- [x] Implement dynamic layout (landing page vs header mode)
- [x] Create compact header design with reduced spacing
- [x] Replace HelpPanel with focused QuickReference component
- [x] Remove bulky example chips and optimize search interface
- [x] Redesign results with dot-based frequency gauge
- [x] Remove ordinals and implement hover-only copy icons
- [x] Tighten spacing throughout application
- [x] Optimize for experienced users with memory-jogging quick reference
- [ ] Test new UI across different devices and browsers
- [ ] Gather user feedback on improved interface

## Phase 9: MCP Server Implementation (Current)
- [x] Implement MCP server as HTTP endpoint in existing FastAPI application
- [x] Create nutrimatic_search tool that filters results with score >= 1.0
- [x] Include comprehensive pattern syntax documentation in tool manifest
- [x] Add MCP server endpoints (/mcp/manifest, /mcp/tools/call)
- [x] Test MCP server with AI agents like Claude
- [x] Document how to use the MCP server from AI agents
- [x] Update API documentation to include MCP endpoints

## Phase 10: Integration and Testing
- [ ] Connect frontend to backend API
- [ ] Test on various devices and screen sizes
- [ ] Performance testing and optimization
- [ ] Create deployment documentation
- [ ] Add monitoring and health checks

## Phase 11: Documentation and Deployment
- [ ] Update documentation for new architecture
- [ ] Create deployment guides for various platforms
- [ ] Migration guide from CGI to new system
- [ ] User guide for new features

## Phase 12: Discord Bot Implementation (Completed)
- [x] Create discord-bot/ directory structure with Python Discord.py bot
- [x] Implement !words command with pattern search functionality
- [x] Design beautiful multicolumn result formatting for Discord
- [x] Add Discord bot service to docker-compose.yml
- [x] Create secure environment variable configuration
- [x] Write Discord server integration documentation
- [x] Include credential storage security best practices
- [x] Test bot functionality with various search patterns
- [x] Optimize result display for Discord's wide screen format
- [x] Add error handling and user-friendly messages

## Future Enhancements (for reference)
- [ ] API rate limiting and authentication
- [ ] Search history and favorites
- [ ] Advanced search filters and sorting
- [ ] Multiple index support

# Nutrimatic Todo List

- [x] Create a Dockerfile for building the C++ `find-expr` binary.
- [x] Add a `builder` service to `docker-compose.yml` that uses the new Dockerfile.
- [x] Configure the `builder` service to output the `find-expr` binary to the shared `./bin` directory.
- [x] Make the `api` service in `docker-compose.yml` depend on the `builder` service.
- [x] Update `README.md` to reflect the new Docker-based C++ build process.
- [x] Append changes to `docs/worklog.md`.
- [x] Update this `docs/todo.md` as tasks are completed.
- [x] Ensure `COMMIT-MESSAGE-DRAFT` is up-to-date. 
- [X] Add /encode command to Discord bot for Braille and Morse code.
- [X] Add ASCII codepoint encoding to /encode command.
- [X] Add Semaphore Flags encoding to /encode command.
- [X] Add alphabet ordinal encoding to /encode command.
- [X] Add ROT13 encoding to /encode command.
- [X] Add Ternary encoding to /encode command.
- [X] Add Resistor Colors encoding to /encode command.
- [X] Add NATO alphabet encoding to /encode command.
- [X] Add American Sign Language encoding to /encode command.
- [X] Add Maritime Flags encoding to /encode command.
- [X] Refactor encoding schemes into separate encodings.py module. 