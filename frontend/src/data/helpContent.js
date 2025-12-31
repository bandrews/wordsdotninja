// Pattern syntax reference data - embedded directly in frontend
// Based on analysis of source/expr-parse.cpp and source/expr-anagram.cpp
// This is the single source of truth for all help content

// ============================================================================
// QUICK REFERENCE DATA (used by QuickReference.js for landing and sidebar)
// ============================================================================

// Query Types - different ways to structure searches
export const QUERY_TYPES = [
  { pattern: '<abc>', desc: 'Anagram', example: '<cat> → act, cat' },
  { pattern: '"text"', desc: 'Exact phrase', example: '"the cat"' },
  { pattern: 'A & B', desc: 'AND (both patterns)', example: 'C*t & *a*' },
  { pattern: 'A | B', desc: 'OR (either pattern)', example: 'cat|dog' },
  { pattern: '()', desc: 'Group patterns', example: '(cat|dog)s' },
];

// Performance tips for quick reference
export const PERFORMANCE_TIPS_QUICK = [
  { pattern: 'Letterbank first', desc: 'Put <abc> before &constraints', example: '✅ <abc>&_*\n❌ _*&<abc>' },
  { pattern: 'Start is faster', desc: 'Anchor patterns at the start', example: '✅ the*\n❌ *ing' },
];

// Character Classes - what each symbol matches
export const CHARACTER_CLASSES = [
  { pattern: '.', desc: 'Any char (incl. space)', example: 'c.t → cat, c t, c3t' },
  { pattern: '_', desc: 'Letter or number', example: 'c_t → cat, c3t' },
  { pattern: 'A', desc: 'Any letter', example: 'cAt → cat, cbt' },
  { pattern: 'C', desc: 'Consonant (incl. y)', example: 'CaC → cat, bay' },
  { pattern: 'V', desc: 'Vowel (a,e,i,o,u)', example: 'cVt → cat, cut' },
  { pattern: '#', desc: 'Any digit', example: '###-####' },
  { pattern: '[abc]', desc: 'Any of these', example: '[aeiou]' },
  { pattern: '[^abc]', desc: 'None of these', example: '[^aeiou]' },
  { pattern: '[a-z]', desc: 'Range', example: '[k-t] = k,l,m...t' },
  { pattern: '-', desc: 'Space or nothing', example: 'ice-cream → icecream, ice cream' },
];

// Repetition patterns
export const REPETITION_PATTERNS = [
  { pattern: '*', desc: 'Zero or more', example: 'cat.* → cat, cats, caterpillar' },
  { pattern: '+', desc: 'One or more', example: 'cat.+ → cats, caterpillar' },
  { pattern: '?', desc: 'Optional', example: 'cats? → cat, cats' },
  { pattern: '{3}', desc: 'Exactly 3', example: 'V{3} → ooo, aaa' },
  { pattern: '{2,5}', desc: '2 to 5 times', example: 'C{2,5} → cc,ddd,fffff' },
  { pattern: '{3,}', desc: '3 or more', example: 'C{3,} → bcd, bbccdd' },
];

// Quick tips for the reference panel
export const QUICK_TIPS = [
  { tip: 'Start patterns are faster: "the*" vs "*ing"', critical: true },
  { tip: 'Use quotes for exact phrases: "the cat"' },
  { tip: 'Y is a consonant, not vowel' },
  { tip: 'Combine with &: "C*t & *a*"' },
  { tip: 'Letterbank FIRST when combining: <abc>&pattern', critical: true },
];

// ============================================================================
// DETAILED SYNTAX REFERENCE (for comprehensive help)
// ============================================================================

