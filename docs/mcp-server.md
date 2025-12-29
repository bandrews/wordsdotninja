# Words.ninja MCP Server

The Words.ninja MCP (Model Context Protocol) server allows AI agents like Claude to autonomously search through massive word databases using pattern matching. This is perfect for crosswords, word puzzles, anagrams, and word games.

## Overview

The MCP server is implemented as HTTP endpoints within the existing Nutrimatic FastAPI application. It provides a standardized interface for AI models to:

- Search for words and phrases using complex pattern syntax
- Access both Wikipedia and 12Dicts word databases
- Get results filtered for quality (score >= 1.0)
- Understand comprehensive pattern syntax for advanced searches

## Endpoints

### GET /mcp/manifest

Returns the MCP manifest describing available tools and their schemas.

**Response:**
```json
{
  "schemaVersion": "2025-03-26",
  "vendor": "Nutrimatic",
  "name": "nutrimatic-search",
  "version": "2.0.0",
  "description": "Search through massive word databases using pattern matching...",
  "tools": [...]
}
```

### POST /mcp/tools/call

Executes the `nutrimatic_search` tool.

**Request:**
```json
{
  "name": "nutrimatic_search",
  "arguments": {
    "pattern": "C*t",
    "dictionary": "wikipedia",
    "max_results": 20
  }
}
```

**Response:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "Found 20 results for pattern 'C*t' in Wikipedia dictionary:\n\n• cat (score: 1234.5)\n• cut (score: 987.2)\n..."
    }
  ],
  "isError": false
}
```

## Tool: nutrimatic_search

### Parameters

- **pattern** (required): Search pattern using Nutrimatic syntax
- **dictionary** (optional): Dictionary to search ("wikipedia" or "12dicts", default: "wikipedia")
- **max_results** (optional): Maximum results to return (1-100, default: 20)

### Pattern Syntax

The Nutrimatic pattern syntax is extremely powerful and supports:

#### Query Types
- `<abc>`: Anagram (e.g., `<cat>` → act, tac)
- `"text"`: Exact phrase (e.g., `"the cat"`)
- `A & B`: Both patterns must match (e.g., `C*t & *a*`)
- `A | B`: Either pattern matches (e.g., `cat|dog`)
- `()`: Group patterns (e.g., `(cat|dog)s`)
- `<(abc)?>`: Optional parts in anagrams (e.g., `<cat(s)?>`)

#### Character Classes
- `.`: Any character (e.g., `c.t` → cat, cut, cot)
- `_`: Letter or number (e.g., `c_t` → cat, c3t)
- `#`: Any digit (e.g., `room #`)
- `A`: Any letter (e.g., `cAt` → cat, cbt)
- `C`: Consonant including y (e.g., `CaC` → cat, bay)
- `V`: Vowel a,e,i,o,u only (e.g., `cVt` → cat, cut)
- `[abc]`: Any of these characters (e.g., `[aeiou]`)
- `[^abc]`: None of these characters (e.g., `[^aeiou]`)
- `[a-z]`: Character range (e.g., `[a-m]`)
- `-`: Optional space (e.g., `cat-dog`)

#### Repetition
- `*`: Zero or more (e.g., `cat*` → cat, cats, caterpillar)
- `+`: One or more (e.g., `cat+` → cats, caterpillar)
- `?`: Optional (e.g., `cats?` → cat, cats)
- `{3}`: Exactly 3 times (e.g., `C{3}` → cat, dog)
- `{2,5}`: 2 to 5 times (e.g., `C{2,5}`)
- `{3,}`: 3 or more times (e.g., `C{3,}`)

#### Tips
- Start patterns are faster: `"the*"` vs `"*ing"`
- Use quotes for exact phrases: `"the cat"`
- Y is treated as a consonant, not vowel
- Combine with &: `"C*t & *a*"`
- Scores indicate frequency/commonality in the corpus

## Using with AI Agents

### Claude Desktop

To use the Nutrimatic MCP server with Claude Desktop, you need to configure it to connect to the HTTP server.

1. **Start the Nutrimatic server:**
   ```bash
   docker-compose up
   ```
   The server will be available at `http://localhost` (port 80) via nginx reverse proxy

