import React, { useState, useRef, useEffect } from "react";
import PropTypes from 'prop-types';
import Popover from "@mui/material/Popover";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import makeStyles from '@mui/styles/makeStyles';
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeDownIcon from "@mui/icons-material/VolumeDown";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import { Grid, Slider } from "@mui/material";

const useStyles = makeStyles((theme) => ({
    tabContainer: {
        padding: theme.spacing(2),
        minHeight: '100px',
        display: 'flex',
        alignItems: 'center',
    },
    popoverPaper: {
        width: "100%",
        maxWidth: 350,
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(1),
        [theme.breakpoints.down('md')]: {
            maxWidth: 270,
            marginLeft: theme.spacing(1),
            marginRight: theme.spacing(1),
        },
    },
    noShadow: {
        boxShadow: "none !important",
    },
    icons: {
        color: "#fff",
        padding: theme.spacing(1),
        [theme.breakpoints.down('sm')]: {
            padding: theme.spacing(1.5),
        },
    },
    slider: {
        '& .MuiSlider-thumb': {
            width: 20,
            height: 20,
            [theme.breakpoints.down('sm')]: {
                width: 24,
                height: 24,
            },
        },
        '& .MuiSlider-rail': {
            height: 4,
        },
        '& .MuiSlider-track': {
            height: 4,
        },
    },
    volumeIcon: {
        fontSize: '1.5rem',
        [theme.breakpoints.down('sm')]: {
            fontSize: '1.75rem',
        },
    },
}));

const NotificationsVolume = ({ volume, setVolume, onVolumeChange }) => {
    const classes = useStyles();
    const anchorEl = useRef();
    const [isOpen, setIsOpen] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [hasAudioSupport, setHasAudioSupport] = useState(true);

    useEffect(() => {
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
          (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        setIsIOS(isIOSDevice);
        
        // Inicializa contexto de áudio para iOS/Safari
        if (isIOSDevice) {
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          audioContext.resume();
        }
      
        checkAudioSupport();
      
        const savedVolume = localStorage.getItem("volume");
        const parsedVolume = savedVolume !== null ? parseFloat(savedVolume) : 1;
        setVolume(parsedVolume);
        localStorage.setItem("volume", parsedVolume.toString());
        
        if (onVolumeChange) {
          onVolumeChange(parsedVolume);
        }
      }, []);

    const checkAudioSupport = async () => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            setHasAudioSupport(true);
            await audioContext.close();
        } catch (error) {
            console.warn('Audio support limited:', error);
            setHasAudioSupport(false);
        }
    };

    const handleClick = () => {
        if (isIOS) {
            try {
                if ('vibrate' in navigator) {
                    navigator.vibrate(10);
                }
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                audioContext.resume().then(() => {
                    setIsOpen((prevState) => !prevState);
                });
            } catch (error) {
                setIsOpen((prevState) => !prevState);
            }
        } else {
            setIsOpen((prevState) => !prevState);
        }
    };

    const handleClickAway = () => {
        setIsOpen(false);
    };

    const handleVolumeChange = (event, value) => {
        if (isIOS) {
            event.preventDefault();
        }
        
        try {
            const validVolume = Math.max(0, Math.min(1, value));
            setVolume(validVolume);
            localStorage.setItem("volume", validVolume.toString());
            
            if (onVolumeChange) {
                onVolumeChange(validVolume);
            }
        } catch (error) {
            console.warn('Error saving volume:', error);
        }
    };

    const isDisabled = !hasAudioSupport;

    const getVolumeIcon = () => {
        if (isDisabled) return <VolumeOffIcon className={classes.volumeIcon} color="inherit" />;
        if (volume === 0) return <VolumeOffIcon className={classes.volumeIcon} color="inherit" />;
        if (volume < 0.5) return <VolumeDownIcon className={classes.volumeIcon} color="inherit" />;
        return <VolumeUpIcon className={classes.volumeIcon} color="inherit" />;
    };

    return (
        <>
            <IconButton
                className={classes.icons}
                onClick={handleClick}
                ref={anchorEl}
                disabled={isDisabled}
                aria-label="Controle de Volume"
                size="large"
                TouchRippleProps={{
                    center: isIOS
                }}
            >
                {getVolumeIcon()}
            </IconButton>
            <Popover
                disableScrollLock
                open={isOpen}
                anchorEl={anchorEl.current}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                classes={{ paper: classes.popoverPaper }}
                onClose={handleClickAway}
                PaperProps={{
                    elevation: isIOS ? 2 : 8,
                }}
            >
                <List dense className={classes.tabContainer}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item>
                            <VolumeDownIcon 
                                className={classes.volumeIcon}
                                color={isDisabled ? "disabled" : "inherit"}
                            />
                        </Grid>
                        <Grid item xs>
                            <Slider
                                value={volume}
                                className={classes.slider}
                                aria-labelledby="volume-slider"
                                step={0.1}
                                min={0}
                                max={1}
                                onChange={handleVolumeChange}
                                disabled={isDisabled}
                                aria-label="Volume"
                            />
                        </Grid>
                        <Grid item>
                            <VolumeUpIcon 
                                className={classes.volumeIcon}
                                color={isDisabled ? "disabled" : "inherit"}
                            />
                        </Grid>
                    </Grid>
                </List>
            </Popover>
        </>
    );
};

NotificationsVolume.propTypes = {
    volume: PropTypes.number,
    setVolume: PropTypes.func.isRequired,
    onVolumeChange: PropTypes.func
};

NotificationsVolume.defaultProps = {
    volume: 1,
    onVolumeChange: undefined
};

export default NotificationsVolume;