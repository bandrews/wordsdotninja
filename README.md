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

## Docker Hub Images

Pre-built images are available on Docker Hub (linux/amd64):

| Image | Description |
|-------|-------------|
| `andrewsbw/wordsninja-api:latest` | REST API with compiled binaries and indexes |
| `andrewsbw/wordsninja-frontend:latest` | React web UI served by nginx |
| `andrewsbw/wordsninja-discord-bot:latest` | Discord bot integration |

## Use Nutrimatic CLI Instantly

Run Nutrimatic pattern searches directly using Docker - no installation or build required:

```bash
# Find anagrams of "listen" (returns: silent, listen, enlist, tinsel...)
docker run --rm andrewsbw/wordsninja-api:latest find-expr /data/wikipedia.index '<listen>' | head -10

# Words starting with "puzz"
docker run --rm andrewsbw/wordsninja-api:latest find-expr /data/wikipedia.index 'puzz*' | head -10

# 5-letter words matching _a_e_ (water, games, paper...)
docker run --rm andrewsbw/wordsninja-api:latest find-expr /data/wikipedia.index '_a_e_' | head -10

# Use the smaller 12dicts index for common words only
docker run --rm andrewsbw/wordsninja-api:latest find-expr /data/12dicts.index '<apple>' | head -10
```

Results are ordered by frequency in Wikipedia. Pipe through `head` to limit output.

### Pattern Syntax Quick Reference

| Pattern | Meaning |
|---------|---------|
| `A` | Literal letter A |
| `_` | Any single letter |
| `*` | Zero or more letters |
| `[aeiou]` | Any vowel |
| `[^aeiou]` | Any consonant |
| `<word>` | Anagram of "word" |
| `"phrase"` | Exact phrase match |
| `A&B` | Pattern A and B overlap |

See [Nutrimatic documentation](http://nutrimatic.org/usage.html) for full syntax.

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
- Pre-downloaded Wikipedia and 12Dicts indexes (~1.1GB)

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

## Public API

The Nutrimatic API is publicly available at **https://api.words.ninja**

### Base URL

```
https://api.words.ninja
```

### Endpoints

#### Health Check

```http
GET /health
```

Returns API status and available dictionaries.

**Example:**
```bash
curl https://api.words.ninja/health
```

**Response:**
```json
{
  "status": "healthy",
  "find_expr_binary": "/usr/local/bin/find-expr",
  "binary_exists": true,
  "dictionaries": {
    "wikipedia": true,
    "12dicts": true
  }
}
```

#### List Dictionaries

```http
GET /dictionaries
```

Returns available dictionaries with metadata.

**Example:**
```bash
curl https://api.words.ninja/dictionaries
```

**Response:**
```json
{
  "dictionaries": [
    {
      "id": "wikipedia",
      "name": "Wikipedia",
      "description": "Large comprehensive dictionary from Wikipedia text",
      "default": true,
      "available": true,
      "scale_mapping": {...}
    },
    {
      "id": "12dicts",
      "name": "12Dicts",
      "description": "Curated word list with high-quality entries",
      "default": false,
      "available": true,
      "scale_mapping": {...}
    }
  ]
}
```

#### Search (Paginated)

```http
GET /search?q=<pattern>&dictionary=<dict>&limit=<n>&offset=<n>
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `q` | string | required | Search pattern |
| `dictionary` | string | `wikipedia` | Dictionary: `wikipedia` or `12dicts` |
| `limit` | int | 100 | Max results (1-1000) |
| `offset` | int | 0 | Pagination offset |

**Example:**
```bash
# Find anagrams of "listen"
curl 'https://api.words.ninja/search?q=<listen>&limit=10'

# 5-letter words matching _a_e_
curl 'https://api.words.ninja/search?q=_a_e_&dictionary=12dicts&limit=20'
```

**Response:**
```json
{
  "query": "<listen>",
  "dictionary": "wikipedia",
  "results": [
    {"text": "silent", "score": 86937.0, "rank": 0},
    {"text": "listen", "score": 36298.0, "rank": 1},
    {"text": "enlist", "score": 7832.0, "rank": 2}
  ],
  "total_results": 156,
  "computation_limit_reached": false,
  "error": null
}
```

#### Search (Streaming)

```http
GET /search/stream?q=<pattern>&dictionary=<dict>
```

Returns Server-Sent Events for real-time results. Useful for large result sets.

**Example:**
```bash
curl -N 'https://api.words.ninja/search/stream?q=puzz*'
```

**Response (SSE):**
```
data: {'type': 'result', 'data': {'text': 'puzzle', 'score': 45678.0, 'rank': 0}}
data: {'type': 'result', 'data': {'text': 'puzzles', 'score': 23456.0, 'rank': 1}}
data: {'type': 'done'}
```

### Pattern Syntax

| Pattern | Meaning | Example |
|---------|---------|---------|
| `A` | Literal letter | `cat` matches "cat" |
| `_` | Any single letter | `c_t` → cat, cot, cut |
| `*` | Zero or more letters | `cat*` → cat, cats, caterpillar |
| `+` | One or more letters | `cat+` → cats, caterpillar |
| `?` | Optional character | `cats?` → cat, cats |
| `[abc]` | Any of these | `[aeiou]` → any vowel |
| `[^abc]` | None of these | `[^aeiou]` → any consonant |
| `[a-z]` | Character range | `[a-m]` → a through m |
| `<word>` | Anagram | `<listen>` → silent, enlist |
| `"phrase"` | Exact phrase | `"the cat"` |
| `A & B` | Both match | `c*t & *a*` → cat, cart |
| `A \| B` | Either matches | `cat\|dog` |
| `{n}` | Exactly n times | `A{5}` → 5-letter words |
| `{n,m}` | n to m times | `A{3,5}` → 3-5 letter words |
| `C` | Consonant (incl. y) | `CVC` → cat, dog |
| `V` | Vowel (a,e,i,o,u) | `cVt` → cat, cot, cut |

### Rate Limits

- 10 requests/second with burst of 20
- Results ordered by Wikipedia frequency (higher = more common)
- Computation timeout: 30 seconds

### CORS

The API supports CORS from any origin, so you can call it directly from browser JavaScript.

## Kubernetes Deployment (K3s)

### Build and push images (optional)

```bash
# Build images (use buildx for cross-platform)
docker buildx build --platform linux/amd64 -t andrewsbw/wordsninja-api:latest -f api/Dockerfile --push .
docker buildx build --platform linux/amd64 -t andrewsbw/wordsninja-frontend:latest frontend/ --push
docker buildx build --platform linux/amd64 -t andrewsbw/wordsninja-discord-bot:latest discord-bot/ --push
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

### MCP Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/mcp` | GET | MCP manifest with tool definitions |
| `/mcp` | POST | JSON-RPC endpoint for tool calls |

### Configure Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "nutrimatic": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://api.words.ninja/mcp"]
    }
  }
}
```

Or for local development:

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

### Available Tools

**nutrimatic_search** - Search word patterns with parameters:
- `pattern` (required): Search pattern (e.g., `<listen>`, `c*t`)
- `dictionary`: `wikipedia` (default) or `12dicts`
- `max_results`: 1-100 (default: 10)

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
