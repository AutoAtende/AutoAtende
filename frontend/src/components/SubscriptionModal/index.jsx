import React, { useEffect, useRef } from "react";


import makeStyles from '@mui/styles/makeStyles';
import { green } from "@mui/material/colors";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import CheckoutPage from "../CheckoutPage/";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  textField: {
    marginRight: theme.spacing(1),
    flex: 1,
  },

  extraAttr: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  btnWrapper: {
    position: "relative",
  },

  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
}));

const ContactModal = ({ open, onClose, Invoice, contactId, initialValues, onSave }) => {
  const classes = useStyles();
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleClose = () => {
    if (isMounted.current) {
      onClose();
    }
  };

    // Só renderiza o conteúdo se tiver uma Invoice válida
    if (!Invoice?.id) {
      return null;
    }

    return (
      <div className={classes.root}>
        <Dialog 
          open={open} 
          onClose={handleClose} 
          maxWidth="md" 
          scroll="paper"
        >
          <DialogContent dividers>
            <CheckoutPage
              Invoice={Invoice} 
              onClose={handleClose}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  };
  
  export default ContactModal;
