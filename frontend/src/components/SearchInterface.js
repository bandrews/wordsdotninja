import React, { useState, useCallback, useEffect } from 'react';
import {
  Paper,
  TextField,
  Box,
  Alert,
  AlertTitle,
  CircularProgress,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Button,
} from '@mui/material';
import { Search as SearchIcon, Refresh as RefreshIcon, CloudOff as CloudOffIcon } from '@mui/icons-material';
import SearchResults from './SearchResults';
import { searchPatterns, getDictionaries } from '../services/api';

// Helper to get/set dictionary preference from localStorage
const DICT_PREF_KEY = 'nutrimatic-dictionary';
const getSavedDictionary = () => localStorage.getItem(DICT_PREF_KEY) || 'wikipedia';
const saveDictionary = (dict) => localStorage.setItem(DICT_PREF_KEY, dict);

function SearchInterface({ onSearchPerformed, isLandingPage, onDictionaryStateChange, externalDictionary }) {
  const [query, setQuery] = useState('');
  const [selectedDictionary, setSelectedDictionary] = useState(() => {
    // Priority: URL param > localStorage > default
    const urlDict = new URLSearchParams(window.location.search).get('dict');
    return urlDict || getSavedDictionary();
  });
  const [dictionaries, setDictionaries] = useState([]);
  const [dictionariesLoading, setDictionariesLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backendError, setBackendError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [searchStats, setSearchStats] = useState(null);

  // Report dictionary list and loading state to parent (for Header on mobile)
  // Only report dictionaries and loading - NOT selectedDictionary to avoid loops
  useEffect(() => {
    if (onDictionaryStateChange) {
      onDictionaryStateChange({
        dictionaries,
        dictionariesLoading
      });
    }
  }, [dictionaries, dictionariesLoading, onDictionaryStateChange]);

  // React to external dictionary changes (from Header on mobile)
  useEffect(() => {
    if (externalDictionary && externalDictionary !== selectedDictionary) {
      setSelectedDictionary(externalDictionary);
      saveDictionary(externalDictionary);
      // Re-run search if there's an active query
      if (query.trim()) {
        handleSearch(query, true, externalDictionary);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalDictionary]);

  // Load dictionaries
  const loadDictionaries = useCallback(async () => {
    setDictionariesLoading(true);
    setBackendError(null);
    try {
      const response = await getDictionaries();
      setDictionaries(response.dictionaries);

      // Validate saved dictionary exists, otherwise use default
      const savedDict = getSavedDictionary();
      const urlDict = new URLSearchParams(window.location.search).get('dict');
      const targetDict = urlDict || savedDict;

      const dictExists = response.dictionaries.find(d => d.id === targetDict && d.available);
      if (!dictExists) {
        const defaultDict = response.dictionaries.find(d => d.default && d.available);
        if (defaultDict) {
          setSelectedDictionary(defaultDict.id);
          saveDictionary(defaultDict.id);
        }
      }
      return response.dictionaries;
    } catch (err) {
      console.error('Failed to load dictionaries:', err);
      if (err.isNetworkError) {
        setBackendError(err.message);
      } else {
        setBackendError('Unable to connect to the search service. Please try again.');
      }
      return [];
    } finally {
      setDictionariesLoading(false);
    }
  }, []);

  // Execute search based on URL parameters (does NOT update URL)
  const executeSearchFromURL = useCallback(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlQuery = urlParams.get('q') || '';
    const urlDict = urlParams.get('dict') || 'wikipedia';

    // Update input field to match URL
    setQuery(urlQuery);
    setSelectedDictionary(urlDict);

    if (!urlQuery.trim()) {
      // No query - clear results
      setResults([]);
      setSearchStats(null);
      setError(null);
      setHasMore(false);
      return;
    }

    // Execute the search
    setLoading(true);
    setResults([]);
    setError(null);
    setSearchStats(null);

    try {
      const response = await searchPatterns(urlQuery, 50, 0, 1000000, urlDict);

      if (response.error) {
        setError(response.error);
        setHasMore(false);
      } else {
        setResults(response.results);
        setHasMore(response.results.length === 50 && !response.computation_limit_reached);
        setSearchStats({
          query: response.query,
          dictionary: response.dictionary,
          totalResults: response.total_results,
          computationLimitReached: response.computation_limit_reached,
        });
      }
    } catch (err) {
      setError('Failed to search. Please check your connection and try again.');
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load: load dictionaries, then execute search if URL has query
  useEffect(() => {
    loadDictionaries().then(() => {
      executeSearchFromURL();
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      executeSearchFromURL();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [executeSearchFromURL]);

  // Update URL when user submits a search (pushes to history)
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
    saveDictionary(newDictionary); // Save preference to localStorage

    // If there's an active search, re-run it with the new dictionary
    if (query.trim()) {
      handleSearch(query, true, newDictionary);
    }
  };

  const getSelectedDictionaryInfo = () => {
    return dictionaries.find(d => d.id === selectedDictionary);
  };

  // Backend error component
  const BackendErrorDisplay = () => (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        textAlign: 'center',
        bgcolor: 'error.light',
        color: 'error.contrastText',
        borderRadius: 2
      }}
    >
      <CloudOffIcon sx={{ fontSize: 64, mb: 2, opacity: 0.8 }} />
      <Typography variant="h5" gutterBottom>
        Service Unavailable
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
        {backendError}
      </Typography>
      <Button
        variant="contained"
        color="inherit"
        startIcon={<RefreshIcon />}
        onClick={loadDictionaries}
        disabled={dictionariesLoading}
        sx={{
          bgcolor: 'white',
          color: 'error.main',
          '&:hover': { bgcolor: 'grey.100' }
        }}
      >
        {dictionariesLoading ? 'Retrying...' : 'Retry Connection'}
      </Button>
    </Paper>
  );

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
            🥷 words.ninja
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

        {/* Backend Error State */}
        {backendError && !dictionariesLoading && (
          <BackendErrorDisplay />
        )}

        {/* Loading State */}
        {dictionariesLoading && !backendError && (
          <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography color="text.secondary">
              Connecting to search service...
            </Typography>
          </Paper>
        )}

        {/* Search Form - only show when backend is available */}
        {!backendError && !dictionariesLoading && (
          <Paper elevation={2} sx={{ p: 2 }}>
            <Box component="form" onSubmit={handleSubmit}>
              {/* Desktop: all in one row. Mobile: search on top, button below */}
              <Box sx={{
                display: 'flex',
                gap: 1.5,
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: { md: 'flex-start' }
              }}>
                {/* Search input - grows to fill space on desktop */}
                <TextField
                  variant="outlined"
                  placeholder="Enter pattern (e.g., <listen> for anagrams)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                  inputProps={{
                    autoCorrect: 'off',
                    autoCapitalize: 'off',
                    spellCheck: 'false',
                    'data-form-type': 'other',
                    'data-lpignore': 'true',
                  }}
                  sx={{
                    flex: { md: 1 },
                    width: { xs: '100%', md: 'auto' },
                    '& .MuiOutlinedInput-root': {
                      fontSize: '1rem',
                      py: 0.4
                    }
                  }}
                  autoFocus
                  autoComplete="off"
                />

                {/* Dictionary selector - always shown on landing page */}
                <FormControl
                  variant="outlined"
                  size="small"
                  sx={{
                    minWidth: { xs: '100%', md: 180 },
                    display: 'flex'
                  }}
                >
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
                </FormControl>

                <Button
                  type="submit"
                  variant="contained"
                  size="medium"
                  disabled={!query.trim() || dictionariesLoading}
                  sx={{
                    minWidth: { xs: '100%', md: 120 },
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 500,
                    py: 1,
                    height: { md: '40px' }
                  }}
                >
                  Search
                </Button>
              </Box>

              {/* Dictionary description */}
              {getSelectedDictionaryInfo() && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {getSelectedDictionaryInfo().description}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        )}

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
      {/* Backend Error State */}
      {backendError && !dictionariesLoading && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={loadDictionaries}
            >
              Retry
            </Button>
          }
        >
          <AlertTitle>Connection Error</AlertTitle>
          {backendError}
        </Alert>
      )}

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
              inputProps={{
                autoCorrect: 'off',
                autoCapitalize: 'off',
                spellCheck: 'false',
                'data-form-type': 'other',
                'data-lpignore': 'true',
              }}
              autoComplete="off"
              disabled={!!backendError}
            />

            {/* Dictionary selector - hidden on mobile (it's in the header) */}
            <FormControl
              variant="outlined"
              size="small"
              sx={{
                minWidth: 120,
                display: { xs: 'none', sm: 'flex' }
              }}
            >
              <Select
                value={selectedDictionary}
                onChange={handleDictionaryChange}
                disabled={dictionariesLoading || !!backendError}
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
              disabled={!query.trim() || dictionariesLoading || !!backendError}
              sx={{
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 500,
                minWidth: { xs: 60, sm: 70 }
              }}
            >
              Search
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Error Display */}
      {error && !backendError && (
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