import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Button,
  Chip,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import type { RoadmapContent } from '../../types/content';

const TimelineContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: '2px',
    backgroundColor: theme.palette.primary.main,
    transform: 'translateX(-50%)',
    [theme.breakpoints.down('md')]: {
      left: '20px',
    },
  },
}));

const TimelineItem = styled(Paper)(({ theme }) => ({
  position: 'relative',
  margin: theme.spacing(4, 0),
  padding: theme.spacing(3),
  maxWidth: '45%',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  '&:nth-of-type(odd)': {
    marginLeft: 'auto',
    [theme.breakpoints.down('md')]: {
      marginLeft: theme.spacing(6),
      maxWidth: 'calc(100% - 48px)',
    },
  },
  '&:nth-of-type(even)': {
    marginRight: 'auto',
    [theme.breakpoints.down('md')]: {
      marginLeft: theme.spacing(6),
      maxWidth: 'calc(100% - 48px)',
    },
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '16px',
    height: '16px',
    backgroundColor: theme.palette.primary.main,
    borderRadius: '50%',
    top: '20px',
    [theme.breakpoints.up('md')]: {
      right: '-58px',
      '&:nth-of-type(even)': {
        right: 'auto',
        left: '-58px',
      },
    },
    [theme.breakpoints.down('md')]: {
      left: '-28px',
    },
  },
}));

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'success';
    case 'in-progress': return 'warning';
    case 'planned': return 'default';
    default: return 'default';
  }
};

interface RoadmapSectionProps {
  content: RoadmapContent;
}

const RoadmapSection: React.FC<RoadmapSectionProps> = ({ content }) => {
  const navigate = useNavigate();

  const handleCTA = () => {
    if (content.cta_link.startsWith('/')) {
      navigate(content.cta_link);
    } else {
      window.open(content.cta_link, '_blank');
    }
  };

  return (
    <Box 
      id="roadmap"
      sx={{ 
        py: 10, 
        color: 'white',
        position: 'relative',
      }}>
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography 
            variant="h3" 
            component="h2" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              color: 'white',
              mb: 3
            }}
          >
            {content.title}
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.9)',
              maxWidth: 800,
              mx: 'auto',
              lineHeight: 1.6,
              mb: 4
            }}
          >
            {content.subtitle}
          </Typography>
        </Box>

        <TimelineContainer>
          {content.timeline.map((phase, index) => (
            <TimelineItem key={index} elevation={3}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', color: 'white' }}>
                  {phase.title}
                </Typography>
                <Chip 
                  label={phase.status} 
                  color={getStatusColor(phase.status)}
                  size="small"
                />
              </Box>
              
              <Typography variant="subtitle1" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 3 }}>
                {phase.period}
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {phase.tasks.map((task, taskIndex) => (
                  <Box key={taskIndex} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip 
                      label={task.status} 
                      color={getStatusColor(task.status)}
                      size="small"
                      variant="outlined"
                    />
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      {task.text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </TimelineItem>
          ))}
        </TimelineContainer>

        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Button 
            variant="contained" 
            size="large" 
            onClick={handleCTA}
            sx={{
              backgroundColor: '#667eea',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              '&:hover': { 
                backgroundColor: '#5a67d8',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.2)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            {content.cta_text}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default RoadmapSection; 