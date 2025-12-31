import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Container } from '@mui/material';

function Footer() {
  const linkStyle = {
    color: 'inherit',
    textDecoration: 'none',
    borderBottom: '1px solid currentColor',
    opacity: 0.9,
    transition: 'opacity 0.2s',
  };

  return (
    <Box
      component="footer"
      sx={{
        py: 1.5,
        px: 2,
        backgroundColor: '#2c3e50',
        color: 'rgba(255,255,255,0.9)',
        fontSize: '0.85rem',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'center', sm: 'center' },
          gap: 1
        }}>
          {/* Left side - attribution */}
          <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            Powered by{' '}
            <a
              href="https://nutrimatic.org/"
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
            >
              Nutrimatic
            </a>
            {' · '}
            <a
              href="https://github.com/bandrews/wordsdotninja"
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
            >
              GitHub
            </a>
          </Box>

          {/* Right side - help links */}
          <Box sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center'
          }}>
            <Link
              to="/guide"
              style={{
                ...linkStyle,
                fontWeight: 500,
              }}
            >
              Syntax Guide
            </Link>
            <a
              href="https://nutrimatic.org/usage.html"
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
            >
              Nutrimatic Docs
            </a>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;
