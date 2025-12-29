import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
} from '@mui/material';
import { MenuBook as QuickRefIcon } from '@mui/icons-material';

function Header({ onQuickRefClick }) {
  return (
    <AppBar position="static" elevation={0} sx={{ bgcolor: 'primary.main' }}>
      <Toolbar variant="dense" sx={{ minHeight: '40px' }}>
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" component="h1" sx={{ fontWeight: 600, fontSize: '1rem' }}>
            words.ninja
          </Typography>
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