export const SYNTAX_REFERENCE = [
  { 
    pattern: "a-z, 0-9, space", 
    description: "literal match",
    detailed: "Match these characters exactly. Letters must be lowercase. Example: 'cat' matches 'cat' but not 'CAT'."
  },
  { 
    pattern: ".", 
    description: "any character: [a-z0-9 ]",
    detailed: "Matches any single letter (a-z), digit (0-9), or space. This is like a wildcard for one character."
  },
  { 
    pattern: "_", 
    description: "alphanumeric: [a-z0-9]",
    detailed: "Matches any single letter or digit, but NOT spaces. Use this when you know there's a character but not what it is."
  },
  { 
    pattern: "#", 
    description: "digit: [0-9]",
    detailed: "Matches any single digit from 0 to 9. Useful for phone numbers, dates, or any numeric patterns."
  },
  { 
    pattern: "-", 
    description: "optional space: ( ?)",
    detailed: "Matches either a space or nothing at all. Useful for patterns that might have spaces between words."
  },
  { 
    pattern: "A", 
    description: "alphabetic: [a-z]",
    detailed: "Matches any single letter from a to z. Use this when you know there's a letter but not which one."
  },
  { 
    pattern: "C", 
    description: "consonant (including y)",
    detailed: "Matches any consonant: b, c, d, f, g, h, j, k, l, m, n, p, q, r, s, t, v, w, x, y, z. Note: y is considered a consonant."
  },
  { 
    pattern: "V", 
    description: "vowel ([aeiou], not y)",
    detailed: "Matches any vowel: a, e, i, o, u. Note: y is NOT considered a vowel in Nutrimatic."
  },
  { 
    pattern: "*", 
    description: "zero or more of preceding",
    detailed: "Matches the previous pattern zero or more times. 'a*' matches '', 'a', 'aa', 'aaa', etc."
  },
  { 
    pattern: "+", 
    description: "one or more of preceding",
    detailed: "Matches the previous pattern one or more times. 'a+' matches 'a', 'aa', 'aaa', but not ''."
  },
  { 
    pattern: "?", 
    description: "zero or one of preceding",
    detailed: "Makes the previous pattern optional. 'a?' matches either 'a' or nothing."
  },
  { 
    pattern: "{n}", 
    description: "exactly n of preceding",
    detailed: "Matches exactly n repetitions. 'a{3}' matches 'aaa' only."
  },
  { 
    pattern: "{n,}", 
    description: "n or more of preceding",
    detailed: "Matches n or more repetitions. 'a{2,}' matches 'aa', 'aaa', 'aaaa', etc."
  },
  { 
    pattern: "{n,m}", 
    description: "between n and m of preceding",
    detailed: "Matches between n and m repetitions. 'a{2,4}' matches 'aa', 'aaa', or 'aaaa'."
  },
  { 
    pattern: "[abc]", 
    description: "character class: any of a, b, or c",
    detailed: "Matches any single character listed inside the brackets. '[aeiou]' matches any vowel."
  },
  { 
    pattern: "[^abc]", 
    description: "negated class: anything except a, b, or c",
    detailed: "Matches any character NOT listed. '[^aeiou]' matches any consonant, digit, or space."
  },
  { 
    pattern: "[a-z]", 
    description: "character range: any letter from a to z",
    detailed: "Matches any character in the range. '[a-f]' matches a, b, c, d, e, or f. '[0-9]' matches any digit."
  },
  { 
    pattern: "()", 
    description: "grouping: treat contents as single unit",
    detailed: "Groups patterns together. '(cat)+' matches 'cat', 'catcat', 'catcatcat', etc."
  },
  { 
    pattern: "|", 
    description: "alternation: match either left or right",
    detailed: "Matches either the pattern before OR after the |. 'cat|dog' matches either 'cat' or 'dog'."
  },
  { 
    pattern: "&", 
    description: "intersection: both patterns must match",
    detailed: "Both patterns must match the same text. 'C*&*t' matches words that start with a consonant AND end with 't'."
  },
  { 
    pattern: '"expr"', 
    description: "quoted: forbid automatic spaces",
    detailed: "Prevents Nutrimatic from automatically inserting spaces. Use for exact phrase matching or when spaces matter."
  },
  { 
    pattern: "<letters>", 
    description: "anagram: rearrange these letters",
    detailed: "Finds anagrams of the letters inside. '<cat>' finds 'act', 'tac', etc. Can include patterns: '<c?a?t?>' finds anagrams using some or all of c, a, t."
  }
];

