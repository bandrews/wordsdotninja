import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  CircularProgress,
  Button,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Chip,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';
import InfiniteScroll from 'react-infinite-scroll-component';

function SearchResults({ results, hasMore, loading, onLoadMore, searchStats, selectedDictionary }) {
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Get frequency level (1-10) using dictionary-specific logarithmic mapping
  const getFrequencyLevel = (score) => {
    if (!selectedDictionary?.scale_mapping) {
      // Fallback to simple thresholds if no mapping available
      if (score >= 1000) return 10;
      if (score >= 500) return 9;
      if (score >= 100) return 8;
      if (score >= 50) return 7;
      if (score >= 10) return 6;
      if (score >= 5) return 5;
      if (score >= 2) return 4;
      if (score >= 1) return 3;
      if (score >= 0.5) return 2;
      return 1;
    }

    const thresholds = selectedDictionary.scale_mapping.thresholds;
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (score >= thresholds[i]) {
        return i + 1; // Convert 0-based index to 1-based level
      }
    }
    return 1; // Minimum level
  };

  // Format score for display in pill
  const formatScore = (score) => {
    if (score >= 1000) return Math.round(score / 1000) + 'k';
    if (score >= 100) return Math.round(score);
    if (score >= 10) return Math.round(score);
    if (score >= 1) return score.toFixed(1);
    return score.toFixed(2);
  };

  // Get score pill color based on frequency level
  const getScorePillColor = (score) => {
    const level = getFrequencyLevel(score);
    if (level >= 8) return 'success';
    if (level >= 6) return 'primary';
    if (level >= 4) return 'info';
    if (level >= 2) return 'warning';
    return 'default';
  };

  // Calculate visual properties based on frequency level
  const getResultStyle = (score) => {
    const level = getFrequencyLevel(score);
    
    let fontSize = '0.9rem';
    let fontWeight = 400;
    let color = 'text.primary';

    if (level >= 8) {
      fontSize = '1rem';
      fontWeight = 600;
      color = 'primary.main';
    } else if (level >= 6) {
      fontSize = '0.95rem';
      fontWeight = 500;
      color = 'primary.main';
    } else if (level >= 4) {
      fontSize = '0.9rem';
      fontWeight = 500;
    } else if (level >= 2) {
      fontSize = '0.85rem';
      fontWeight = 400;
    } else {
      fontSize = '0.8rem';
      fontWeight = 400;
      color = 'text.secondary';
    }

    return { fontSize, fontWeight, color };
  };

  // Get frequency dots (1-10 scale) using logarithmic mapping
  const getFrequencyDots = (score) => {
    const level = getFrequencyLevel(score);

    const dots = [];
    for (let i = 1; i <= 10; i++) {
      const filled = i <= level;
      const color = filled 
        ? (level >= 8 ? '#4caf50' : level >= 6 ? '#ff9800' : level >= 4 ? '#2196f3' : '#f44336')
        : '#e0e0e0';
      
      dots.push(
        <Box
          key={i}
          sx={{
            width: 3,
            height: 3,
            borderRadius: '50%',
            bgcolor: color,
            display: 'inline-block',
            mx: 0.2,
          }}
        />
      );
    }
    return dots;
  };

  // Get frequency category for export using logarithmic mapping
  const getFrequencyCategory = (score) => {
    const level = getFrequencyLevel(score);
    if (level >= 8) return { label: 'Very Common', color: 'success' };
    if (level >= 6) return { label: 'Common', color: 'primary' };
    if (level >= 4) return { label: 'Moderate', color: 'info' };
    if (level >= 2) return { label: 'Uncommon', color: 'warning' };
    return { label: 'Rare', color: 'error' };
  };

  // Generate group box title with search stats
  const getGroupBoxTitle = () => {
    if (!searchStats) return `${results.length} results`;
    
    const currentCount = results.length;
    const totalCount = searchStats.totalResults;
    const query = searchStats.query;
    const dictionaryName = selectedDictionary?.name || searchStats.dictionary;
    
    let title = `${currentCount}`;
    if (hasMore || currentCount < totalCount) {
      title += ` of ${totalCount}`;
    }
    title += ` results for "${query}"`;
    if (dictionaryName) {
      title += ` in ${dictionaryName}`;
    }
    if (searchStats.computationLimitReached) {
      title += ' (limit reached)';
    }
    
    return title;
  };

  // Export functions
  const copyAllToClipboard = async () => {
    try {
      const text = results.map(result => result.text).join('\n');
      await navigator.clipboard.writeText(text);
      setSnackbar({
        open: true,
        message: `Copied ${results.length} results to clipboard`,
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to copy to clipboard',
        severity: 'error'
      });
    }
    setExportMenuAnchor(null);
  };

  const downloadAsFile = () => {
    try {
      const text = results.map(result => result.text).join('\n');
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `words-ninja-results-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setSnackbar({
        open: true,
        message: `Downloaded ${results.length} results as text file`,
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to download file',
        severity: 'error'
      });
    }
    setExportMenuAnchor(null);
  };

  const downloadAsCSV = () => {
    try {
      const csvContent = [
        'Text,Score,Category',
        ...results.map(result => {
          const category = getFrequencyCategory(result.score);
          return `"${result.text.replace(/"/g, '""')}",${result.score},${category.label}`;
        })
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `words-ninja-results-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setSnackbar({
        open: true,
        message: `Downloaded ${results.length} results as CSV file`,
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to download CSV file',
        severity: 'error'
      });
    }
    setExportMenuAnchor(null);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <Paper elevation={1} sx={{ overflow: 'hidden' }}>
      {/* Group Box Header with Search Stats */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        px: 2, 
        py: 0.8,
        bgcolor: 'grey.50',
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
          {getGroupBoxTitle()}
        </Typography>
        
        {results.length > 0 && (
          <IconButton
            size="small"
            onClick={(e) => setExportMenuAnchor(e.currentTarget)}
          >
            <MoreIcon />
          </IconButton>
        )}
      </Box>

      {/* Export menu */}
      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={() => setExportMenuAnchor(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={copyAllToClipboard}>
          <ListItemIcon>
            <CopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Copy all" />
        </MenuItem>
        <MenuItem onClick={downloadAsFile}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Download as text" />
        </MenuItem>
        <MenuItem onClick={downloadAsCSV}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Download as CSV" />
        </MenuItem>
      </Menu>

      <InfiniteScroll
        dataLength={results.length}
        next={onLoadMore}
        hasMore={hasMore}
        loader={
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.4 }}>
            <CircularProgress size={14} />
            <Typography variant="caption" sx={{ ml: 1, alignSelf: 'center', fontSize: '0.7rem' }}>
              Loading...
            </Typography>
          </Box>
        }
        endMessage={
          results.length > 0 && (
            <Box sx={{ textAlign: 'center', py: 0.4 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                No more results
              </Typography>
            </Box>
          )
        }
        scrollThreshold={0.8}
        style={{ padding: '0 3px' }}
      >
        {results.map((result, index) => {
          const style = getResultStyle(result.score);

          return (
            <Box
              key={`${result.rank}-${result.text}`}
              sx={{
                py: 0.2,   // Further reduced spacing
                px: 0.4,   
                borderRadius: 0.4,
                mb: 0.1,   // Minimal margin between rows
                bgcolor: index % 2 === 0 ? 'transparent' : 'grey.25',
                '&:hover': {
                  bgcolor: 'action.hover',
                  '& .copy-icon': { opacity: 1 }
                },
                '& .copy-icon': { opacity: 0 },
                transition: 'background-color 0.15s',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 0.4,
              }}
              onClick={() => copyToClipboard(result.text)}
              title={`Click to copy • Score: ${result.score.toFixed(2)}`}
            >
              {/* Frequency dots */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                minWidth: '35px',
                justifyContent: 'center'
              }}>
                {getFrequencyDots(result.score)}
              </Box>

              {/* Score pill */}
              <Chip
                label={formatScore(result.score)}
                size="small"
                color={getScorePillColor(result.score)}
                variant="outlined"
                sx={{
                  height: '18px',
                  minWidth: '40px',
                  fontSize: '0.65rem',
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  '& .MuiChip-label': {
                    px: 0.6,
                    py: 0
                  }
                }}
              />

              {/* Result text */}
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'monospace',
                  ...style,
                  flexGrow: 1,
                  wordBreak: 'break-word',
                  lineHeight: 1.1,
                }}
              >
                {result.text}
              </Typography>
              
              {/* Copy icon (hover only) */}
              <IconButton
                size="small"
                className="copy-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(result.text);
                }}
                sx={{ 
                  p: 0.2,
                  transition: 'opacity 0.2s',
                  '& .MuiSvgIcon-root': { fontSize: '0.75rem' }
                }}
              >
                <CopyIcon />
              </IconButton>
            </Box>
          );
        })}
      </InfiniteScroll>

      {/* Loading indicator for pagination */}
      {loading && results.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.4 }}>
          <CircularProgress size={14} />
        </Box>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ fontSize: '0.75rem' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}

export default SearchResults; 