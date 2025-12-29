# Words.ninja Discord Bot

The Words.ninja Discord Bot provides word pattern search functionality directly in Discord servers, allowing users to search through word databases using the powerful Nutrimatic pattern syntax via intuitive slash commands.

## Features

- **Slash commands**: Modern Discord slash commands that appear in the UI for easy discovery
- **Multiple dictionaries**: Supports both Wikipedia and 12Dicts databases
- **Smart formatting**: Adaptive column layout optimized for Discord's wide screen format
- **Frequency indicators**: Color-coded emoji indicators for word frequency
- **Comprehensive help**: Built-in pattern syntax guide and examples
- **Error handling**: User-friendly error messages and timeout handling

## Quick Start

### 1. Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name (e.g., "Words.ninja Bot")
3. Go to the "Bot" section in the left sidebar
4. Click "Add Bot" to create a bot user
5. Under "Token", click "Copy" to get your bot token
6. **Important**: Keep this token secret and never share it publicly

### 2. Configure Bot Permissions

In the Discord Developer Portal:

1. Go to the "Bot" section
2. Under "Privileged Gateway Intents", enable:
   - **Message Content Intent** (required for reading commands)
3. Go to the "OAuth2" → "URL Generator" section
4. Select scopes:
   - ✅ `bot`
   - ✅ `applications.commands` (required for slash commands)
5. Select bot permissions:
   - ✅ `Send Messages`
   - ✅ `Use Slash Commands`
   - ✅ `Read Message History`
   - ✅ `Add Reactions` (optional)

### 3. Set Up Environment

Create the Discord bot environment file:

```bash
# Copy the example environment file
cp discord-bot/env.example discord-bot/.env

# Edit the file with your bot token
nano discord-bot/.env
```

Add your Discord bot token to the `.env` file:

```env
# Discord Bot Configuration
DISCORD_BOT_TOKEN=your_actual_bot_token_here

# API Configuration (defaults work with docker-compose)
NUTRIMATIC_API_URL=http://api:8000
DEFAULT_DICTIONARY=12dicts
MAX_RESULTS=25
```

### 4. Deploy with Docker

Start the complete Nutrimatic system including the Discord bot:

```bash
# Start all services including Discord bot
docker-compose --profile discord up -d

# Or start just the core services first, then add the bot
docker-compose up -d
docker-compose --profile discord up -d discord-bot
```

### 5. Invite Bot to Server

1. In Discord Developer Portal, go to "OAuth2" → "URL Generator"
2. Copy the generated URL
3. Open the URL in your browser
4. Select the Discord server where you want to add the bot
5. Click "Authorize"

**Note**: After adding the bot, slash commands may take up to 1 hour to appear globally, or you can restart the bot to sync them immediately.

## Usage

### Slash Commands

#### /words - Pattern Search
Search for word patterns using Nutrimatic syntax:

```
/words pattern:cat                    # Words containing "cat"
/words pattern:C*t                    # Words starting with C, ending with t
/words pattern:<listen>               # Anagrams of "listen"
/words pattern:_____ dictionary:12dicts # All 5-letter words from 12dicts
/words pattern:A*A*A max_results:30   # Words with exactly 3 A's, up to 30 results
```

**Parameters:**
- `pattern` (required): Search pattern using Nutrimatic syntax
- `dictionary` (optional): Choose between "12Dicts (curated)" or "Wikipedia (comprehensive)"
- `max_results` (optional): Number of results to return (1-50, default 25)

#### /help - Syntax Guide
Get detailed pattern syntax help:

```
/help                    # Show complete pattern syntax guide
```

#### /ping - Bot Status
Check if the bot is responsive:

```
/ping                    # Returns latency information
```

#### /status - System Status
Check bot and API connectivity:

```
/status                  # Shows bot and API status
```

### Pattern Syntax

The bot supports the full Nutrimatic pattern syntax:

#### Basic Characters
- `.` - Any character
- `_` - Any letter or number
- `#` - Any digit (0-9)
- `A` - Any letter
- `C` - Any consonant (including Y)
- `V` - Any vowel (excluding Y)
- `-` - Optional space

#### Repetition
- `*` - Zero or more of previous
- `+` - One or more of previous
- `?` - Zero or one of previous
- `{3}` - Exactly 3 of previous
- `{2,5}` - Between 2 and 5 of previous
- `{3,}` - 3 or more of previous

#### Character Sets
- `[abc]` - Any of: a, b, or c
- `[^abc]` - Any except: a, b, or c
- `[a-z]` - Any letter from a to z
- `[0-9]` - Any digit

#### Advanced Patterns
- `<word>` - Anagrams of "word"
- `"phrase"` - Exact phrase (no auto spaces)
- `(A|B)` - Either A or B
- `A & B` - Both A and B (intersection)

### Example Searches

#### Crossword Clues
```
/words pattern:C*t           # 3+ letter words: C...t
/words pattern:_____         # Exactly 5 letters
/words pattern:[aeiou]*ing   # Starting with vowel, ending "ing"
```

#### Anagrams
```
/words pattern:<silent>      # Anagrams: listen, enlist, silent
/words pattern:<teacher>     # Anagrams: cheater, hectare, recheat
```

#### Word Games
```
/words pattern:A*A*A         # Words with exactly 3 A's
/words pattern:C*C*C         # Words with exactly 3 consonants
/words pattern:[^aeiou]*     # Words starting with consonants
```

#### Scrabble/Word Puzzles
```
/words pattern:<qwertyui>    # Anagrams using these letters
/words pattern:_u_z_e        # Pattern with known letters
```

