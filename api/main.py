"""
Nutrimatic Backend Service

A FastAPI-based web service that wraps the Nutrimatic C++ find-expr binary
to provide a modern REST API for word pattern searching.
"""

import asyncio
import os
import signal
import subprocess
import logging
from typing import Optional, AsyncGenerator, List, Dict, Any, Union
import resource

from fastapi import FastAPI, Query, HTTPException, BackgroundTasks, Request, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel, Field
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Nutrimatic API",
    description="Word pattern search API for puzzles, crosswords, and word games",
    version="2.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins since we're using relative URLs
    allow_credentials=True,
    allow_methods=["GET", "POST", "HEAD"],  # Explicitly added HEAD
    allow_headers=["*"],
)

# Configuration
MAX_COMPUTATION = int(os.getenv("NUTRIMATIC_MAX_COMPUTATION", "1000000"))
CPU_LIMIT = int(os.getenv("NUTRIMATIC_CPU_LIMIT", "30"))
MEMORY_LIMIT = int(os.getenv("NUTRIMATIC_MEMORY_LIMIT", "2147483648"))  # 2GB
FIND_EXPR_BINARY = os.getenv("NUTRIMATIC_FIND_EXPR", "find-expr")

# Dictionary configuration with logarithmic scale mapping
DICTIONARIES = {
    "wikipedia": {
        "name": "Wikipedia",
        "description": "Large comprehensive dictionary from Wikipedia text",
        "file": "/data/wikipedia.index",
        "default": True,
        "scale_mapping": {
            # Wikipedia score ranges - logarithmic mapping to 1-10 dots
            "thresholds": [1, 10, 50, 100, 500, 1000, 2000, 5000, 10000, 50000],
            "max_expected": 100000
        }
    },
    "12dicts": {
        "name": "12Dicts",
        "description": "Curated word list with high-quality entries",
        "file": "/data/12dicts.index",
        "default": False,
        "scale_mapping": {
            # 12dicts score ranges - logarithmic mapping to 1-10 dots
            "thresholds": [0.1, 0.5, 1, 2, 5, 10, 15, 25, 35, 45],
            "max_expected": 50
        }
    }
}

# Response models
class SearchResult(BaseModel):
    text: str
    score: float
    rank: int

class SearchResponse(BaseModel):
    query: str
    dictionary: str
    results: List[SearchResult]
    total_results: int
    computation_limit_reached: bool
    error: Optional[str] = None

class Dictionary(BaseModel):
    id: str
    name: str
    description: str
    default: bool
    available: bool
    scale_mapping: dict

class DictionariesResponse(BaseModel):
    dictionaries: List[Dictionary]

def set_resource_limits():
    """Set CPU and memory limits for the process"""
    try:
        # Set CPU limit
        resource.setrlimit(resource.RLIMIT_CPU, (CPU_LIMIT, CPU_LIMIT))
        
        # Set memory limit
        resource.setrlimit(resource.RLIMIT_AS, (MEMORY_LIMIT, MEMORY_LIMIT))
        
        # Ignore SIGPIPE for subprocess communication
        signal.signal(signal.SIGPIPE, signal.SIG_DFL)
    except Exception as e:
        logger.warning(f"Failed to set resource limits: {e}")

