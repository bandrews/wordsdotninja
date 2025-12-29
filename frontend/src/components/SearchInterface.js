import React, { useState, useCallback, useEffect } from 'react';
import {
  Paper,
  TextField,
  Box,
  Alert,
  CircularProgress,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Button,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import SearchResults from './SearchResults';
import { searchPatterns, getDictionaries } from '../services/api';

function SearchInterface({ onSearchPerformed, isLandingPage }) {
  const [query, setQuery] = useState('');
  const [selectedDictionary, setSelectedDictionary] = useState('wikipedia');
  const [dictionaries, setDictionaries] = useState([]);
  const [dictionariesLoading, setDictionariesLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [searchStats, setSearchStats] = useState(null);

  // Load dictionaries and URL parameters on component mount
  useEffect(() => {
    const loadDictionaries = async () => {
      try {
        const response = await getDictionaries();
        setDictionaries(response.dictionaries);
        
        // Set default dictionary
        const defaultDict = response.dictionaries.find(d => d.default && d.available);
        if (defaultDict) {
          setSelectedDictionary(defaultDict.id);
        } else {
          // Fallback to first available dictionary
          const firstAvailable = response.dictionaries.find(d => d.available);
          if (firstAvailable) {
            setSelectedDictionary(firstAvailable.id);
          }
        }
      } catch (err) {
        console.error('Failed to load dictionaries:', err);
        setError('Failed to load dictionaries. Please refresh the page.');
      } finally {
        setDictionariesLoading(false);
      }
    };

    // Load URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const urlQuery = urlParams.get('q');
    const urlDict = urlParams.get('dict');
    
    if (urlQuery) {
      setQuery(urlQuery);
    }
    if (urlDict) {
      setSelectedDictionary(urlDict);
    }

    loadDictionaries();

    // Auto-search if query is in URL and we're not on landing page
    if (urlQuery && !isLandingPage) {
      // Delay to ensure dictionaries are loaded
      setTimeout(() => {
        handleSearch(urlQuery, true, urlDict || selectedDictionary);
      }, 100);
    }
  }, []);

  // Update URL when search is performed
  const updateURL = (searchQuery, dictionary) => {
    const url = new URL(window.location);
    url.searchParams.set('q', searchQuery);
    url.searchParams.set('dict', dictionary);
    window.history.pushState({}, '', url);
  };

  const handleSearch = useCallback(async (searchQuery, isNewSearch = true, dictionary = selectedDictionary) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setError(null);
      setHasMore(false);
      setSearchStats(null);
      return;
    }

    // Update URL with search parameters
    if (isNewSearch) {
      updateURL(searchQuery, dictionary);
    }

    // Notify parent that search was performed
    if (isNewSearch && onSearchPerformed) {
      onSearchPerformed();
    }

    if (isNewSearch) {
      setResults([]);
      setError(null);
      setSearchStats(null);
    }
    
    setLoading(true);

    try {
      const offset = isNewSearch ? 0 : results.length;
      const response = await searchPatterns(searchQuery, 50, offset, 1000000, dictionary);
      
      if (response.error) {
        setError(response.error);
        setHasMore(false);
      } else {
        const newResults = isNewSearch ? response.results : [...results, ...response.results];
        setResults(newResults);
        setHasMore(response.results.length === 50 && !response.computation_limit_reached);
        
        if (isNewSearch) {
          setSearchStats({
            query: response.query,
            dictionary: response.dictionary,
            totalResults: response.total_results,
            computationLimitReached: response.computation_limit_reached,
          });
        }
      }
    } catch (err) {
      setError('Failed to search. Please check your connection and try again.');
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [results, selectedDictionary, onSearchPerformed]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore && query.trim()) {
      handleSearch(query, false, selectedDictionary);
    }
  }, [loading, hasMore, query, selectedDictionary, handleSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(query, true, selectedDictionary);
  };

  const handleDictionaryChange = (event) => {
    const newDictionary = event.target.value;
    setSelectedDictionary(newDictionary);
    
    // If there's an active search, re-run it with the new dictionary
    if (query.trim()) {
      handleSearch(query, true, newDictionary);
    }
  };

  const getSelectedDictionaryInfo = () => {
    return dictionaries.find(d => d.id === selectedDictionary);
  };

  // Landing page layout - prominent search box
  if (isLandingPage) {
    return (
      <Box>
        {/* Hero section - more compact */}
        <Box sx={{ textAlign: 'center', mb: 1.5 }}>
          <Typography 
            variant="h2" 
            component="h1" 
            sx={{ 
              fontWeight: 300, 
              mb: 0.5,
              fontSize: { xs: '1.8rem', md: '2.5rem' }
            }}
          >
            words.ninja
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ 
              mb: 1.5,
              fontSize: { xs: '0.9rem', md: '1.1rem' }
            }}
          >
            Word pattern search for puzzles and crosswords
          </Typography>
        </Box>

        {/* Search Form */}
        <Paper elevation={2} sx={{ p: 2 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', gap: 2, mb: 1.5, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Enter your pattern (e.g., C*aC*eC*iC*oC*uC*yC* for facetiously)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    fontSize: '1rem',
                    py: 0.4
                  }
                }}
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
              
              <FormControl variant="outlined" sx={{ minWidth: { xs: '100%', sm: 180 } }}>
                <InputLabel>Dictionary</InputLabel>
                <Select
                  value={selectedDictionary}
                  onChange={handleDictionaryChange}
                  label="Dictionary"
                  disabled={dictionariesLoading}
                >
                  {dictionaries.map((dict) => (
                    <MenuItem 
                      key={dict.id} 
                      value={dict.id}
                      disabled={!dict.available}
                    >
                      {dict.name}
                      {dict.default && ' (Default)'}
                      {!dict.available && ' (Unavailable)'}
                    </MenuItem>
                  ))}
                </Select>
                {getSelectedDictionaryInfo() && (
                  <FormHelperText>
                    {getSelectedDictionaryInfo().description}
                  </FormHelperText>
                )}
              </FormControl>

              <Button
                type="submit"
                variant="contained"
                size="medium"
                disabled={!query.trim() || dictionariesLoading}
                sx={{ 
                  minWidth: { xs: '100%', sm: 100 },
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500
                }}
              >
                Search
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Box>
    );
  }

  // Header layout - compact search in header
  return (
    <Box>
      {/* Compact Search Form */}
      <Paper elevation={0} sx={{ p: 1, mb: 1, bgcolor: 'grey.50' }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Enter pattern..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            
            <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
              <Select
                value={selectedDictionary}
                onChange={handleDictionaryChange}
                disabled={dictionariesLoading}
                displayEmpty
              >
                {dictionaries.map((dict) => (
                  <MenuItem 
                    key={dict.id} 
                    value={dict.id}
                    disabled={!dict.available}
                  >
                    {dict.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              type="submit"
              variant="contained"
              size="small"
              disabled={!query.trim() || dictionariesLoading}
              sx={{ 
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 500,
                minWidth: 70
              }}
            >
              Search
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {error}
        </Alert>
      )}

      {/* Loading Indicator */}
      {loading && results.length === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <SearchResults
          results={results}
          hasMore={hasMore}
          loading={loading}
          onLoadMore={loadMore}
          searchStats={searchStats}
          selectedDictionary={getSelectedDictionaryInfo()}
        />
      )}

      {/* No Results */}
      {!loading && query.trim() && results.length === 0 && !error && (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No results found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Try a different pattern or check the quick reference for syntax examples.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}

export default SearchInterface; 