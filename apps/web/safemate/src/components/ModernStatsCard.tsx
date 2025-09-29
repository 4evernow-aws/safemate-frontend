import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  useTheme,
  alpha,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import type { ReactNode } from 'react';

interface ModernStatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  trend?: {
    value: number;
    label: string;
  };
  gradient?: string;
  onClick?: () => void;
}

export default function ModernStatsCard({
  title,
  value,
  subtitle,
  icon,
  color = 'primary',
  trend,
  gradient,
  onClick,
}: ModernStatsCardProps) {
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
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease-in-out',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          transform: onClick ? 'translateY(-4px)' : 'translateY(-2px)',
          boxShadow: theme.shadows[8],
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: gradient || gradients[color],
          borderRadius: '12px 12px 0 0',
        },
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'center', sm: 'flex-start' }, 
          justifyContent: 'space-between',
          flex: 1,
          gap: { xs: 2, sm: 1 }
        }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                mb: 1,
              }}
            >
              {title}
            </Typography>
            
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 0.5,
                background: gradient || gradients[color],
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.2,
              }}
            >
              {value}
            </Typography>

            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}

            {trend && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {trend.value > 0 ? (
                  <TrendingUpIcon sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                ) : (
                  <TrendingDownIcon sx={{ color: 'error.main', fontSize: 16, mr: 0.5 }} />
                )}
                <Typography
                  variant="caption"
                  sx={{
                    color: trend.value > 0 ? 'success.main' : 'error.main',
                    fontWeight: 600,
                  }}
                >
                  {Math.abs(trend.value)}% {trend.label}
                </Typography>
              </Box>
            )}
          </Box>

          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'row', sm: 'column' }, 
            alignItems: 'center',
            gap: { xs: 2, sm: 1 }
          }}>
            <Box
              sx={{
                width: { xs: 50, sm: 60 },
                height: { xs: 50, sm: 60 },
                borderRadius: '50%',
                background: alpha(theme.palette[color].main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px solid ${alpha(theme.palette[color].main, 0.2)}`,
                flexShrink: 0,
              }}
            >
              <Box
                sx={{
                  color: theme.palette[color].main,
                  '& svg': {
                    fontSize: { xs: 24, sm: 28 },
                  },
                }}
              >
                {icon}
              </Box>
            </Box>
            
            <IconButton
              size="small"
              sx={{
                color: 'text.secondary',
                display: { xs: 'none', sm: 'flex' },
                '&:hover': {
                  backgroundColor: alpha(theme.palette[color].main, 0.1),
                },
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
} 