// Beginner-friendly categories for the help panel
export const SYNTAX_CATEGORIES = [
  {
    title: "Basic Characters",
    items: [
      { pattern: "a-z, 0-9, space", description: "literal match", detailed: "Match these characters exactly. Letters must be lowercase. Example: 'cat' matches 'cat' but not 'CAT'." },
      { pattern: ".", description: "any character: [a-z0-9 ]", detailed: "Matches any single letter (a-z), digit (0-9), or space. This is like a wildcard for one character." },
      { pattern: "_", description: "alphanumeric: [a-z0-9]", detailed: "Matches any single letter or digit, but NOT spaces. Use this when you know there's a character but not what it is." },
      { pattern: "#", description: "digit: [0-9]", detailed: "Matches any single digit from 0 to 9. Useful for phone numbers, dates, or any numeric patterns." },
      { pattern: "-", description: "optional space: ( ?)", detailed: "Matches either a space or nothing at all. Useful for patterns that might have spaces between words." }
    ]
  },
  {
    title: "Letter Types",
    items: [
      { pattern: "A", description: "alphabetic: [a-z]", detailed: "Matches any single letter from a to z. Use this when you know there's a letter but not which one." },
      { pattern: "C", description: "consonant (including y)", detailed: "Matches any consonant: b, c, d, f, g, h, j, k, l, m, n, p, q, r, s, t, v, w, x, y, z. Note: y is considered a consonant." },
      { pattern: "V", description: "vowel ([aeiou], not y)", detailed: "Matches any vowel: a, e, i, o, u. Note: y is NOT considered a vowel in Nutrimatic." }
    ]
  },
  {
    title: "Repetition",
    items: [
      { pattern: "*", description: "zero or more of preceding", detailed: "Matches the previous pattern zero or more times. 'a*' matches '', 'a', 'aa', 'aaa', etc." },
      { pattern: "+", description: "one or more of preceding", detailed: "Matches the previous pattern one or more times. 'a+' matches 'a', 'aa', 'aaa', but not ''." },
      { pattern: "?", description: "zero or one of preceding", detailed: "Makes the previous pattern optional. 'a?' matches either 'a' or nothing." },
      { pattern: "{n}", description: "exactly n of preceding", detailed: "Matches exactly n repetitions. 'a{3}' matches 'aaa' only." },
      { pattern: "{n,}", description: "n or more of preceding", detailed: "Matches n or more repetitions. 'a{2,}' matches 'aa', 'aaa', 'aaaa', etc." },
      { pattern: "{n,m}", description: "between n and m of preceding", detailed: "Matches between n and m repetitions. 'a{2,4}' matches 'aa', 'aaa', or 'aaaa'." }
    ]
  },
  {
    title: "Character Sets",
    items: [
      { pattern: "[abc]", description: "character class: any of a, b, or c", detailed: "Matches any single character listed inside the brackets. '[aeiou]' matches any vowel." },
      { pattern: "[^abc]", description: "negated class: anything except a, b, or c", detailed: "Matches any character NOT listed. '[^aeiou]' matches any consonant, digit, or space." },
      { pattern: "[a-z]", description: "character range: any letter from a to z", detailed: "Matches any character in the range. '[a-f]' matches a, b, c, d, e, or f. '[0-9]' matches any digit." }
    ]
  },
  {
    title: "Advanced Patterns",
    items: [
      { pattern: "()", description: "grouping: treat contents as single unit", detailed: "Groups patterns together. '(cat)+' matches 'cat', 'catcat', 'catcatcat', etc." },
      { pattern: "|", description: "alternation: match either left or right", detailed: "Matches either the pattern before OR after the |. 'cat|dog' matches either 'cat' or 'dog'." },
      { pattern: "&", description: "intersection: both patterns must match", detailed: "Both patterns must match the same text. 'C*&*t' matches words that start with a consonant AND end with 't'." },
      { pattern: '"expr"', description: "quoted: forbid automatic spaces", detailed: "Prevents Nutrimatic from automatically inserting spaces. Use for exact phrase matching or when spaces matter." },
      { pattern: "<letters>", description: "anagram: rearrange these letters", detailed: "Finds anagrams of the letters inside. '<cat>' finds 'act', 'tac', etc. Can include patterns: '<c?a?t?>' finds anagrams using some or all of c, a, t." }
    ]
  }
];

