import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme,
  Chip,
  Alert,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  PlayArrow as TryIcon,
  Home as HomeIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import Footer from './Footer';

// Table of contents sections
const TOC_SECTIONS = [
  { id: 'getting-started', title: 'Getting Started' },
  { id: 'basic-syntax', title: 'Basic Syntax' },
  { id: 'character-classes', title: 'Character Classes' },
  { id: 'repetition', title: 'Repetition Patterns' },
  { id: 'advanced', title: 'Advanced Techniques' },
  { id: 'combining', title: 'Combining Patterns' },
  { id: 'performance', title: 'Performance Tips' },
  { id: 'examples', title: 'Real-World Examples' },
  { id: 'challenges', title: 'Practice Challenges' },
];

// Pattern example component with copy and try buttons
function PatternExample({ pattern, description, result, critical }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(pattern);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleTry = () => {
    window.location.href = `/?q=${encodeURIComponent(pattern)}`;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1,
        p: 1.5,
        mb: 1,
        bgcolor: critical ? 'warning.light' : 'grey.100',
        borderRadius: 1,
        borderLeft: critical ? '4px solid' : 'none',
        borderColor: critical ? 'warning.main' : 'transparent',
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <code style={{
            fontSize: '0.95rem',
            fontWeight: 600,
            backgroundColor: 'rgba(0,0,0,0.08)',
            padding: '2px 8px',
            borderRadius: '4px',
          }}>
            {pattern}
          </code>
          <IconButton size="small" onClick={handleCopy} title="Copy pattern">
            <CopyIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={handleTry} title="Try this pattern" color="primary">
            <TryIcon fontSize="small" />
          </IconButton>
          {copied && <Chip label="Copied!" size="small" color="success" />}
        </Box>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
        {result && (
          <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic' }}>
            Matches: {result}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

// Syntax table row
function SyntaxRow({ pattern, description, example }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '80px 1fr', md: '100px 1fr 1fr' },
        gap: 2,
        py: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-child': { borderBottom: 'none' },
      }}
    >
      <code style={{ fontWeight: 600, fontSize: '0.95rem' }}>{pattern}</code>
      <Typography variant="body2">{description}</Typography>
      {example && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ display: { xs: 'none', md: 'block' }, fontFamily: 'monospace' }}
        >
          {example}
        </Typography>
      )}
    </Box>
  );
}

const HEADER_HEIGHT = 64; // Height of sticky header

function GuidePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeSection, setActiveSection] = useState('getting-started');
  const location = useLocation();

  // Scroll to section on hash change (with offset for header)
  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.slice(1));
      if (element) {
        const top = element.getBoundingClientRect().top + window.scrollY - HEADER_HEIGHT - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  }, [location.hash]);

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = TOC_SECTIONS.map(s => document.getElementById(s.id)).filter(Boolean);

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const rect = section.getBoundingClientRect();
        if (rect.top <= HEADER_HEIGHT + 50) {
          setActiveSection(TOC_SECTIONS[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - HEADER_HEIGHT - 16;
      window.scrollTo({ top, behavior: 'smooth' });
      window.history.replaceState(null, '', `#${id}`);
      setActiveSection(id);
    }
  };

  const tocContent = (
    <List sx={{ py: 0 }}>
      {TOC_SECTIONS.map((section) => (
        <ListItem key={section.id} disablePadding>
          <ListItemButton
            onClick={() => scrollToSection(section.id)}
            selected={activeSection === section.id}
            sx={{
              py: 0.75,
              borderLeft: '3px solid',
              borderColor: activeSection === section.id ? 'primary.main' : 'transparent',
              bgcolor: activeSection === section.id ? 'action.selected' : 'transparent',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <ListItemText
              primary={section.title}
              primaryTypographyProps={{
                fontSize: '0.9rem',
                fontWeight: activeSection === section.id ? 600 : 400,
                color: activeSection === section.id ? 'primary.main' : 'text.primary',
              }}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 1.5,
          px: 2,
          position: 'sticky',
          top: 0,
          zIndex: 1100,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, flexShrink: 0 }}>
              Syntax Guide
            </Typography>

            {/* Mobile: Section dropdown */}
            {isMobile && (
              <FormControl size="small" sx={{ flex: 1, minWidth: 120 }}>
                <Select
                  value={activeSection}
                  onChange={(e) => scrollToSection(e.target.value)}
                  sx={{
                    color: 'white',
                    fontSize: '0.85rem',
                    '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                    '.MuiSvgIcon-root': { color: 'white' },
                  }}
                >
                  {TOC_SECTIONS.map((section) => (
                    <MenuItem key={section.id} value={section.id}>
                      {section.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Spacer for desktop */}
            {!isMobile && <Box sx={{ flex: 1 }} />}

            <IconButton
              component={Link}
              to="/"
              color="inherit"
              title="Back to search"
            >
              <HomeIcon />
            </IconButton>
          </Box>
        </Container>
      </Box>

      {/* Main content area */}
      <Container maxWidth="lg" sx={{ flex: 1, py: 3 }}>
        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Desktop TOC sidebar */}
          {!isMobile && (
            <Box
              sx={{
                width: 200,
                flexShrink: 0,
                position: 'sticky',
                top: 80,
                alignSelf: 'flex-start',
                maxHeight: 'calc(100vh - 100px)',
                overflow: 'auto',
              }}
            >
              <Paper elevation={1} sx={{ p: 1 }}>
                <Typography variant="subtitle2" sx={{ px: 2, py: 1, fontWeight: 600 }}>
                  Contents
                </Typography>
                {tocContent}
              </Paper>
            </Box>
          )}


          {/* Main content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Getting Started */}
            <Paper id="getting-started" sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                Getting Started
              </Typography>
              <Typography paragraph>
                words.ninja uses <strong>Nutrimatic</strong>, a powerful pattern-matching engine
                that searches through Wikipedia text to find words and phrases matching your pattern.
              </Typography>
              <Typography paragraph>
                All text is normalized to lowercase letters (a-z), digits (0-9), and spaces.
                Punctuation is removed and apostrophes become nothing (so "don't" becomes "dont").
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                New to pattern matching? Start simple: type a word like <code>cat</code> to
                see exact matches, then try <code>c_t</code> to find cat, cut, cot, and more!
              </Alert>
            </Paper>

            {/* Basic Syntax */}
            <Paper id="basic-syntax" sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                Basic Syntax
              </Typography>
              <Box sx={{ mb: 2 }}>
                <SyntaxRow pattern="a-z" description="Lowercase letters match exactly" example="cat matches 'cat'" />
                <SyntaxRow pattern="0-9" description="Digits match exactly" example="123 matches '123'" />
                <SyntaxRow pattern="space" description="Spaces match word boundaries" example="'the cat'" />
              </Box>
            </Paper>

            {/* Character Classes */}
            <Paper id="character-classes" sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                Character Classes
              </Typography>
              <Typography paragraph>
                Character classes let you match categories of characters instead of specific ones.
              </Typography>
              <Box sx={{ mb: 2 }}>
                <SyntaxRow pattern="." description="Any character (letter, digit, or space)" example="c.t → cat, c t, c3t" />
                <SyntaxRow pattern="_" description="Any letter or digit (no spaces)" example="c_t → cat, c3t" />
                <SyntaxRow pattern="A" description="Any letter (a-z)" example="cAt → cat, cbt, czt" />
                <SyntaxRow pattern="C" description="Any consonant (including Y)" example="CaC → cat, bay, day" />
                <SyntaxRow pattern="V" description="Any vowel (a, e, i, o, u — NOT y)" example="cVt → cat, cut, cot" />
                <SyntaxRow pattern="#" description="Any digit (0-9)" example="###-#### → 555-1234" />
                <SyntaxRow pattern="-" description="Optional space (matches space or nothing)" example="ice-cream → ice cream, icecream" />
              </Box>
              <Alert severity="warning" icon={<WarningIcon />}>
                <strong>Important:</strong> Y is treated as a consonant (C), not a vowel (V).
              </Alert>
            </Paper>

            {/* Character Sets */}
            <Paper id="character-sets" sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                Character Sets
              </Typography>
              <Typography paragraph>
                Define custom sets of characters to match using square brackets.
              </Typography>
              <Box sx={{ mb: 2 }}>
                <SyntaxRow pattern="[abc]" description="Match any one of these characters" example="[aeiou] → any vowel" />
                <SyntaxRow pattern="[^abc]" description="Match any character EXCEPT these" example="[^aeiou] → any consonant" />
                <SyntaxRow pattern="[a-z]" description="Match any character in the range" example="[k-t] → k,l,m,n,o,p,q,r,s,t" />
              </Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                <strong>Pro tip:</strong> <code>[k-t]</code> is a shortcut for <code>[klmnopqrst]</code>.
                Both work — use whichever is clearer for your pattern!
              </Alert>
              <PatternExample
                pattern="[psbtmhlgrd]{5}"
                description="Find 5-letter words using only these letters (useful for letter lock puzzles!)"
                result="grams, blast, strap, etc."
              />
            </Paper>

            {/* Repetition */}
            <Paper id="repetition" sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                Repetition Patterns
              </Typography>
              <Box sx={{ mb: 2 }}>
                <SyntaxRow pattern="*" description="Zero or more of the preceding" example="ca*t → ct, cat, caat, caaat" />
                <SyntaxRow pattern="+" description="One or more of the preceding" example="ca+t → cat, caat, caaat" />
                <SyntaxRow pattern="?" description="Zero or one (optional)" example="cats? → cat, cats" />
                <SyntaxRow pattern="{3}" description="Exactly 3 repetitions" example="a{3} → aaa" />
                <SyntaxRow pattern="{2,5}" description="Between 2 and 5 repetitions" example="a{2,5} → aa, aaa, aaaa, aaaaa" />
                <SyntaxRow pattern="{3,}" description="3 or more repetitions" example="a{3,} → aaa, aaaa, aaaaa, ..." />
              </Box>
              <PatternExample
                pattern="_{5}"
                description="Exactly 5 letters/digits (useful for word length constraints)"
                result="5-letter words"
              />
            </Paper>

            {/* Advanced Techniques */}
            <Paper id="advanced" sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                Advanced Techniques
              </Typography>

              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Grouping with Parentheses</Typography>
              <Typography paragraph>
                Use <code>()</code> to group patterns together, especially with repetition.
              </Typography>
              <PatternExample
                pattern="(cat)+"
                description="One or more occurrences of 'cat'"
                result="cat, catcat, catcatcat"
              />

              <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Alternation (OR)</Typography>
              <Typography paragraph>
                Use <code>|</code> to match either pattern.
              </Typography>
              <PatternExample
                pattern="cat|dog"
                description="Match either 'cat' or 'dog'"
                result="cat, dog"
              />

              <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Intersection (AND)</Typography>
              <Typography paragraph>
                Use <code>&</code> to require both patterns match simultaneously.
              </Typography>
              <PatternExample
                pattern="C*t&_*a_*"
                description="Words starting with consonant, ending with 't', AND containing 'a'"
                result="cat, that, craft"
              />

              <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Quoted Strings</Typography>
              <Typography paragraph>
                Use <code>"..."</code> to prevent automatic space insertion between characters.
              </Typography>
              <PatternExample
                pattern='"CVCVC"'
                description="Exactly 5 characters (C-V-C-V-C), no spaces allowed"
                result="5-letter single words only"
              />

              <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Anagrams</Typography>
              <Typography paragraph>
                Use <code>&lt;...&gt;</code> to find all permutations of the letters.
              </Typography>
              <PatternExample
                pattern="<listen>"
                description="Find all anagrams of 'listen'"
                result="listen, silent, tinsel, enlist, etc."
              />
            </Paper>

            {/* Combining Patterns - CRITICAL */}
            <Paper id="combining" sx={{ p: 3, mb: 3, border: '2px solid', borderColor: 'warning.main' }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon color="warning" /> Combining Patterns
              </Typography>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <strong>This is the most powerful feature!</strong> Combining anagrams, letter banks,
                and constraints unlocks complex puzzle-solving capabilities.
              </Alert>

              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Order of Operations</Typography>
              <Alert severity="error" sx={{ mb: 2 }}>
                <strong>CRITICAL:</strong> When combining patterns with <code>&</code>, put your
                letterbank/anagram <strong>FIRST</strong>, then add constraints.
              </Alert>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}>
                <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="success.dark" sx={{ mb: 1 }}>
                    RECOMMENDED
                  </Typography>
                  <code style={{ fontSize: '0.9rem' }}>&lt;letterbank&gt;&"A{'{5}'} A{'{3}'}"</code>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Letterbank first, then constraints
                  </Typography>
                </Box>
                <Box sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="warning.dark" sx={{ mb: 1 }}>
                    May timeout or fail
                  </Typography>
                  <code style={{ fontSize: '0.9rem' }}>"A{'{5}'} A{'{3}'}"&&lt;letterbank&gt;</code>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Constraints before letterbank may be slower
                  </Typography>
                </Box>
              </Box>

              <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Practical Examples</Typography>
              <PatternExample
                pattern='<exampleletters>&"A{10} A{5}"'
                description="Find a 10-letter word followed by 5-letter word using these letters"
              />
              <PatternExample
                pattern="<watermelon>&_*a_*t_*e_*r_*"
                description="Anagram of 'watermelon' where letters appear in order: a...t...e...r"
              />
              <PatternExample
                pattern='<aehimnprsw>&_*a_*&_*e_*&_*h_*&_*i_*'
                description="Words using these letters, must contain a, e, h, and i"
              />
            </Paper>

            {/* Performance Tips */}
            <Paper id="performance" sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                Performance Tips
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Some patterns can be slow or hit computation limits. Here's how to optimize.
              </Alert>

              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Start-Constrained is Faster</Typography>
              <Typography paragraph>
                Patterns anchored at the beginning are much faster than those constrained at the end.
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}>
                <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="success.dark">FAST</Typography>
                  <code>the*</code>
                  <Typography variant="body2">Anchored at start</Typography>
                </Box>
                <Box sx={{ p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="error.dark">SLOW</Typography>
                  <code>*ing</code>
                  <Typography variant="body2">Only constrained at end</Typography>
                </Box>
              </Box>

              <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Use Quotes</Typography>
              <Typography paragraph>
                Adding quotes prevents automatic space insertion, making searches faster and more predictable.
              </Typography>

              <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Avoid Too Many Intersections</Typography>
              <Typography paragraph>
                Patterns with many <code>&</code> operators (10+) become exponentially slower to compile.
              </Typography>

              <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Large Anagrams</Typography>
              <Typography paragraph>
                Anagrams longer than 10-15 letters can be slow. Consider breaking into chunks or adding constraints.
              </Typography>
            </Paper>

            {/* Real-World Examples */}
            <Paper id="examples" sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                Real-World Examples
              </Typography>

              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Crossword: Known letters</Typography>
              <PatternExample
                pattern="c_t"
                description="3-letter word starting with C, ending with T"
                result="cat, cut, cot, cit"
              />

              <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Phone Number Pattern</Typography>
              <PatternExample
                pattern="###-####"
                description="Find phone number patterns in text"
                result="867-5309, 555-1212"
              />

              <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Letter Lock Puzzle</Typography>
              <PatternExample
                pattern="[k-t][a-j]{3}[k-t]"
                description="5-letter words for a combination lock with specific letter ranges"
                result="night, sigma, light"
              />

              <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Words with All Vowels</Typography>
              <PatternExample
                pattern='"C*aC*eC*iC*oC*uC*"'
                description="Single words with all vowels in alphabetical order"
                result="facetiously, abstemiously"
              />

              <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Letterbank + Word Count</Typography>
              <PatternExample
                pattern='<puzzlehunter>&"A{6} A{6}"'
                description="Two 6-letter words using only these letters"
              />
            </Paper>

            {/* Practice Challenges */}
            <Paper id="challenges" sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                Practice Challenges
              </Typography>
              <Typography paragraph>
                Test your pattern-matching skills with these challenges. Try to solve each one before revealing the answer!
              </Typography>

              {/* BEGINNER: Basic single concepts */}
              <ChallengeCard
                number={1}
                difficulty="Beginner"
                challenge="Find all 4-letter words that start with 'b' and end with 't'"
                hint="Use underscore (_) for unknown letters"
                solution="b__t"
              />

              <ChallengeCard
                number={2}
                difficulty="Beginner"
                challenge="Find all anagrams of the word 'listen'"
                hint="Use angle brackets <> for anagrams"
                solution="<listen>"
              />

              <ChallengeCard
                number={3}
                difficulty="Beginner"
                challenge="Find words you can spell using only the letters A, B, and C"
                hint="Use a character class [abc] with repetition"
                solution='"[abc]+"'
              />

              <ChallengeCard
                number={4}
                difficulty="Beginner"
                challenge="Find all exactly 6-letter words"
                hint="Use underscore with repetition {6}"
                solution='"_{6}"'
              />

              {/* INTERMEDIATE: Combining two concepts */}
              <ChallengeCard
                number={5}
                difficulty="Intermediate"
                challenge="Find 6-letter words with alternating consonants and vowels (CVCVCV pattern)"
                hint="Use C for consonants, V for vowels, and quotes for exact length"
                solution='"CVCVCV"'
              />

              <ChallengeCard
                number={6}
                difficulty="Intermediate"
                challenge="Find 4-letter words for a combination lock with dials: [A-F], [G-L], [M-R], [S-Z]"
                hint="Use character ranges [a-f] in square brackets for each dial position"
                solution="[a-f][g-l][m-r][s-z]"
              />

              <ChallengeCard
                number={7}
                difficulty="Intermediate"
                challenge="Find words containing 'qu' that don't start with 'q'"
                hint="Start with [^q] to exclude q, then match the rest"
                solution="[^q]_*qu_*"
              />

              <ChallengeCard
                number={8}
                difficulty="Intermediate"
                challenge="Find words ending in either '-tion' or '-sion'"
                hint="Use alternation (|) with grouping"
                solution="_*(tion|sion)"
              />

              <ChallengeCard
                number={9}
                difficulty="Intermediate"
                challenge="Find 7-letter words that contain 'ing'"
                hint="Use intersection (&) to combine 'contains ing' with 'exactly 7 letters'"
                solution="_*ing_*&_{7}"
              />

              {/* ADVANCED: Complex combinations */}
              <ChallengeCard
                number={10}
                difficulty="Advanced"
                challenge="Find words that contain both the letter 'x' and the letter 'z'"
                hint="Use intersection (&) to require both letters"
                solution="_*x_*&_*z_*"
              />

              <ChallengeCard
                number={11}
                difficulty="Advanced"
                challenge="Find 5-letter words using only vowels (AEIOU)"
                hint="Combine a letterbank with a length constraint"
                solution="<aeiou>&_{5}"
              />

              <ChallengeCard
                number={12}
                difficulty="Advanced"
                challenge="Find two 4-letter words that can be made from the letters in 'CHAPTERS'"
                hint="Use letterbank first, then word structure constraint"
                solution='<chapters>&"A{4} A{4}"'
              />

              <ChallengeCard
                number={13}
                difficulty="Advanced"
                challenge="Find 8-letter words that contain all 5 vowels (a, e, i, o, u)"
                hint="Use multiple intersections to require each vowel, plus length"
                solution='_*a_*&_*e_*&_*i_*&_*o_*&_*u_*&_{8}'
              />

              <ChallengeCard
                number={14}
                difficulty="Advanced"
                challenge="Using only AEHIMNPRSW, find a phrase where each letter appears at least once"
                hint="Letterbank first, then require each letter with intersections"
                solution="<aehimnprsw>&_*a_*&_*e_*&_*h_*&_*i_*&_*m_*&_*n_*&_*p_*&_*r_*&_*s_*&_*w_*"
              />
            </Paper>
          </Box>
        </Box>
      </Container>

      <Footer />
    </Box>
  );
}

// Challenge card component
function ChallengeCard({ number, difficulty, challenge, hint, solution }) {
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [userQuery, setUserQuery] = useState('');

  const difficultyColor = {
    'Beginner': 'success',
    'Intermediate': 'warning',
    'Advanced': 'error',
  }[difficulty] || 'default';

  const handleTryQuery = (e) => {
    e.preventDefault();
    if (userQuery.trim()) {
      window.open(`/?q=${encodeURIComponent(userQuery)}`, '_blank');
    }
  };

  return (
    <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography variant="h6">Challenge {number}</Typography>
        <Chip label={difficulty} color={difficultyColor} size="small" />
      </Box>
      <Typography paragraph sx={{ fontWeight: 500 }}>
        {challenge}
      </Typography>

      {/* Search box for trying solutions */}
      <Box
        component="form"
        onSubmit={handleTryQuery}
        sx={{ display: 'flex', gap: 1, mb: 2 }}
      >
        <input
          type="text"
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
          placeholder="Try your pattern..."
          style={{
            flex: 1,
            padding: '8px 12px',
            fontSize: '0.9rem',
            fontFamily: 'monospace',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
        <button
          type="submit"
          style={{
            padding: '8px 16px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.85rem',
          }}
        >
          Search
        </button>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <Chip
          label={showHint ? 'Hide Hint' : 'Show Hint'}
          onClick={() => setShowHint(!showHint)}
          variant="outlined"
          size="small"
        />
        <Chip
          label={showSolution ? 'Hide Solution' : 'Show Solution'}
          onClick={() => setShowSolution(!showSolution)}
          variant="outlined"
          size="small"
          color="primary"
        />
      </Box>

      {showHint && (
        <Alert severity="info" sx={{ mt: 1 }}>
          <strong>Hint:</strong> {hint}
        </Alert>
      )}

      {showSolution && (
        <Box sx={{ mt: 1, p: 1.5, bgcolor: 'primary.light', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ mb: 0.5 }}>Solution:</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <code style={{ fontSize: '1rem', fontWeight: 600 }}>{solution}</code>
            <IconButton
              size="small"
              onClick={() => navigator.clipboard?.writeText(solution)}
              title="Copy"
            >
              <CopyIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => window.open(`/?q=${encodeURIComponent(solution)}`, '_blank')}
              title="Try it in new tab"
              color="primary"
            >
              <TryIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default GuidePage;
