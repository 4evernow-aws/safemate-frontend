import { Box, Typography, Link, Divider, useTheme } from '@mui/material';

export default function Footer() {
  const theme = useTheme();
  
  return (
    <Box
      component="footer"
      sx={{
        mt: 4,
        py: 3,
        px: 2,
        backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#f5f5f5',
        borderTop: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.secondary,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: 'lg',
          mx: 'auto',
        }}
      >
        <Box sx={{ mb: { xs: 2, md: 0 } }}>
          <Typography variant="body2" color="text.secondary">
            © 2024 SafeMate Portal - Powered by{' '}
            <Link
              href="https://forevernow.today"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: 'primary.main',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Forevernow
            </Link>
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Typography variant="body2" color="text.secondary">
            $MATE Token ID: 0.0.7779374
          </Typography>
          <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />
          <Typography variant="body2" color="text.secondary">
            Secure Network
          </Typography>
          <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />
          <Link
            href="https://forevernow.world"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: 'primary.main',
              textDecoration: 'none',
              fontSize: '0.875rem',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            Forevernow NFTs
          </Link>
        </Box>
      </Box>
    </Box>
  );
} 