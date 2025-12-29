import React, { useState, useEffect } from 'react';
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

function App() {
  const [quickRefOpen, setQuickRefOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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

  // Initial landing page layout
  if (!hasSearched) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
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

          {/* Footer */}
          <Box
            component="footer"
            sx={{
              py: 1,
              px: 2,
              backgroundColor: 'background.paper',
              borderTop: 1,
              borderColor: 'divider',
              textAlign: 'center',
              color: 'text.secondary',
              fontSize: '0.7rem',
            }}
          >
            <Box sx={{ mb: 0.5 }}>
              <em>Almost, but not quite, entirely unlike tea.</em>
            </Box>
            <Box>
              Powered by{' '}
              <a 
                href="https://github.com/egnor/nutrimatic" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  color: 'inherit', 
                  textDecoration: 'underline',
                  textDecorationColor: 'rgba(0,0,0,0.3)'
                }}
              >
                Nutrimatic
              </a>
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  // Post-search layout with header
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header onQuickRefClick={handleQuickRefToggle} />
        
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
    </ThemeProvider>
  );
}

export default App; 