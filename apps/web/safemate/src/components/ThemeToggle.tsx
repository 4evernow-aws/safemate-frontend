import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  sx?: any;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ sx }) => {
  const { mode, toggleTheme } = useTheme();

  return (
    <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
      <IconButton 
        onClick={toggleTheme}
        sx={{
          ...sx,
          color: 'inherit',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'rotate(180deg)',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle; 