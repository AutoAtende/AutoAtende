import React from "react";

import { grey } from "@mui/material/colors";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";

const ConnectionIcon = ({ connectionType }) => {

    return (
        <React.Fragment>
            {connectionType === 'whatsapp' && <WhatsAppIcon fontSize="small" style={{ marginBottom: '-5px', color: "#25D366" }} />}
            {connectionType === 'instagram' && <InstagramIcon fontSize="small" style={{ marginBottom: '-5px', color: "#e1306c" }} />}
            {connectionType === 'facebook' && <FacebookIcon fontSize="small" style={{ marginBottom: '-5px', color: "#3b5998" }} />}
        </React.Fragment>
    );
};

export default ConnectionIcon;
