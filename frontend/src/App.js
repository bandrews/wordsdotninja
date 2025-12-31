import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Box,
  useMediaQuery
} from '@mui/material';
import SearchInterface from './components/SearchInterface';
import Header from './components/Header';
import QuickReference from './components/QuickReference';
import GuidePage from './components/GuidePage';
import Footer from './components/Footer';

// Create Material-UI theme with tighter spacing
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#fafafa',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingTop: '8px',
          paddingBottom: '8px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

// Helper to check if URL has a search query
const urlHasQuery = () => {
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  return q && q.trim() !== '';
};

// Search page component - handles landing and search results views
function SearchPage() {
  const [quickRefOpen, setQuickRefOpen] = useState(false);
  // Initialize hasSearched from URL - this is the source of truth
  const [hasSearched, setHasSearched] = useState(urlHasQuery);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Dictionary state shared between Header and SearchInterface
  // selectedDictionary is managed here; dictionaries/loading come from SearchInterface
  const [dictionaryState, setDictionaryState] = useState({
    dictionaries: [],
    dictionariesLoading: true
  });
  const [selectedDictionary, setSelectedDictionary] = useState(() => {
    // Initialize from URL or localStorage
    const urlDict = new URLSearchParams(window.location.search).get('dict');
    return urlDict || localStorage.getItem('nutrimatic-dictionary') || 'wikipedia';
  });

  // Listen for browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      // Derive view state from URL
      setHasSearched(urlHasQuery());
      // Sync dictionary from URL
      const urlDict = new URLSearchParams(window.location.search).get('dict');
      if (urlDict) {
        setSelectedDictionary(urlDict);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Show quick reference on first visit for desktop users
  useEffect(() => {
    const hasVisited = localStorage.getItem('nutrimatic-visited');
    if (!hasVisited && !isMobile) {
      setQuickRefOpen(true);
      localStorage.setItem('nutrimatic-visited', 'true');
    }
  }, [isMobile]);

  const handleSearchPerformed = () => {
    setHasSearched(true);
  };

  const handleQuickRefToggle = () => {
    setQuickRefOpen(!quickRefOpen);
  };

  // Called by SearchInterface to report dictionaries list and loading state
  const handleDictionaryStateChange = (state) => {
    setDictionaryState(state);
  };

  // Called by Header when user changes dictionary on mobile
  const handleHeaderDictionaryChange = (newDictionary) => {
    setSelectedDictionary(newDictionary);
    localStorage.setItem('nutrimatic-dictionary', newDictionary);
  };

  // Initial landing page layout
  if (!hasSearched) {
    return (
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default'
      }}>
        <Container maxWidth="lg" sx={{ flex: 1, display: 'flex', flexDirection: 'column', py: 1.5 }}>
          {/* Centered search interface - more compact */}
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minHeight: '30vh',  // Further reduced
            mb: 2
          }}>
            <SearchInterface
              onSearchPerformed={handleSearchPerformed}
              isLandingPage={true}
            />
          </Box>

          {/* Quick reference - full width for three columns */}
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <QuickReference
              open={quickRefOpen}
              onClose={() => setQuickRefOpen(false)}
              isMobile={isMobile}
              isLandingPage={true}
            />
          </Box>
        </Container>

        <Footer />
      </Box>
    );
  }

  // Post-search layout with header
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header
        onQuickRefClick={handleQuickRefToggle}
        dictionaries={dictionaryState.dictionaries}
        selectedDictionary={selectedDictionary}
        onDictionaryChange={handleHeaderDictionaryChange}
        dictionariesLoading={dictionaryState.dictionariesLoading}
      />

      <Container
        maxWidth="xl"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 1,
          py: 1,
        }}
      >
        {/* Main search interface */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <SearchInterface
            onSearchPerformed={handleSearchPerformed}
            isLandingPage={false}
            onDictionaryStateChange={handleDictionaryStateChange}
            externalDictionary={selectedDictionary}
          />
        </Box>

        {/* Quick reference sidebar */}
        <QuickReference
          open={quickRefOpen}
          onClose={() => setQuickRefOpen(false)}
          isMobile={isMobile}
          isLandingPage={false}
        />
      </Container>
    </Box>
  );
}

// Main App component with routing
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/guide" element={<GuidePage />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App; 