## Result Display

The bot formats results in a beautiful multicolumn layout optimized for Discord:

### Frequency Indicators
- 🟢 **Common** - High frequency words (score ≥ 30)
- 🟡 **Moderate** - Medium frequency words (score ≥ 10)
- 🔵 **Uncommon** - Low frequency words (score ≥ 3)
- 🔴 **Rare** - Rare words (score < 3)

### Layout Features
- **Adaptive Columns**: 2-4 columns based on word length
- **Smart Truncation**: Automatically limits results to fit Discord's 2000 character limit
- **Aligned Display**: Clean, readable column formatting
- **Result Count**: Shows number of results found

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DISCORD_BOT_TOKEN` | *required* | Discord bot token from Developer Portal |
| `NUTRIMATIC_API_URL` | `http://api:8000` | URL of Nutrimatic API service |
| `DEFAULT_DICTIONARY` | `12dicts` | Default dictionary (`12dicts` or `wikipedia`) |
| `MAX_RESULTS` | `25` | Maximum results per search (1-50) |

### Dictionary Selection

The bot defaults to **12Dicts** for better quality results:

- **12Dicts**: Curated word list with high-quality, common words
- **Wikipedia**: Larger database including proper nouns and technical terms

## Security Best Practices

### Token Security

1. **Never commit tokens to version control**:
   ```bash
   # Add to .gitignore
   echo "discord-bot/.env" >> .gitignore
   ```

2. **Use environment variables in production**:
   ```bash
   # Set directly in production environment
   export DISCORD_BOT_TOKEN="your_token_here"
   ```

3. **Rotate tokens regularly**:
   - Generate new tokens in Discord Developer Portal
   - Update environment configuration
   - Restart bot service

### Server Permissions

1. **Minimal permissions**: Only grant necessary permissions
2. **Role restrictions**: Use Discord roles to limit bot access
3. **Channel restrictions**: Restrict bot to specific channels if needed

### Rate Limiting

The bot includes built-in protections:
- API timeout handling (30 seconds)
- Discord rate limit compliance
- Error handling for failed requests

## Deployment Options

### Docker Compose (Recommended)

```bash
# Start with Discord bot
docker-compose --profile discord up -d

# View logs
docker-compose logs discord-bot

# Restart bot only
docker-compose restart discord-bot
```

### Standalone Deployment

```bash
# Install dependencies
cd discord-bot
pip install -r requirements.txt

# Set environment variables
export DISCORD_BOT_TOKEN="your_token_here"
export NUTRIMATIC_API_URL="http://your-api-server:8000"

# Run bot
python bot.py
```

### Production Deployment

For production environments:

1. **Use secrets management**:
   - Docker secrets
   - Kubernetes secrets
   - Cloud provider secret managers

2. **Monitor bot health**:
   - Log aggregation
   - Health check endpoints
   - Alert on failures

3. **Scale considerations**:
   - Single bot instance per Discord application
   - API service can be scaled independently
   - Database/index files should be shared

## Troubleshooting

### Common Issues

#### Bot doesn't respond to slash commands
1. Check bot token is correct
2. Verify Message Content Intent is enabled
3. Ensure bot has "Use Slash Commands" permission
4. Check bot is online in Discord
5. Wait up to 1 hour for global command sync, or restart bot

#### Slash commands don't appear
1. Ensure `applications.commands` scope was selected during bot invitation
2. Check bot has proper permissions in the server
3. Try the `/sync` command if you're the bot owner
4. Restart the bot to force command synchronization

#### API connection errors
1. Verify `NUTRIMATIC_API_URL` is correct
2. Check API service is running and healthy
3. Ensure network connectivity between services
4. Check Docker network configuration

#### Permission errors
1. Verify bot has required permissions in channel
2. Check role hierarchy (bot role should be high enough)
3. Ensure bot can read message history

### Debug Commands

```bash
# Check bot logs
docker-compose logs discord-bot

# Test API connectivity
curl http://localhost/api/health

# Check bot status in Discord
/status

# Test simple pattern
/words pattern:test
```

### Log Analysis

The bot provides detailed logging:

```
INFO - Bot connected to Discord
INFO - Synced 4 command(s)
INFO - Bot is in X guilds
ERROR - API error 500: Internal server error
WARNING - Search timed out for pattern: complex_pattern
```

## Development

### Local Development

1. **Set up development environment**:
   ```bash
   cd discord-bot
   python -m venv venv
   source venv/bin/activate  # or `venv\Scripts\activate` on Windows
   pip install -r requirements.txt
   ```

2. **Configure environment**:
   ```bash
   cp env.example .env
   # Edit .env with your development bot token
   ```

3. **Run locally**:
   ```bash
   python bot.py
   ```

### Testing

Test the bot with various patterns:

```
/words pattern:test          # Simple word search
/words pattern:<test>        # Anagram search
/words pattern:T*t           # Pattern search
/words pattern:_____         # Length-based search
/words pattern:[aeiou]*      # Character class search
```

### Adding Features

The bot is designed for easy extension:

1. **Add new commands**: Create new `@bot.tree.command()` functions
2. **Modify formatting**: Update `format_results_multicolumn()` function
3. **Add dictionaries**: Extend API configuration
4. **Custom filters**: Add result filtering logic

## Support

For issues and questions:

1. Check the troubleshooting section above
2. Review bot logs for error messages
3. Test API connectivity independently
4. Verify Discord permissions and configuration

The Discord bot integrates seamlessly with the existing Nutrimatic infrastructure while providing a user-friendly interface for Discord communities interested in word games, puzzles, and linguistic exploration. 