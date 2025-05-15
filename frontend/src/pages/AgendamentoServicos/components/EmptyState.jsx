import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Button, Paper } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useSpring, animated } from 'react-spring';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(6),
    textAlign: 'center',
    height: '60vh',
    borderRadius: 16,
    backgroundColor: theme.palette.background.paper
  },
  icon: {
    fontSize: 100,
    marginBottom: theme.spacing(3),
    color: theme.palette.text.secondary,
    opacity: 0.7
  },
  title: {
    marginBottom: theme.spacing(1),
    fontWeight: 600,
    color: theme.palette.text.primary
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

const EmptyState = ({ title, description, icon, buttonText, onButtonClick }) => {
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
        {React.cloneElement(icon, { className: classes.icon })}
      </animated.div>
      
      <animated.div style={contentAnimation}>
        <Typography variant="h5" className={classes.title}>
          {title}
        </Typography>
        
        <Typography variant="body1" className={classes.description}>
          {description}
        </Typography>
      </animated.div>
      
      {buttonText && onButtonClick && (
        <animated.div style={buttonAnimation}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large" 
            className={classes.button}
            onClick={onButtonClick}
            startIcon={React.cloneElement(icon, { style: { fontSize: 20 } })}
          >
            {buttonText}
          </Button>
        </animated.div>
      )}
    </Paper>
  );
};

EmptyState.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  icon: PropTypes.element.isRequired,
  buttonText: PropTypes.string,
  onButtonClick: PropTypes.func
};

export default EmptyState;