2. **Configure Claude Desktop** by editing `~/Library/Application Support/Claude/claude_desktop_config.json` (create the file if it doesn't exist). On Windows, this is typically `%APPDATA%\Claude\claude_desktop_config.json`.

   ```json
   {
     "mcpServers": {
       "nutrimatic": {
         "command": "npx",
         "args": [
           "-y", 
           "mcp-remote",
           "http://localhost/api/mcp"
         ]
       }
     }
   }
   ```
   **Note:** 
   - Ensure Node.js and npx are installed and in your system's PATH.
   - The `http://localhost/api/mcp` URL assumes you are running the Nutrimatic Docker containers locally and that they are accessible at this address.
   - The `mcp-remote` utility is used to connect Claude Desktop to an HTTP-based MCP server. If `mcp-remote` is not found via `npx`, further investigation for the correct proxy tool may be needed.

3. **Restart Claude Desktop** and the Nutrimatic search tool should be available. If Claude Desktop was already running, you'll need to fully quit and restart it.

### Other MCP Clients

For other MCP clients that support HTTP transport, configure them to connect to:
- **Manifest URL**: `http://localhost/api/mcp/manifest`
- **Tool Call URL**: `http://localhost/api/mcp/tools/call`

## Example Usage

### Basic Word Search
```
Pattern: "C*t"
Result: cat, cut, coat, cart, etc.
```

### Anagram Search
```
Pattern: "<listen>"
Result: silent, enlist, tinsel, etc.
```

### Complex Pattern
```
Pattern: "C*t & *a*"
Result: Words starting with consonant, ending with 't', containing 'a'
```

### Phrase Search
```
Pattern: "the * cat"
Result: Phrases with 'the' and 'cat' separated by one word
```

### Vowel Patterns
```
Pattern: "[aeiou]{3}"
Result: Words with 3 consecutive vowels
```

## Dictionaries

### Wikipedia Dictionary
- **File**: `/data/wikipedia.index`
- **Description**: Large comprehensive dictionary from Wikipedia text
- **Best for**: General word searches, common phrases, proper nouns
- **Score range**: Typically 1-100,000+

### 12Dicts Dictionary
- **File**: `/data/12dicts.index`
- **Description**: Curated word list with high-quality entries
- **Best for**: Crossword puzzles, clean word lists
- **Score range**: Typically 0.1-50

## Quality Filtering

The MCP server automatically filters results to only return entries with a score >= 1.0. This ensures that:
- Only reasonably common/valid words are returned
- AI agents get high-quality results
- Response sizes remain manageable
- Search performance is optimized

## Error Handling

The server provides comprehensive error handling for:
- Invalid patterns
- Missing dictionaries
- Computation limits exceeded
- Internal server errors

All errors are returned in the standard MCP format with `isError: true`.

## Performance Considerations

- **Computation Limits**: Searches are limited to prevent excessive CPU usage
- **Result Limits**: Maximum 100 results per search to keep responses manageable
- **Pattern Optimization**: Start-anchored patterns (`"the*"`) are much faster than end-anchored (`"*ing"`)
- **Dictionary Selection**: 12Dicts is smaller and faster for simple word searches

## Security

The MCP server runs within the existing Nutrimatic API with the same security considerations:
- Resource limits prevent excessive CPU/memory usage
- Input validation prevents malicious patterns
- No file system access beyond configured dictionaries
- Standard HTTP security headers applied

## Troubleshooting

### Server Not Starting
- Check that Docker containers are running: `docker-compose ps`
- Verify API is accessible: `curl http://localhost/api/health`

### MCP Client Connection Issues
- Ensure the manifest URL is accessible directly in your browser or via curl: `curl http://localhost/api/mcp/manifest`. This is the first URL the `mcp-remote` utility will try to access.
- Check client configuration in `claude_desktop_config.json` carefully for typos in the server name ("nutrimatic"), command ("npx"), or arguments (especially the URL).
- Verify network connectivity between your machine and the Docker containers.
- **Check Claude Desktop Logs**:
  - On macOS: `~/Library/Logs/Claude/mcp.log` and `~/Library/Logs/Claude/mcp-server-nutrimatic.log`
  - On Windows: `%APPDATA%\Claude\logs\mcp.log` and `%APPDATA%\Claude\logs\mcp-server-nutrimatic.log`
  - Look for errors related to connecting to "nutrimatic" or to the `http://localhost/api/mcp` URL, or errors from `mcp-remote`.
- **Test `mcp-remote` manually**: Try running the command Claude Desktop would run directly in your terminal:
  `npx -y mcp-remote http://localhost/api/mcp`
  This will show if `mcp-remote` itself can connect to your Nutrimatic MCP server and if it outputs any errors. This step is crucial to confirm if `mcp-remote` is the correct and available tool.

### Search Issues
- Test patterns with the web interface first
- Check dictionary availability in health endpoint
- Try simpler patterns if computation limits are reached
- Verify pattern syntax against documentation

### No Results
- Check if pattern is too restrictive
- Try different dictionary (wikipedia vs 12dicts)
- Verify score threshold (>= 1.0) isn't filtering all results
- Test with known working patterns like "cat" or "the"

## Development

To extend the MCP server:

1. **Add new tools**: Extend the manifest and tool call handler
2. **Modify filtering**: Adjust score thresholds or result processing
3. **Add parameters**: Extend the tool schema and argument handling
4. **Enhance documentation**: Update pattern syntax or examples

The MCP implementation is designed to be easily extensible while maintaining compatibility with the existing Nutrimatic API. 