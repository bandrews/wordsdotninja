import React, { useState } from 'react';
import {
  Drawer,
  Paper,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  Chip,
  Button,
  Collapse,
  Divider,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Help as HelpIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { SYNTAX_REFERENCE, SYNTAX_CATEGORIES, EXAMPLES, TUTORIAL_STEPS } from '../data/helpContent';

function HelpPanel({ open, onClose, isMobile }) {
  const [showDetailed, setShowDetailed] = useState(false);
  const [expandedDetails, setExpandedDetails] = useState({});

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text);
  };

  const toggleDetailedView = () => {
    setShowDetailed(!showDetailed);
  };

  const toggleRowDetail = (index) => {
    setExpandedDetails(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      default: return 'default';
    }
  };

  const helpContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Pattern Guide</Typography>
          {isMobile && (
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          )}
        </Box>
        <Typography variant="body2" color="text.secondary">
          Search patterns for word puzzles and crosswords
        </Typography>
      </Box>

      {/* Scrollable Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {/* Tutorial for Beginners */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <SchoolIcon fontSize="small" />
              Tutorial for Beginners
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Alert severity="info" sx={{ mb: 2 }}>
              Nutrimatic searches Wikipedia text that's been normalized to lowercase letters, 
              numbers, and spaces only. Perfect for crosswords and word puzzles!
            </Alert>
            
            {TUTORIAL_STEPS.map((step, index) => (
              <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  {index + 1}. {step.title}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {step.content}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <code style={{ fontSize: '0.875rem', fontWeight: 600, backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>
                    {step.example}
                  </code>
                  <IconButton
                    size="small"
                    onClick={() => copyToClipboard(step.example)}
                    title="Copy example"
                  >
                    <CopyIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>

        {/* Pattern Syntax - Categorized */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Pattern Syntax Reference
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ mb: 2 }}>
              <Button
                variant={showDetailed ? "contained" : "outlined"}
                size="small"
                startIcon={<HelpIcon />}
                onClick={toggleDetailedView}
                sx={{ mb: 2 }}
              >
                {showDetailed ? "Hide" : "Show"} Detailed Explanations
              </Button>
            </Box>

            {SYNTAX_CATEGORIES.map((category, categoryIndex) => (
              <Box key={categoryIndex} sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 1, color: 'primary.main' }}>
                  {category.title}
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Pattern</strong></TableCell>
                        <TableCell><strong>Description</strong></TableCell>
                        {showDetailed && <TableCell><strong>Details</strong></TableCell>}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {category.items.map((item, itemIndex) => {
                        const rowKey = `${categoryIndex}-${itemIndex}`;
                        return (
                          <React.Fragment key={rowKey}>
                            <TableRow>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <code style={{ fontSize: '0.875rem', fontWeight: 600 }}>{item.pattern}</code>
                                  <IconButton
                                    size="small"
                                    onClick={() => copyToClipboard(item.pattern)}
                                    title="Copy pattern"
                                  >
                                    <CopyIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">{item.description}</Typography>
                              </TableCell>
                              {showDetailed && (
                                <TableCell>
                                  <Typography variant="body2" color="text.secondary">
                                    {item.detailed}
                                  </Typography>
                                </TableCell>
                              )}
                            </TableRow>
                          </React.Fragment>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                {categoryIndex < SYNTAX_CATEGORIES.length - 1 && <Divider sx={{ mt: 2 }} />}
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>

        {/* Examples by Difficulty */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Examples by Difficulty
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              {['beginner', 'intermediate', 'advanced'].map(difficulty => {
                const difficultyExamples = EXAMPLES.filter(ex => ex.difficulty === difficulty);
                if (difficultyExamples.length === 0) return null;
                
                return (
                  <Box key={difficulty} sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, textTransform: 'capitalize', color: 'primary.main' }}>
                      {difficulty} Examples
                    </Typography>
                    {difficultyExamples.map((example, index) => (
                      <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <code style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                            {example.query}
                          </code>
                          <IconButton
                            size="small"
                            onClick={() => copyToClipboard(example.query)}
                            title="Copy query"
                          >
                            <CopyIcon fontSize="small" />
                          </IconButton>
                          <Chip 
                            label={example.difficulty} 
                            color={getDifficultyColor(example.difficulty)}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {example.description}
                        </Typography>
                        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                          Expected: {example.expected_result}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                );
              })}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Performance Tips */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Performance Tips
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Alert severity="warning" sx={{ mb: 2 }}>
                Some patterns can be very slow or hit computation limits!
              </Alert>
              
              <Typography variant="body2" paragraph>
                <strong>Fast patterns:</strong> Patterns constrained at the beginning 
                (e.g., <code>the*</code>) are much faster than those constrained 
                at the end (e.g., <code>*ing</code>).
              </Typography>
              
              <Typography variant="body2" paragraph>
                <strong>Slow patterns:</strong> Large anagrams (10+ letters), 
                many intersections (&amp;), and deeply nested expressions 
                can take a long time.
              </Typography>
              
              <Typography variant="body2" paragraph>
                <strong>Use quotes:</strong> Adding quotes around patterns prevents 
                extra spaces and makes searches faster.
              </Typography>
              
              <Typography variant="body2" paragraph>
                <strong>Add constraints:</strong> More specific patterns generally 
                run faster than very general ones.
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Puzzle Solving Tips */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Puzzle Solving Tips
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Typography variant="body2" paragraph>
                <strong>Crossword clues:</strong> Use pattern matching for word length 
                and known letters: <code>"c_t"</code> for 3-letter words with C and T.
              </Typography>
              
              <Typography variant="body2" paragraph>
                <strong>Anagrams:</strong> Use <code>&lt;letters&gt;</code> to find 
                anagrams. Add constraints with &amp; for partial information.
              </Typography>
              
              <Typography variant="body2" paragraph>
                <strong>Word games:</strong> Use character classes like <code>C</code> 
                (consonants) and <code>V</code> (vowels) for pattern-based clues.
              </Typography>
              
              <Typography variant="body2" paragraph>
                <strong>Missing letters:</strong> Use <code>_</code> for unknown 
                letters/numbers, or specific character classes.
              </Typography>
              
              <Typography variant="body2" paragraph>
                <strong>Multiple words:</strong> Let Nutrimatic find phrase boundaries 
                automatically, or use quotes to control word breaks.
              </Typography>
              
              <Typography variant="body2" paragraph>
                <strong>Remember:</strong> Y is considered a consonant, not a vowel. 
                Vowels are only a, e, i, o, u.
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        anchor="bottom"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: { 
            height: '80vh',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }
        }}
      >
        {helpContent}
      </Drawer>
    );
  }

  return (
    <Paper
      elevation={2}
      sx={{
        width: 400,
        height: 'calc(100vh - 120px)', // Fixed height based on viewport, accounting for header and padding
        flexShrink: 0,
        display: open ? 'block' : 'none',
        position: 'sticky',
        top: 16,
      }}
    >
      {helpContent}
    </Paper>
  );
}

export default HelpPanel; 