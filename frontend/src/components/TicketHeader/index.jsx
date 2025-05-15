import React from "react";

import { Card } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import TicketHeaderSkeleton from "../TicketHeaderSkeleton";

const useStyles = makeStyles(theme => ({
	ticketHeader: {
		display: "flex",
		backgroundColor: theme.palette.tabHeaderBackground,
		flex: "none",



		borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
		[theme.breakpoints.down('md')]: {
			flexWrap: "wrap"
		}
	},
}));


const TicketHeader = ({ loading, children }) => {
	const classes = useStyles();

	return (
		<>
			{loading ? (
				<TicketHeaderSkeleton />
			) : (
				<Card square className={classes.ticketHeader}>
					{children}
				</Card>
			)}
		</>
	);
};

export default TicketHeader;
