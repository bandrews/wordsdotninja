import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';

// Query Types - different ways to structure searches
const QUERY_TYPES = [
  { pattern: '<abc>', desc: 'Anagram', example: '<cat> → act, cat' },
  { pattern: '"text"', desc: 'Exact phrase', example: '"the cat"' },
  { pattern: 'A & B', desc: 'Both patterns', example: 'C.t & .a.' },
  { pattern: 'A | B', desc: 'Either pattern', example: 'cat|dog' },
  { pattern: '()', desc: 'Group patterns', example: '(cat|dog)s' },
];

// Character Classes - what each symbol matches
const CHARACTER_CLASSES = [
  { pattern: '.', desc: 'Any character', example: 'c.t → cat, cut, cot' },
  { pattern: '_', desc: 'Letter or number', example: 'c_t → cat, c3t' },
  { pattern: 'A', desc: 'Any letter', example: 'cAt → cat, cbt' },
  { pattern: 'C', desc: 'Consonant (incl. y)', example: 'CaC → cat, bay' },
  { pattern: 'V', desc: 'Vowel (a,e,i,o,u)', example: 'cVt → cat, cut' },
  { pattern: '#', desc: 'Any digit', example: '###-####' },
  { pattern: '[abc]', desc: 'Any of these', example: '[aeiou]' },
  { pattern: '[^abc]', desc: 'None of these', example: '[^aeiou]' },
  { pattern: '[a-z]', desc: 'Range', example: '[a-m]' },
  { pattern: '-', desc: 'Optional space', example: 'cat-dog' },
];

// Repetition patterns
const REPETITION_PATTERNS = [
  { pattern: '*', desc: 'Zero or more', example: 'cat.* → cat, cats, caterpillar' },
  { pattern: '+', desc: 'One or more', example: 'cat.+ → cats, caterpillar' },
  { pattern: '?', desc: 'Optional', example: 'cats? → cat, cats' },
  { pattern: '{3}', desc: 'Exactly 3', example: 'V{3} → ooo, aaa' },
  { pattern: '{2,5}', desc: '2 to 5 times', example: 'C{2,5} → cc,ddd,fffff' },
  { pattern: '{3,}', desc: '3 or more', example: 'C{3,} → bcd, bbccdd' },
];

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
      bgcolor: 'background.paper'
    }}>
      {/* Header */}
      <Box sx={{ 
        p: 1.2, 
        borderBottom: 1, 
        borderColor: 'divider', 
        flexShrink: 0,
        bgcolor: 'grey.50'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
            Quick Reference
          </Typography>
          {isMobile && (
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          )}
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
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
            <PatternTable patterns={CHARACTER_CLASSES} title="Character Classes" compact />
            <PatternTable patterns={REPETITION_PATTERNS} title="Repetition" compact />
          </>
        )}

        <Divider sx={{ my: 1 }} />

        {/* Quick tips */}
        <Box sx={{ mt: 0.8 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.4, fontSize: '0.75rem' }}>
            Tips:
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2, fontSize: '0.65rem' }}>
            • Start patterns are faster: "the*" vs "*ing"<br/>
            • Use quotes for exact phrases: "the cat"<br/>
            • Y is a consonant, not vowel<br/>
            • Combine with &: "C*t & *a*"
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  // Landing page version - always visible on desktop
  if (isLandingPage) {
    return (
      <Box sx={{ 
        width: { xs: '100%', md: '100%' },
        display: { xs: open ? 'block' : 'none', md: 'block' }
      }}>
        <Paper elevation={1} sx={{ height: 'fit-content', maxHeight: '600px' }}>
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