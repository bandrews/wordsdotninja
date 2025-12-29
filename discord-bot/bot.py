#!/usr/bin/env python3
"""
Nutrimatic Discord Bot

A Discord bot that provides word pattern search functionality using the Nutrimatic API.
Supports slash commands for searching patterns with beautiful multicolumn formatting.
"""

import os
import asyncio
import logging
import math
from typing import List, Optional, Dict, Any
import aiohttp
import discord
from discord import app_commands
from discord.ext import commands
from dotenv import load_dotenv
import re

# Import encoding functions
from text_encodings import encode_text, get_encoding_choices

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Bot configuration
DISCORD_TOKEN = os.getenv('DISCORD_BOT_TOKEN')
API_BASE_URL = os.getenv('NUTRIMATIC_API_URL', 'http://api:8000')
DEFAULT_DICTIONARY = os.getenv('DEFAULT_DICTIONARY', '12dicts')
MAX_RESULTS = int(os.getenv('MAX_RESULTS', '36'))

# Discord configuration
intents = discord.Intents.default()
intents.message_content = True

class NutrimaticBot(commands.Bot):
    def __init__(self):
        super().__init__(command_prefix='/', intents=intents)
    
    async def setup_hook(self):
        """Called when the bot is starting up"""
        # Sync slash commands with Discord
        try:
            synced = await self.tree.sync()
            logger.info(f"Synced {len(synced)} command(s)")
        except Exception as e:
            logger.error(f"Failed to sync commands: {e}")

bot = NutrimaticBot()

class NutrimaticAPI:
    """API client for communicating with the Nutrimatic backend"""
    
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')
        self.session = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def search_pattern(self, pattern: str, dictionary: str = DEFAULT_DICTIONARY, limit: int = MAX_RESULTS) -> Dict[str, Any]:
        """Search for a pattern using the Nutrimatic API"""
        if not self.session:
            raise RuntimeError("API client not initialized. Use 'async with' context manager.")
        
        url = f"{self.base_url}/search"
        # Request extra results to allow for filling partial rows
        api_limit = limit + 10
        params = {
            'q': pattern,
            'dictionary': dictionary,
            'limit': api_limit,
            'offset': 0
        }
        
        try:
            async with self.session.get(url, params=params, timeout=30) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    error_text = await response.text()
                    logger.error(f"API error {response.status}: {error_text}")
                    return {
                        'error': f"API returned status {response.status}",
                        'results': [],
                        'total_results': 0
                    }
        except asyncio.TimeoutError:
            logger.error(f"Timeout searching for pattern: {pattern}")
            return {
                'error': "Search timed out",
                'results': [],
                'total_results': 0
            }
        except Exception as e:
            logger.error(f"Error searching for pattern {pattern}: {e}")
            return {
                'error': f"Search failed: {str(e)}",
                'results': [],
                'total_results': 0
            }

def get_display_width(text: str) -> int:
    """Calculate the display width of text, accounting for ANSI codes and emoji"""
    # Remove ANSI escape sequences for width calculation
    ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')
    clean_text = ansi_escape.sub('', text)
    
    width = 0
    for char in clean_text:
        # Check for specific emoji we use: ��🟡⚪
        if char in ['🟢', '🟡', '⚪']:
            width += 2  # These emoji take up 2 display units in monospace
        elif ord(char) > 0x1F000:  # Other emoji range detection
            width += 2
        else:
            width += 1
    return width