// Example queries with descriptions - enhanced with more beginner examples
export const EXAMPLES = [
  {
    query: "cat",
    description: "Simple literal match",
    expected_result: "cat, cats, caterpillar, etc.",
    difficulty: "beginner"
  },
  {
    query: "c_t",
    description: "Letter-unknown-letter pattern",
    expected_result: "cat, cut, cot, etc.",
    difficulty: "beginner"
  },
  {
    query: "###-####",
    description: "Phone number pattern (3 digits, dash, 4 digits)",
    expected_result: "867-5309, 555-1234, etc.",
    difficulty: "beginner"
  },
  {
    query: "C*V*C*",
    description: "Consonant(s), then vowel(s), then consonant(s)",
    expected_result: "cat, strong, etc.",
    difficulty: "beginner"
  },
  {
    query: "_*ing",
    description: "Any word ending in 'ing'",
    expected_result: "running, singing, etc.",
    difficulty: "beginner"
  },
  {
    query: "[aeiou]*",
    description: "Words containing only vowels",
    expected_result: "a, i, eau, etc.",
    difficulty: "intermediate"
  },
  {
    query: '"C*aC*eC*iC*oC*uC*yC*"',
    description: "Words with all vowels in order (quoted for exact spacing)",
    expected_result: "facetiously",
    difficulty: "intermediate"
  },
  {
    query: "867-####",
    description: "Phone number pattern starting with 867",
    expected_result: "for a good time call",
    difficulty: "intermediate"
  },
  {
    query: '"_ ___ ___ _*burger"',
    description: "Burger with specific word pattern",
    expected_result: "lol",
    difficulty: "intermediate"
  },
  {
    query: "<anagram>",
    description: "Simple anagram of 'anagram'",
    expected_result: "anagram, margana, etc.",
    difficulty: "intermediate"
  },
  {
    query: '[aeiou]*&_*a_*&_*e_*&_*i_*&_*o_*&_*u_*',
    description: "Words containing all vowels (using intersection)",
    expected_result: "Various words with all vowels",
    difficulty: "advanced"
  },
  {
    query: '<(cerb)?(ecto)?(lonm)?(ddog)?(fblo)?(iero)?(skey)?(ells)?(dwhi)?(atra)?(subj)?(odan)?(thel)?>&_{24}',
    description: "Complex anagram with optional parts",
    expected_result: "subject of blood and whiskey",
    difficulty: "advanced"
  },
  {
    query: '"(((((m?o)?c)?h)?i)?t)?_(h(a(t(o(ry?)?)?)?)?)?&_{5,}"',
    description: "Flexible pattern matching with minimum length",
    expected_result: "chitchat",
    difficulty: "advanced"
  }
];

// Quick start example queries for the search interface - organized by difficulty
export const QUICK_EXAMPLES = [
  'cat',
  'c_t', 
  '###-####',
  'C*V*C*',
  '"C*aC*eC*iC*oC*uC*yC*"',
  '<anagram>'
];

// Beginner tutorial steps
export const TUTORIAL_STEPS = [
  {
    title: "Start Simple",
    content: "Try typing a simple word like 'cat' to see exact matches.",
    example: "cat"
  },
  {
    title: "Use Wildcards", 
    content: "Use _ for unknown letters. Try 'c_t' to find cat, cut, cot, etc.",
    example: "c_t"
  },
  {
    title: "Match Letter Types",
    content: "Use C for consonants, V for vowels. Try 'CVC' for consonant-vowel-consonant words.",
    example: "CVC"
  },
  {
    title: "Add Repetition",
    content: "Use * for 'zero or more'. Try 'C*' for words starting with consonants.",
    example: "C*"
  },
  {
    title: "Find Anagrams",
    content: "Use <letters> to find anagrams. Try '<cat>' to find anagrams of 'cat'.",
    example: "<cat>"
  }
]; 