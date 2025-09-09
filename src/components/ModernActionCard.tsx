import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  useTheme,
  alpha,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import type { ReactNode } from 'react';

interface ModernActionCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  buttonText: string;
  onClick: () => void;
  disabled?: boolean;
  gradient?: string;
}

export default function ModernActionCard({
  title,
  description,
  icon,
  color = 'primary',
  buttonText,
  onClick,
  disabled = false,
  gradient,
}: ModernActionCardProps) {
  const theme = useTheme();

  const gradients = {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    warning: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    error: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    info: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  };

  return (
    <Card
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 3,
        transition: 'all 0.3s ease-in-out',
        border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
          borderColor: theme.palette[color].main,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: gradient || gradients[color],
          borderRadius: '12px 12px 0 0',
        },
      }}
    >
      <CardContent sx={{ 
        p: { xs: 2, sm: 3 }, 
        textAlign: 'center', 
        position: 'relative',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        {/* Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: alpha(theme.palette[color].main, 0.05),
            zIndex: 0,
          }}
        />
        
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {/* Content */}
          <Box sx={{ flex: 1 }}>
            {/* Icon */}
            <Box
              sx={{
                width: { xs: 60, sm: 80 },
                height: { xs: 60, sm: 80 },
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.1)} 0%, ${alpha(theme.palette[color].main, 0.05)} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                border: `2px solid ${alpha(theme.palette[color].main, 0.2)}`,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.05)',
                  border: `2px solid ${theme.palette[color].main}`,
                },
              }}
            >
              <Box
                sx={{
                  color: theme.palette[color].main,
                  '& svg': {
                    fontSize: { xs: 28, sm: 36 },
                  },
                }}
              >
                {icon}
              </Box>
            </Box>

            {/* Title */}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 1,
                color: 'text.primary',
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
              }}
            >
              {title}
            </Typography>

            {/* Description */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 3,
                lineHeight: 1.6,
                minHeight: { xs: 'auto', sm: '2.4em' },
                fontSize: { xs: '0.85rem', sm: '0.875rem' },
              }}
            >
              {description}
            </Typography>
          </Box>

          {/* Action Button */}
          <Box sx={{ mt: 'auto' }}>
            <Button
              variant="contained"
              onClick={onClick}
              disabled={disabled}
              endIcon={<ArrowForwardIcon />}
              fullWidth
              sx={{
                borderRadius: 2,
                px: { xs: 2, sm: 3 },
                py: { xs: 1.2, sm: 1.5 },
                fontWeight: 600,
                fontSize: { xs: '0.85rem', sm: '0.875rem' },
                background: gradient || gradients[color],
                '&:hover': {
                  background: gradient || gradients[color],
                  filter: 'brightness(1.1)',
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[6],
                },
                '&:disabled': {
                  background: alpha(theme.palette.grey[400], 0.5),
                  color: theme.palette.grey[600],
                },
              }}
            >
              {buttonText}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
} 