def format_results_multicolumn(results: List[Dict[str, Any]], pattern: str, dictionary: str, total_results: int, format_type: str = "friendly", requested_count: int = MAX_RESULTS) -> str:
    """Format search results in a beautiful multicolumn layout for Discord"""
    
    if not results:
        return f"```\nNo results found for pattern: {pattern}\n```"
    
    # Create header - make pattern prominent, other info less so
    header = f"🔍 Nutrimatic Search\n# Pattern: **`{pattern}`**\n"

    # Raw format: just list words one per line
    if format_type == "raw":
        word_list = "\n".join(result['text'] for result in results[:requested_count])
        header += f"-# {dictionary.title()} dictionary • {total_results} {'result' if total_results == 1 else 'results'}\n"
        return header + f"```\n{word_list}\n```" 

    # Prepare formatted items with frequency indicators
    # Group results by frequency tier to minimize ANSI codes
    frequency_tiers = []
    current_tier = None
    current_group = []
    
    for result in results:
        score = result['score']
        
        # Determine frequency tier
        if score >= 9:
            tier = 'highest'
            freq_indicator = "✪"
            color_code = "\033[1;36m"
        elif score >= 7:
            tier = 'high'
            freq_indicator = "█"
            color_code = "\033[0;37m"
        elif score >= 5:
            tier = 'mid'
            freq_indicator = "▊"
            color_code = "\033[0;37m"
        elif score >= 3:
            tier = 'low_mid'
            freq_indicator = "▌"
            color_code = "\033[0;37m"
        elif score >= 1:
            tier = 'low'
            freq_indicator = "▎"
            color_code = "\033[0;32m"
        else:
            tier = 'lowest'
            freq_indicator = "·"
            color_code = "\033[0;30m"
        
        # If tier changed, start a new group
        if current_tier != tier:
            if current_group:
                frequency_tiers.append((current_tier, current_group))
            current_tier = tier
            current_group = [(freq_indicator, result['text'], color_code)]
        else:
            current_group.append((freq_indicator, result['text'], color_code))
    
    # Add the last group
    if current_group:
        frequency_tiers.append((current_tier, current_group))
    
    # Build formatted items with minimal ANSI codes
    formatted_items = []
    raw_items = []
    
    for tier, group in frequency_tiers:
        if not group:
            continue
            
        # Get color code from first item in group
        color_code = group[0][2]
        
        # Add color change at start of tier
        current_color = color_code
        
        for i, (freq_indicator, text, _) in enumerate(group):
            raw_items.append(f"X {text}")
            
            if i == 0:
                # First item in tier: include color change
                formatted_items.append(f"{current_color}{freq_indicator} {text}")
            else:
                # Subsequent items: just use the indicator and text (color already set)
                formatted_items.append(f"{freq_indicator} {text}")
    
    # Add final reset at the end
    if formatted_items:
        formatted_items[-1] += "\033[0m"
    
    # Calculate optimal number of columns based on content width
    # Target max width of 48 characters for the table
    max_table_width = 48
    column_spacing = 2  # Space between columns
    
    # Find the longest item to estimate column width
    if not formatted_items:
        return f"```\nNo results found for pattern: {pattern}\n```"
    
    max_item_width = max(get_display_width(item) for item in raw_items[:requested_count])
    
    # Calculate how many columns we can fit
    if max_item_width + column_spacing > max_table_width:
        num_columns = 1
    else:
        # Estimate columns: (width + spacing) * cols - spacing <= max_width
        num_columns = min(3, (max_table_width + column_spacing) // (max_item_width + column_spacing))
        num_columns = max(1, num_columns)  # At least 1 column
    
    # If we have very short words, allow more than 3 columns
    if max_item_width <= 8:
        num_columns = min(6, (max_table_width + column_spacing) // (max_item_width + column_spacing))
    
    # Determine how many results to actually use
    # Fill out partial rows if we have extra results
    base_results = requested_count
    rows_needed = (base_results + num_columns - 1) // num_columns
    total_slots = rows_needed * num_columns
    
    # Use extra results to fill out the last row if available
    results_to_use = min(len(formatted_items), total_slots)
    display_items = formatted_items[:results_to_use]
    
    # Create column data
    columns = [[] for _ in range(num_columns)]
    for i, item in enumerate(display_items):
        col_index = i % num_columns
        columns[col_index].append(item)
    
    # Pad columns to same length
    max_col_length = max(len(col) for col in columns) if columns else 0
    for col in columns:
        while len(col) < max_col_length:
            col.append("")
    
    # Calculate actual column widths based on display width
    col_widths = []
    for col in columns:
        if col and any(item for item in col):  # Check if column has any non-empty items
            max_width = max(get_display_width(item) for item in col if item)
            col_widths.append(max(max_width, 6))  # Minimum width of 6
        else:
            col_widths.append(6)
    
    # Build the formatted table
    table_lines = []
    for row_idx in range(max_col_length):
        row_parts = []
        for col_idx, col in enumerate(columns):
            if row_idx < len(col) and col[row_idx]:
                item = col[row_idx]
                # Calculate padding needed based on display width
                display_width = get_display_width(item)
                padding_needed = max(0, col_widths[col_idx] - display_width)
                padded_item = item + (" " * padding_needed)
                row_parts.append(padded_item)
            else:
                row_parts.append(" " * col_widths[col_idx])
        
        table_lines.append("  ".join(row_parts).rstrip())
    
    header += f"-# {dictionary.title()} dictionary • {results_to_use} {'result' if results_to_use == 1 else 'results'}\n"

    # Create footer with less prominent info
    footer = f""
    
    # Combine everything
    result_text = header + "```ansi\n" + "\n".join(table_lines) + "\n```" + footer
    
    # Ensure we don't exceed Discord's 2000 character limit
    if len(result_text) > 1950:
        # Reduce results and try again
        reduced_count = requested_count - num_columns
        return format_results_multicolumn(results, pattern, dictionary, total_results, format_type, reduced_count)
    
    return result_text

@bot.event
async def on_ready():
    """Called when the bot is ready"""
    logger.info(f'{bot.user} has connected to Discord!')
    logger.info(f'Bot is in {len(bot.guilds)} guilds')

@bot.tree.command(name="words", description="Search for word patterns using Nutrimatic syntax")
@app_commands.describe(
    pattern="Search pattern (e.g., 'cat', 'C*t', '<listen>', '_____')",
    dictionary="Dictionary to search (12dicts or wikipedia)",
    max_results="Maximum number of results (1-256)",
    format="Output format (friendly with columns/emojis or raw word list)"
)
@app_commands.choices(dictionary=[
    app_commands.Choice(name="12Dicts (curated)", value="12dicts"),
    app_commands.Choice(name="Wikipedia (comprehensive)", value="wikipedia")
])
@app_commands.choices(format=[
    app_commands.Choice(name="Friendly (columns with emojis)", value="friendly"),
    app_commands.Choice(name="Raw (simple word list)", value="raw")
])
async def words_slash(interaction: discord.Interaction, pattern: str, dictionary: str = DEFAULT_DICTIONARY, max_results: int = 25, format: str = "friendly"):
    """
    Search for word patterns using Nutrimatic syntax
    
    Examples:
    /words pattern:cat - Find words containing "cat"
    /words pattern:C*t - Words starting with consonants, ending with t
    /words pattern:<listen> - Anagrams of "listen"
    /words pattern:_____ - 5-letter words
    """
    
    # Validate max_results
    if max_results < 1 or max_results > 256:
        await interaction.response.send_message("❌ Max results must be between 1 and 256.", ephemeral=True)
        return
    
    # Defer the response since search might take time
    await interaction.response.defer()
    
    try:
        async with NutrimaticAPI(API_BASE_URL) as api:
            # Search for the pattern
            result = await api.search_pattern(pattern, dictionary, max_results)
            
            if result.get('error'):
                await interaction.followup.send(f"❌ Search error: {result['error']}")
                return
            
            # Format and send results
            formatted_results = format_results_multicolumn(
                result.get('results', []),
                pattern,
                result.get('dictionary', dictionary),
                result.get('total_results', 0),
                format,
                max_results
            )
            
            await interaction.followup.send(formatted_results)
            
    except Exception as e:
        logger.error(f"Error in words command: {e}")
        await interaction.followup.send(f"❌ An unexpected error occurred: {str(e)}")

@bot.tree.command(name="help", description="Show Nutrimatic pattern syntax guide")
async def help_slash(interaction: discord.Interaction):
    """Show detailed pattern syntax help"""
    
    help_text = """🔍 **Nutrimatic Pattern Syntax Guide**

**Basic Characters:**
```
.     Any character
_     Any letter or number
#     Any digit (0-9)
A     Any letter
C     Any consonant (including Y)
V     Any vowel (excluding Y)
-     Optional space
```

**Repetition:**
```
*     Zero or more of previous
+     One or more of previous  
?     Zero or one of previous
{3}   Exactly 3 of previous
{2,5} Between 2 and 5 of previous
{3,}  3 or more of previous
```

**Character Sets:**
```
[abc]    Any of: a, b, or c
[^abc]   Any except: a, b, or c
[a-z]    Any letter from a to z
[0-9]    Any digit
```

**Advanced Patterns:**
```
<word>      Anagrams of "word"
"phrase"    Exact phrase (no auto spaces)
(A|B)       Either A or B
A & B       Both A and B (intersection)
```

**Examples:**
```
/words pattern:<silent>        # Anagrams: listen, enlist, silent
/words pattern:c.*t            # Cat, cart, coat, count, etc.
/words pattern:_____           # All 5-letter words
/words pattern:V.*ing          # Words starting with vowel, ending "ing"
/words pattern:[^a]*a[^a]*     # Words with exactly one 'a'
```"""
    
    await interaction.response.send_message(help_text, ephemeral=True)

@bot.tree.command(name="ping", description="Check if the bot is responsive")
async def ping_slash(interaction: discord.Interaction):
    """Simple ping command to test bot responsiveness"""
    latency = round(bot.latency * 1000)
    await interaction.response.send_message(f"🏓 Pong! Latency: {latency}ms", ephemeral=True)

@bot.tree.command(name="status", description="Check bot and API status")
async def status_slash(interaction: discord.Interaction):
    """Check the status of the bot and Nutrimatic API"""
    
    await interaction.response.defer(ephemeral=True)
    
    try:
        async with NutrimaticAPI(API_BASE_URL) as api:
            # Test API connectivity with a simple search
            result = await api.search_pattern("test", DEFAULT_DICTIONARY, 1)
            
            if result.get('error'):
                status_msg = f"✅ **Bot Status:** Online\n❌ **API Status:** Error - {result['error']}"
            else:
                status_msg = f"✅ **Bot Status:** Online\n✅ **API Status:** Connected"
                status_msg += f"\n📚 **Dictionary:** {DEFAULT_DICTIONARY.title()}"
                status_msg += f"\n🔍 **Max Results:** {MAX_RESULTS}"
            
            await interaction.followup.send(status_msg)
            
    except Exception as e:
        logger.error(f"Error in status command: {e}")
        await interaction.followup.send(f"✅ **Bot Status:** Online\n❌ **API Status:** Connection failed - {str(e)}")

@bot.tree.command(name="encode", description="Encode text into various common encoding schemes.")
@app_commands.describe(
    text="Text to encode (A-Z, 0-9). Defaults to A-Z 0-9 if not provided.",
    encoding="Encoding scheme to use."
)
@app_commands.choices(encoding=[
    app_commands.Choice(name=choice["name"], value=choice["value"]) 
    for choice in get_encoding_choices()
])
async def encode_slash(interaction: discord.Interaction, encoding: str, text: Optional[str] = None):
    """Encode text using a specified scheme."""
    if text is None:
        text_to_encode = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    else:
        text_to_encode = text

    # Validate input text (allow only A-Z, 0-9, space for now)
    if not re.match(r"^[A-Z0-9 ]*$", text_to_encode.upper()):
        await interaction.response.send_message(
            "❌ Invalid input. Only A-Z, 0-9, and spaces are currently supported for encoding.",
            ephemeral=True
        )
        return

    await interaction.response.defer()

    try:
        encoded_output = encode_text(text_to_encode, encoding)
        
        if len(encoded_output) > 1800: # Discord character limit is 2000, save space for embed
            encoded_output = encoded_output[:1800] + "\n... (output truncated)"

        embed = discord.Embed(
            title=f"{encoding.title()} Encoding",
            description=f"Original Text: `{text_to_encode}`",
            color=discord.Color.blue()
        )
        embed.add_field(name="Encoded Output", value=f"```{encoded_output}```", inline=False)
        
        await interaction.followup.send(embed=embed)

    except Exception as e:
        logger.error(f"Error in encode command: {e}")
        await interaction.followup.send(f"❌ An unexpected error occurred during encoding: {str(e)}")

# Keep the old prefix commands for backward compatibility (optional)
@bot.command(name='sync', help='Sync slash commands (admin only)')
@commands.is_owner()
async def sync_commands(ctx):
    """Sync slash commands with Discord (owner only)"""
    try:
        synced = await bot.tree.sync()
        await ctx.send(f"✅ Synced {len(synced)} command(s)")
        logger.info(f"Manually synced {len(synced)} command(s)")
    except Exception as e:
        await ctx.send(f"❌ Failed to sync commands: {e}")
        logger.error(f"Failed to manually sync commands: {e}")

def main():
    """Main function to run the bot"""
    
    if not DISCORD_TOKEN:
        logger.error("DISCORD_BOT_TOKEN environment variable not set!")
        return
    
    logger.info(f"Starting Nutrimatic Discord Bot with slash commands...")
    logger.info(f"API URL: {API_BASE_URL}")
    logger.info(f"Default Dictionary: {DEFAULT_DICTIONARY}")
    
    try:
        bot.run(DISCORD_TOKEN)
    except Exception as e:
        logger.error(f"Failed to start bot: {e}")

if __name__ == "__main__":
    main()
