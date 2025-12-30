import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Link,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import { MenuBook as QuickRefIcon } from '@mui/icons-material';

function Header({ onQuickRefClick, dictionaries, selectedDictionary, onDictionaryChange, dictionariesLoading }) {
  return (
    <AppBar position="static" elevation={0} sx={{ bgcolor: 'primary.main' }}>
      <Toolbar variant="dense" sx={{ minHeight: '40px' }}>
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
          <Link
            href="/"
            underline="none"
            sx={{
              color: 'inherit',
              '&:hover': { opacity: 0.8 }
            }}
          >
            <Typography variant="h6" component="span" sx={{ fontWeight: 600, fontSize: '1rem' }}>
              🥷 words.ninja
            </Typography>
          </Link>
          <Typography
            variant="body2"
            sx={{
              ml: 2,
              color: 'rgba(255, 255, 255, 0.7)',
              display: { xs: 'none', sm: 'block' },
              fontSize: '0.75rem'
            }}
          >
            Word Pattern Search
          </Typography>
        </Box>

        {/* Dictionary selector - mobile only (desktop has it in search bar) */}
        {dictionaries && dictionaries.length > 0 && (
          <FormControl
            size="small"
            sx={{
              mr: 1,
              display: { xs: 'flex', sm: 'none' },
              minWidth: 90
            }}
          >
            <Select
              value={selectedDictionary || 'wikipedia'}
              onChange={(e) => onDictionaryChange?.(e.target.value)}
              disabled={dictionariesLoading}
              sx={{
                color: 'white',
                fontSize: '0.75rem',
                height: '28px',
                '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                '.MuiSvgIcon-root': { color: 'white' }
              }}
            >
              {dictionaries.map((dict) => (
                <MenuItem key={dict.id} value={dict.id} disabled={!dict.available}>
                  {dict.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <IconButton
          color="inherit"
          onClick={onQuickRefClick}
          aria-label="Toggle quick reference"
          size="small"
        >
          <QuickRefIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

export default Header; 