async def run_find_expr(query: str, index_file: str, max_computation: int = MAX_COMPUTATION) -> AsyncGenerator[str, None]:
    """
    Run the find-expr binary and yield results line by line
    """
    try:
        # Create the subprocess
        process = await asyncio.create_subprocess_exec(
            FIND_EXPR_BINARY,
            index_file, 
            query,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            preexec_fn=set_resource_limits
        )
        
        # Read lines from stdout
        while True:
            line = await process.stdout.readline()
            if not line:
                break
                
            line_str = line.decode().strip()
            if not line_str:
                continue
                
            # Handle computation limit lines
            if line_str.startswith("#"):
                try:
                    computation_count = int(line_str[1:])
                    if computation_count >= max_computation:
                        yield f"#LIMIT_REACHED:{computation_count}"
                        break
                except ValueError:
                    pass
                continue
                
            yield line_str
            
        # Wait for process to complete
        await process.wait()
        
        # Check for errors
        if process.returncode != 0:
            stderr = await process.stderr.read()
            error_msg = stderr.decode().strip()
            if error_msg:
                yield f"#ERROR:{error_msg}"
            elif process.returncode == -signal.SIGXCPU:
                yield "#ERROR:Query timed out (too much CPU time)"
            elif process.returncode < 0:
                yield f"#ERROR:Process killed by signal {-process.returncode}"
            else:
                yield f"#ERROR:Process exited with code {process.returncode}"
                
    except FileNotFoundError:
        yield f"#ERROR:find-expr binary not found at {FIND_EXPR_BINARY}"
    except Exception as e:
        yield f"#ERROR:Unexpected error: {str(e)}"

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    # Check which dictionaries are available
    available_dicts = {}
    for dict_id, dict_info in DICTIONARIES.items():
        available_dicts[dict_id] = os.path.isfile(dict_info["file"])
    
    return {
        "status": "healthy",
        "find_expr_binary": FIND_EXPR_BINARY,
        "binary_exists": os.path.isfile(FIND_EXPR_BINARY),
        "dictionaries": available_dicts
    }

@app.get("/dictionaries", response_model=DictionariesResponse)
async def get_dictionaries():
    """Get available dictionaries"""
    dictionaries = []
    for dict_id, dict_info in DICTIONARIES.items():
        dictionaries.append(Dictionary(
            id=dict_id,
            name=dict_info["name"],
            description=dict_info["description"],
            default=dict_info["default"],
            available=os.path.isfile(dict_info["file"]),
            scale_mapping=dict_info["scale_mapping"]
        ))
    
    return DictionariesResponse(dictionaries=dictionaries)

