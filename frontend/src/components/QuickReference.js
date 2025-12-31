import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Drawer,
  Paper,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Collapse,
  Divider,
  Grid,
  Button,
} from '@mui/material';
import {
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  MenuBook as GuideIcon,
} from '@mui/icons-material';
import {
  QUERY_TYPES,
  CHARACTER_CLASSES,
  REPETITION_PATTERNS,
  PERFORMANCE_TIPS_QUICK,
} from '../data/helpContent';

function QuickReference({ open, onClose, isMobile, isLandingPage }) {
  const [hoveredPattern, setHoveredPattern] = useState(null);

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text);
  };

  const PatternTable = ({ patterns, title, compact = false }) => (
    <Box sx={{ mb: compact ? 1 : 1.5 }}>
      {title && (
        <Typography variant="subtitle2" sx={{ mb: 0.8, fontWeight: 600, color: 'primary.main', fontSize: '0.85rem' }}>
          {title}
        </Typography>
      )}
      <TableContainer>
        <Table size="small" sx={{ '& .MuiTableCell-root': { py: 0.3, px: 0.6 } }}>
          <TableBody>
            {patterns.map((item, index) => (
              <TableRow 
                key={index}
                sx={{ 
                  '&:hover': { bgcolor: 'action.hover' },
                  '& .copy-icon': { opacity: 0 },
                  '&:hover .copy-icon': { opacity: 1 }
                }}
                onMouseEnter={() => setHoveredPattern(index)}
                onMouseLeave={() => setHoveredPattern(null)}
              >
                <TableCell sx={{ width: compact ? '45px' : '55px', fontFamily: 'monospace', fontWeight: 600 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                    <code style={{ fontSize: '0.8rem' }}>{item.pattern}</code>
                    <IconButton
                      size="small"
                      className="copy-icon"
                      onClick={() => copyToClipboard(item.pattern)}
                      sx={{ 
                        p: 0.15, 
                        transition: 'opacity 0.2s',
                        '& .MuiSvgIcon-root': { fontSize: '0.65rem' }
                      }}
                    >
                      <CopyIcon />
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell sx={{ fontSize: '0.7rem' }}>
                  {item.desc}
                </TableCell>
                <TableCell sx={{
                  fontSize: '0.65rem',
                  color: 'text.secondary',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-line',
                  display: { xs: 'none', sm: compact ? 'none' : 'table-cell' }
                }}>
                  {item.example}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const quickRefContent = (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#f8fafc'  // Light blue-grey tint for better visibility
    }}>
      {/* Header */}
      <Box sx={{
        p: 1.2,
        borderBottom: 1,
        borderColor: 'divider',
        flexShrink: 0,
        bgcolor: 'primary.main',
        color: 'white',
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
            Quick Reference
          </Typography>
          {isMobile && !isLandingPage && (
            <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>
        <Typography variant="caption" sx={{ fontSize: '0.75rem', opacity: 0.9 }}>
          Pattern syntax for word searches
        </Typography>
      </Box>

      {/* Scrollable Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 1.2 }}>
        {/* Three-column layout for landing page */}
        {isLandingPage ? (
          <Grid container spacing={1.5}>
            <Grid item xs={12} md={4}>
              <PatternTable patterns={QUERY_TYPES} title="Query Types" />
              <PatternTable patterns={PERFORMANCE_TIPS_QUICK} title="Performance Tips" />
            </Grid>
            <Grid item xs={12} md={4}>
              <PatternTable patterns={CHARACTER_CLASSES} title="Character Classes" />
            </Grid>
            <Grid item xs={12} md={4}>
              <PatternTable patterns={REPETITION_PATTERNS} title="Repetition" />
            </Grid>
          </Grid>
        ) : (
          <>
            {/* Single column for sidebar */}
            <PatternTable patterns={QUERY_TYPES} title="Query Types" compact />
            <PatternTable patterns={PERFORMANCE_TIPS_QUICK} title="Performance Tips" compact />
            <PatternTable patterns={CHARACTER_CLASSES} title="Character Classes" compact />
            <PatternTable patterns={REPETITION_PATTERNS} title="Repetition" compact />
          </>
        )}

        {/* Big link to full guide */}
        <Box
          sx={{
            mt: 2,
            mb: 1,
            p: 2,
            border: '2px solid',
            borderColor: '#00897b',
            borderRadius: 2,
            bgcolor: 'rgba(0, 137, 123, 0.05)',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography
              sx={{ fontSize: '0.95rem', fontWeight: 500, color: 'text.primary', mb: 0.5 }}
            >
              Learn advanced patterns, tips & practice challenges
            </Typography>
            <Typography
              sx={{ fontSize: '0.8rem', color: 'text.secondary' }}
            >
              Combining queries, letterbanks, anagrams & more
            </Typography>
          </Box>
          <Button
            component={Link}
            to="/guide"
            variant="contained"
            startIcon={<GuideIcon sx={{ fontSize: '1.3rem' }} />}
            sx={{
              fontSize: '1rem',
              py: 1.5,
              px: 3,
              flexShrink: 0,
              bgcolor: '#00897b',
              '&:hover': {
                bgcolor: '#00695c',
              },
              fontWeight: 600,
              boxShadow: 2,
            }}
          >
            Syntax Guide
          </Button>
        </Box>
      </Box>
    </Box>
  );

  // Landing page version - always visible (scrollable on mobile)
  if (isLandingPage) {
    return (
      <Box sx={{
        width: '100%',
        display: 'block'
      }}>
        <Paper elevation={1} sx={{ height: 'fit-content', maxHeight: { xs: 'none', md: '600px' } }}>
          {quickRefContent}
        </Paper>
      </Box>
    );
  }

  // Post-search version
  if (isMobile) {
    return (
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: { 
            width: '90vw',
            maxWidth: '320px'
          }
        }}
      >
        {quickRefContent}
      </Drawer>
    );
  }

  return (
    <Box sx={{ 
      width: '280px',
      flexShrink: 0,
      display: open ? 'block' : 'none'
    }}>
      <Paper 
        elevation={1} 
        sx={{ 
          height: 'calc(100vh - 100px)',
          position: 'sticky',
          top: 16
        }}
      >
        {quickRefContent}
      </Paper>
    </Box>
  );
}

export default QuickReference; 