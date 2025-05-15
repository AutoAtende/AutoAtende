import React, { useState } from "react";

import makeStyles from '@mui/styles/makeStyles';
import { CssBaseline, IconButton } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

const useStyles = makeStyles((theme) => ({
    icons: {
        color: "#fff",
    },
    switch: {
        color: "#fff",
    },
    visible: {
        display: "none",
    },
    btnHeader: {
        color: "#fff",
    },
}));

const DarkMode = (props) => {
    const classes = useStyles();

    const [theme, setTheme] = useState("light");

    const themeToggle = () => {
        theme === "light" ? setTheme("dark") : setTheme("light");
    };

    const handleClick = () => {
        props.themeToggle();
        themeToggle();
    };

    return <>
        {theme === "light" ? (
            <>
                <CssBaseline />
                <IconButton
                    className={classes.icons}
                    onClick={handleClick}
                    // ref={anchorEl}
                    aria-label="Dark Mode"
                    color="inherit"
                    size="large">
                    <Brightness4Icon />
                </IconButton>
            </>
        ) : (
            <>
                <CssBaseline />
                <IconButton
                    className={classes.icons}
                    onClick={handleClick}
                    // ref={anchorEl}
                    aria-label="Dark Mode"
                    color="inherit"
                    size="large">
                    <Brightness7Icon />
                </IconButton>
            </>
        )}
    </>;
};

export default DarkMode;