@app.get("/search", response_model=SearchResponse)
async def search(
    q: str = Query(..., description="Search pattern"),
    dictionary: str = Query("wikipedia", description="Dictionary to search"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of results"),
    offset: int = Query(0, ge=0, description="Result offset for pagination"),
    max_computation: int = Query(MAX_COMPUTATION, description="Maximum computation limit")
):
    """
    Search for patterns (paginated version)
    """
    if not q.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    # Validate dictionary
    if dictionary not in DICTIONARIES:
        raise HTTPException(status_code=400, detail=f"Unknown dictionary: {dictionary}")
    
    dict_info = DICTIONARIES[dictionary]
    index_file = dict_info["file"]
    
    # Check if dictionary file exists
    if not os.path.isfile(index_file):
        raise HTTPException(status_code=404, detail=f"Dictionary file not found: {dict_info['name']}")
    
    results = []
    rank = 0
    computation_limit_reached = False
    error = None
    
    async for line in run_find_expr(q.strip(), index_file, max_computation):
        if line.startswith("#LIMIT_REACHED:"):
            computation_limit_reached = True
            break
        elif line.startswith("#ERROR:"):
            error = line[7:]  # Remove "#ERROR:" prefix
            break
            
        try:
            # Parse score and text
            parts = line.split(" ", 1)
            if len(parts) == 2:
                score = float(parts[0])
                text = parts[1]
                
                # Apply offset/limit
                if rank >= offset:
                    if len(results) >= limit:
                        break
                    results.append(SearchResult(text=text, score=score, rank=rank))
                rank += 1
        except (ValueError, IndexError):
            logger.warning(f"Failed to parse result line: {line}")
            continue
    
    return SearchResponse(
        query=q,
        dictionary=dictionary,
        results=results,
        total_results=rank,
        computation_limit_reached=computation_limit_reached,
        error=error
    )

@app.get("/search/stream")
async def search_stream(
    q: str = Query(..., description="Search pattern"),
    dictionary: str = Query("wikipedia", description="Dictionary to search"),
    max_computation: int = Query(MAX_COMPUTATION, description="Maximum computation limit")
):
    """
    Stream search results for infinite scroll
    """
    if not q.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    # Validate dictionary
    if dictionary not in DICTIONARIES:
        raise HTTPException(status_code=400, detail=f"Unknown dictionary: {dictionary}")
    
    dict_info = DICTIONARIES[dictionary]
    index_file = dict_info["file"]
    
    # Check if dictionary file exists
    if not os.path.isfile(index_file):
        raise HTTPException(status_code=404, detail=f"Dictionary file not found: {dict_info['name']}")

    async def generate_results():
        rank = 0
        async for line in run_find_expr(q.strip(), index_file, max_computation):
            if line.startswith("#LIMIT_REACHED:"):
                yield f"data: {{'type': 'limit_reached', 'computation': {line.split(':')[1]}}}\n\n"
                break
            elif line.startswith("#ERROR:"):
                error_msg = line[7:]  # Remove "#ERROR:" prefix
                yield f"data: {{'type': 'error', 'message': '{error_msg}'}}\n\n"
                break
                
            try:
                # Parse score and text
                parts = line.split(" ", 1)
                if len(parts) == 2:
                    score = float(parts[0])
                    text = parts[1].replace("'", "\\'")  # Escape quotes for JSON
                    
                    yield f"data: {{'type': 'result', 'data': {{'text': '{text}', 'score': {score}, 'rank': {rank}}}}}\n\n"
                    rank += 1
            except (ValueError, IndexError):
                logger.warning(f"Failed to parse result line: {line}")
                continue
        
        yield f"data: {{'type': 'done'}}\n\n"

    return StreamingResponse(
        generate_results(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )

# MCP Server Implementation
# Model Context Protocol endpoints for AI agents

class MCPToolParameter(BaseModel):
    type: str
    description: str
    required: Optional[bool] = None

class MCPTool(BaseModel):
    name: str
    description: str
    inputSchema: Dict[str, Any]
    outputSchema: Dict[str, Any]

class MCPManifest(BaseModel):
    schemaVersion: str = "2024-11-05"
    vendor: str = "Nutrimatic"
    name: str = "nutrimatic-search"
    version: str = "2.0.0"
    description: str
    tools: List[MCPTool]

class MCPToolCallRequest(BaseModel):
    name: str
    arguments: Dict[str, Any]

class MCPToolCallResponse(BaseModel):
    content: List[Dict[str, Any]]
    isError: Optional[bool] = False

# Pattern syntax documentation for AI agents
PATTERN_SYNTAX_DOCS = """
Nutrimatic Pattern Syntax Quick Reference:

QUERY TYPES:
- <abc>: Anagram (e.g., <cat> → act, tac)
- "text": Exact phrase (e.g., "the cat")
- A & B: Both patterns must match (e.g., C*t & *a*)
- A | B: Either pattern matches (e.g., cat|dog)
- (): Group patterns (e.g., (cat|dog)s)

CHARACTER CLASSES:
- .: Any character (e.g., c.t → cat, cut, cot)
- _: Letter or number (e.g., c_t → cat, c3t)
- #: Any digit (e.g., room #)
- A: Any letter (e.g., cAt → cat, cbt)
- C: Consonant including y (e.g., CaC → cat, bay)
- V: Vowel a,e,i,o,u only (e.g., cVt → cat, cut)
- [abc]: Any of these characters (e.g., [aeiou])
- [^abc]: None of these characters (e.g., [^aeiou])
- [a-z]: Character range (e.g., [a-m])
- -: Optional space (e.g., cat-dog)

REPETITION:
- *: Zero or more (e.g., cat.* → cat, cats, caterpillar)
- +: One or more (e.g., cat.+ → cats, caterpillar)
- ?: Optional (e.g., cats? → cat, cats)
- {3}: Exactly 3 times (e.g., A{3} → cat, dog)
- {2,5}: 2 to 5 times (e.g., C{2,5} → cc,ddd,fffff)
- {3,}: 3 or more times (e.g., V{3,} → ooo, aaa)

TIPS:
- Start patterns are faster: "the.*" vs ".*ing"
- Use quotes for exact phrases: "the cat"
- Y is treated as a consonant, not vowel
- Combine with &: "C*t & *a*"
- Scores indicate frequency/commonality in the corpus
"""

# -- MCP Pydantic Models --

# Model for parameters of the nutrimatic_search tool
class NutrimaticSearchParams(BaseModel):
    pattern: str
    dictionary: Optional[str] = Field("wikipedia", description="Dictionary to search.", pattern="^(wikipedia|12dicts)$")
    max_results: Optional[int] = Field(10, ge=1, le=100, description="Maximum number of results (1-100).")

# Models for JSON-RPC 2.0
class JsonRpcRequest(BaseModel):
    jsonrpc: str = "2.0"
    method: str
    params: Optional[Union[Dict[str, Any], List[Any]]] = None # params can be object or array
    id: Optional[Union[str, int]] = None

class InitializeResult(BaseModel):
    protocolVersion: str = "2024-11-05"
    serverInfo: Dict[str, Any] = {
        "name": "Nutrimatic MCP Server",
        "version": "2.0.0" # Corresponds to manifest version
    }
    capabilities: Dict[str, Any] = Field(default_factory=lambda: {"tools": {}}) # Updated capabilities
    # schemas: Optional[Dict[str, Any]] = None # Schemas can be returned here if dynamic

class JsonRpcErrorObject(BaseModel):
    code: int
    message: str
    data: Optional[Any] = None

class JsonRpcResponse(BaseModel):
    jsonrpc: str = "2.0"
    result: Optional[Any] = None
    error: Optional[JsonRpcErrorObject] = None
    id: Union[str, int, None]

# Internal helper function for nutrimatic search logic
async def nutrimatic_search_internal(
    pattern: str,
    dictionary_name: str,
    max_results: int,
    include_metadata: bool = False # Parameter for future use, not currently used by MCP output
) -> List[SearchResult]:
    if not pattern.strip():
        raise HTTPException(status_code=400, detail="Pattern cannot be empty")

    if dictionary_name not in DICTIONARIES:
        raise HTTPException(status_code=400, detail=f"Unknown dictionary: {dictionary_name}")

    dict_info = DICTIONARIES[dictionary_name]
    index_file = dict_info["file"]

    if not os.path.isfile(index_file):
        raise HTTPException(status_code=404, detail=f"Dictionary file not found: {dict_info['name']}")

    results: List[SearchResult] = []
    rank = 0 # For SearchResult model, though MCP output doesn't use rank directly
    # computation_limit_reached = False # Not directly exposed in MCP success result, error handles it
    # error = None # Handled by exceptions or specific error returns

    async for line in run_find_expr(pattern.strip(), index_file, MAX_COMPUTATION):
        if line.startswith("#LIMIT_REACHED:"):
            # If limit is reached before any results, this could be an error or empty result based on requirements
            # For now, we just stop collecting. If results are empty, it implies limit before valid items.
            # computation_limit_reached = True
            break
        elif line.startswith("#ERROR:"):
            # error_detail = line[7:]
            raise HTTPException(status_code=500, detail=f"Search backend error: {line[7:]}")
            
        try:
            parts = line.split(" ", 1)
            if len(parts) == 2:
                score_val = float(parts[0])
                text_val = parts[1]
                
                if score_val >= 1.0: # MCP requirement: score >= 1.0
                    results.append(SearchResult(text=text_val, score=score_val, rank=rank))
                    rank += 1 # rank is for the SearchResult model, not strictly for MCP output array index
                    if len(results) >= max_results:
                        break 
        except (ValueError, IndexError) as e:
            logger.warning(f"Failed to parse result line during internal search: {line}, Error: {e}")
            continue
    
    return results

mcp_service_router = APIRouter()

@mcp_service_router.get("/mcp", response_model=MCPManifest, summary="MCP Manifest")
async def get_mcp_manifest_for_service():
    """
    MCP manifest endpoint - provides tool definitions for AI agents
    Accessible via GET /api/mcp (externally through nginx)
    """
    return MCPManifest(
        description=PATTERN_SYNTAX_DOCS,
        tools=[
            MCPTool(
                name="nutrimatic_search",
                description="Search Nutrimatic word databases. Supports anagrams, wildcards, boolean logic, etc. See main manifest description for full syntax.",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "pattern": {
                            "type": "string",
                            "description": "The search pattern (e.g., '<listen>', 'c*t')."
                        },
                        "dictionary": {
                            "type": "string",
                            "enum": ["wikipedia", "12dicts"],
                            "default": "wikipedia",
                            "description": "Dictionary ('wikipedia' or '12dicts')."
                        },
                        "max_results": {
                            "type": "integer",
                            "default": 10,
                            "minimum": 1,
                            "maximum": 100,
                            "description": "Max results (1-100)."
                        }
                    },
                    "required": ["pattern"]
                },
                outputSchema={
                    "type": "object",
                    "properties": {
                        "content": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "type": {
                                        "type": "string",
                                        "enum": ["text"]
                                    },
                                    "text": {
                                        "type": "string"
                                    }
                                },
                                "required": ["type", "text"]
                            }
                        }
                    },
                    "required": ["content"]
                }
            )
        ]
    )

