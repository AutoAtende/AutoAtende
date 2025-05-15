import React from "react";

import makeStyles from '@mui/styles/makeStyles';
import Container from "@mui/material/Container";

const useStyles = makeStyles(theme => ({
	mainContainer: {
		flex: 1,
		padding: theme.spacing(2),
		height: `calc(100% - 48px)`,
		[theme.breakpoints.up('lg')]: {
			maxWidth: '100%'
		},
	},

	contentWrapper: {
		height: "100%",
		// overflowY: "hidden",
		overflowY: (props) => (props?.overflowYShow ? "none" : "hidden"),
		display: "flex",
		flexDirection: "column",
	},
}));

const MainContainer = ({ children, overflowYShow }) => {
	const classes = useStyles({ overflowYShow });

	return (
		<Container className={classes.mainContainer}>
			<div className={classes.contentWrapper}>{children}</div>
		</Container>
	);
};

export default MainContainer;
