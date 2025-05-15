import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { RuleOutlined } from '@mui/icons-material';
import { i18n } from '../../../translate/i18n';
import { animated, useSpring } from 'react-spring';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(6),
    textAlign: 'center',
    height: '60vh',
  },
  icon: {
    fontSize: 100,
    marginBottom: theme.spacing(3),
    color: theme.palette.primary.main,
    opacity: 0.7
  },
  title: {
    marginBottom: theme.spacing(1),
    fontWeight: 600
  },
  description: {
    maxWidth: 500,
    marginBottom: theme.spacing(4),
    color: theme.palette.text.secondary
  },
  button: {
    borderRadius: 30,
    padding: theme.spacing(1.5, 4),
    textTransform: 'none',
    fontWeight: 'bold',
    boxShadow: theme.shadows[3]
  }
}));

const EmptyStateMessageRules = ({ onAddClick }) => {
  const classes = useStyles();

  // Animações
  const iconAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(-20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    delay: 200,
    config: { tension: 300, friction: 20 }
  });

  const contentAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    delay: 400,
    config: { tension: 300, friction: 20 }
  });

  const buttonAnimation = useSpring({
    from: { opacity: 0, transform: 'scale(0.9)' },
    to: { opacity: 1, transform: 'scale(1)' },
    delay: 600,
    config: { tension: 300, friction: 20 }
  });

  return (
    <Paper elevation={0} className={classes.container}>
      <animated.div style={iconAnimation}>
        <RuleOutlined className={classes.icon} />
      </animated.div>
      
      <animated.div style={contentAnimation}>
        <Typography variant="h5" className={classes.title}>
          {i18n.t('messageRules.emptyState.title')}
        </Typography>
        
        <Typography variant="body1" className={classes.description}>
          {i18n.t('messageRules.emptyState.description')}
        </Typography>
      </animated.div>
      
      <animated.div style={buttonAnimation}>
        <Button 
          variant="contained" 
          color="primary" 
          size="large" 
          className={classes.button}
          onClick={onAddClick}
          startIcon={<RuleOutlined />}
        >
          {i18n.t('messageRules.emptyState.button')}
        </Button>
      </animated.div>
    </Paper>
  );
};

export default EmptyStateMessageRules;