@mcp_service_router.post("/mcp", response_model=JsonRpcResponse, summary="MCP JSON-RPC Endpoint", response_model_exclude_none=True)
async def handle_mcp_rpc(request_data: JsonRpcRequest):
    logging.info(f"MCP RPC call received: method='{request_data.method}', id='{request_data.id}'")
    if request_data.params:
        logging.debug(f"MCP RPC params: {request_data.params}")

    if request_data.method == "initialize":
        client_info = {}
        if isinstance(request_data.params, dict):
            client_info = request_data.params.get("clientInfo", {})
            client_protocol = request_data.params.get("protocolVersion", "N/A")
        logging.info(f"MCP Initialize from: {client_info.get('name', 'Unknown')} v{client_info.get('version', 'N/A')}, client protocol: {client_protocol}")
        
        return JsonRpcResponse(
            result=InitializeResult().model_dump(), 
            id=request_data.id
        )
    
    elif request_data.method == "nutrimatic_search":
        if not isinstance(request_data.params, dict):
            return JsonRpcResponse(
                error=JsonRpcErrorObject(code=-32602, message="Invalid params: Expected object for nutrimatic_search parameters."),
                id=request_data.id
            )
        try:
            tool_params = NutrimaticSearchParams(**request_data.params)
        except ValidationError as e:
            logging.warning(f"MCP nutrimatic_search param validation error: {e.errors()}", exc_info=False)
            return JsonRpcResponse(
                error=JsonRpcErrorObject(code=-32602, message="Invalid parameters for nutrimatic_search.", data=e.errors()),
                id=request_data.id
            )

        try:
            # Ensure dictionary parameter name matches nutrimatic_search_internal
            search_results_objects: List[SearchResult] = await nutrimatic_search_internal(
                pattern=tool_params.pattern,
                dictionary_name=tool_params.dictionary, # Align with nutrimatic_search_internal's param
                max_results=tool_params.max_results,
                include_metadata=False 
            )
            # Convert List[SearchResult] to list of dicts {text, score}
            output_results_list = [{"text": r.text, "score": r.score} for r in search_results_objects]
            
            # Format as Markdown string
            markdown_output = f"Found {len(output_results_list)} results:\n"
            if not output_results_list:
                markdown_output = "No results found matching the criteria (score >= 1.0)."
            else:
                for item in output_results_list:
                    markdown_output += f"- {item['text']} (score: {item['score']:.2f})\n"
            
            # Return in proper MCP format: content should be array of content objects
            return JsonRpcResponse(result={
                "content": [
                    {
                        "type": "text",
                        "text": markdown_output
                    }
                ]
            }, id=request_data.id)
        
        except HTTPException as he:
            logging.error(f"MCP tool execution HTTPException for nutrimatic_search: {he.detail}", exc_info=True)
            return JsonRpcResponse(
                error=JsonRpcErrorObject(code=-32000, message="Tool execution failed.", data=str(he.detail)),
                id=request_data.id
            )
        except Exception as e:
            logging.error(f"MCP tool execution unexpected error for nutrimatic_search: {str(e)}", exc_info=True)
            return JsonRpcResponse(
                error=JsonRpcErrorObject(code=-32000, message="An unexpected error occurred during tool execution."),
                id=request_data.id
            )
    
    elif request_data.method == "tools/call": # Handle the generic tools/call wrapper
        logging.info(f"MCP tools/call received, id='{request_data.id}'")
        if not isinstance(request_data.params, dict):
            return JsonRpcResponse(
                error=JsonRpcErrorObject(code=-32602, message="Invalid params: Expected object for tools/call parameters."),
                id=request_data.id
            )

        tool_name = request_data.params.get("name")
        tool_arguments = request_data.params.get("arguments")

        if not tool_name or not isinstance(tool_arguments, dict):
            return JsonRpcResponse(
                error=JsonRpcErrorObject(code=-32602, message="Invalid params: 'name' and 'arguments' (object) are required for tools/call."),
                id=request_data.id
            )

        if tool_name == "nutrimatic_search":
            try:
                tool_params = NutrimaticSearchParams(**tool_arguments) # Use the extracted arguments
            except ValidationError as e:
                logging.warning(f"MCP nutrimatic_search (via tools/call) param validation error: {e.errors()}", exc_info=False)
                return JsonRpcResponse(
                    error=JsonRpcErrorObject(code=-32602, message="Invalid parameters for nutrimatic_search.", data=e.errors()),
                    id=request_data.id
                )
            try:
                search_results_objects: List[SearchResult] = await nutrimatic_search_internal(
                    pattern=tool_params.pattern,
                    dictionary_name=tool_params.dictionary,
                    max_results=tool_params.max_results,
                    include_metadata=False
                )
                output_results_list = [{"text": r.text, "score": r.score} for r in search_results_objects]
                
                # Format as Markdown string
                markdown_output = f"Found {len(output_results_list)} results:\n"
                if not output_results_list:
                    markdown_output = "No results found matching the criteria (score >= 1.0)."
                else:
                    for item in output_results_list:
                        markdown_output += f"- {item['text']} (score: {item['score']:.2f})\n"
                
                # Return in proper MCP format: content should be array of content objects
                return JsonRpcResponse(result={
                    "content": [
                        {
                            "type": "text",
                            "text": markdown_output
                        }
                    ]
                }, id=request_data.id)
            except HTTPException as he:
                logging.error(f"MCP tool execution (via tools/call) HTTPException for {tool_name}: {he.detail}", exc_info=True)
                return JsonRpcResponse(
                    error=JsonRpcErrorObject(code=-32000, message=f"Tool execution failed for {tool_name}.", data=str(he.detail)),
                    id=request_data.id
                )
            except Exception as e:
                logging.error(f"MCP tool execution (via tools/call) unexpected error for {tool_name}: {str(e)}", exc_info=True)
                return JsonRpcResponse(
                    error=JsonRpcErrorObject(code=-32000, message=f"An unexpected error occurred during {tool_name} execution."),
                    id=request_data.id
                )
        else:
            # Specific tool requested via tools/call not found
            return JsonRpcResponse(
                error=JsonRpcErrorObject(code=-32601, message=f"Tool '{tool_name}' not found within tools/call."),
                id=request_data.id
            )
    
    elif request_data.method == "tools/list": # Handle tools/list method
        logging.info(f"MCP tools/list call received, id='{request_data.id}'")
        # Construct the list of tools, similar to the manifest
        # but format as expected by tools/list result (usually an object with a 'tools' key)
        tools_list = [
            MCPTool(
                name="nutrimatic_search",
                description="Search Nutrimatic word databases. Supports anagrams, wildcards, boolean logic, etc. See main manifest description for full syntax.",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "pattern": {
                            "type": "string",
                            "description": "The search pattern (e.g., '<listen>', 'c*t')."
                        },
                        "dictionary": {
                            "type": "string",
                            "enum": ["wikipedia", "12dicts"],
                            "default": "wikipedia",
                            "description": "Dictionary ('wikipedia' or '12dicts')."
                        },
                        "max_results": {
                            "type": "integer",
                            "default": 10,
                            "minimum": 1,
                            "maximum": 100,
                            "description": "Max results (1-100)."
                        }
                    },
                    "required": ["pattern"]
                },
                outputSchema={
                    "type": "object",
                    "properties": {
                        "content": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "type": {
                                        "type": "string",
                                        "enum": ["text"]
                                    },
                                    "text": {
                                        "type": "string"
                                    }
                                },
                                "required": ["type", "text"]
                            }
                        }
                    },
                    "required": ["content"]
                }
            ).model_dump(exclude_none=True) # Use model_dump for clean dicts
        ]
        return JsonRpcResponse(result={"tools": tools_list}, id=request_data.id)
            
    else:
        logging.warning(f"MCP method not found: {request_data.method}")
        # For JSON-RPC, method not found should typically return HTTP 200,
        # with the error indicated in the JSON body.
        return JsonRpcResponse( # Return HTTP 200 with error in body
            error=JsonRpcErrorObject(code=-32601, message="Method not found."),
            id=request_data.id
        )

app.include_router(mcp_service_router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 