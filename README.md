# Words.ninja

A modern web interface for [Nutrimatic](http://nutrimatic.org/), the word pattern search engine for puzzles, crosswords, and word games.

## Project Structure

```
wordsdotninja/
├── nutrimatic/          # Upstream Nutrimatic C++ source and build
│   ├── source/          # C++ source code
│   ├── Dockerfile       # Multi-purpose build/runtime image
│   ├── conanfile.py     # C++ package manager config
│   └── mise.toml        # Build tool version management
├── api/                 # Python FastAPI backend
│   ├── Dockerfile       # Self-contained API image (builds C++, downloads indexes)
│   ├── main.py          # REST API implementation
│   └── requirements.txt
├── frontend/            # React web UI
│   ├── Dockerfile       # Production build
│   ├── Dockerfile.dev   # Development with hot reload
│   └── src/             # React components
├── discord-bot/         # Discord bot integration
│   ├── Dockerfile
│   ├── bot.py
│   └── .env             # Discord token (not committed)
├── k8s/                 # Kubernetes manifests for K3s
│   ├── kustomization.yaml
│   ├── namespace.yaml
│   ├── api.yaml
│   ├── frontend.yaml
│   ├── ingress.yaml
│   └── discord-bot.yaml
├── docker-compose.yml   # Local development orchestration
├── nginx.conf           # Reverse proxy configuration
└── docs/                # Documentation
```

## Quick Start with Docker

```bash
# Clone the repository
git clone https://github.com/bandrews/wordsdotninja.git
cd wordsdotninja

# Build and run (first build takes a while - compiles C++ and downloads 1.1GB index)
docker compose up --build

# Access at http://localhost
```

The API image is self-contained with:
- Compiled `find-expr` binary
- Pre-downloaded Wikipedia and 12Dicts indexes

## Development

### Run with hot reload for frontend development

```bash
docker compose --profile dev up
```

Access the development frontend at http://localhost:3001

### Run with Discord bot

```bash
# Configure Discord token
cp discord-bot/env.example discord-bot/.env
# Edit discord-bot/.env with your token

docker compose --profile discord up
```

## Kubernetes Deployment (K3s)

### Pre-built images

Images are available on Docker Hub:
- `andrewsbw/wordsninja-api:latest`
- `andrewsbw/wordsninja-frontend:latest`

### Build and push images (optional)

```bash
# Build images
docker build -t andrewsbw/wordsninja-api:latest -f api/Dockerfile .
docker build -t andrewsbw/wordsninja-frontend:latest frontend/

# Push to registry
docker push andrewsbw/wordsninja-api:latest
docker push andrewsbw/wordsninja-frontend:latest
```

### Deploy to K3s

```bash
# Edit k8s/kustomization.yaml to set your registry
# Then apply:
kubectl apply -k k8s/

# Or deploy individually:
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/api.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/ingress.yaml

# Optional: Discord bot (update secret first)
kubectl apply -f k8s/discord-bot.yaml
```

## Building Nutrimatic Tools

The nutrimatic image can be used standalone for building indexes or running the original Nutrimatic frontend:

```bash
# Build the nutrimatic image
docker compose --profile tools build nutrimatic

# Run nutrimatic tools interactively
docker compose --profile tools run nutrimatic

# Or directly:
docker run -v ./data:/data -it wordsninja-nutrimatic find-expr /data/wikipedia.index '<aciimnrttu>'
```

### Rebuilding indexes from Wikipedia

```bash
# Download Wikipedia dump (~20GB)
wget https://dumps.wikimedia.org/enwiki/latest/enwiki-latest-pages-articles.xml.bz2

# Extract text
pip install wikiextractor
wikiextractor enwiki-latest-pages-articles.xml.bz2

# Build index using nutrimatic container
docker run -v ./text:/input -v ./data:/output wordsninja-nutrimatic \
  sh -c 'find /input -type f | xargs cat | make-index /output/wikipedia'

# Merge indexes
docker run -v ./data:/data wordsninja-nutrimatic \
  merge-indexes 5 /data/wikipedia.*.index /data/wikipedia.index
```

## MCP Server for AI Agents

Words.ninja includes a Model Context Protocol (MCP) server for AI agents like Claude.

### Configure Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "nutrimatic": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "http://localhost/api/mcp"]
    }
  }
}
```

For complete documentation, see [docs/mcp-server.md](docs/mcp-server.md).

## Discord Bot

See [docs/discord-bot.md](docs/discord-bot.md) for setup instructions.

### Quick Setup

1. Create Discord application at [Discord Developer Portal](https://discord.com/developers/applications)
2. Copy bot token to `discord-bot/.env`
3. Run `docker compose --profile discord up`
4. Invite bot to your server

### Example Commands

```
/words pattern:cat                    # Words containing "cat"
/words pattern:C*t                    # Words starting with C, ending with t
/words pattern:<listen>               # Anagrams of "listen"
/help                                 # Show pattern syntax guide
```

## License

GPL - See [COPYING](COPYING) for details.

Nutrimatic is based on work by Dan Egnor. See the [original project](https://github.com/egnor/nutrimatic).
