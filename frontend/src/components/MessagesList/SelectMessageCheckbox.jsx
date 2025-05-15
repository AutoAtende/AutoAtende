import React from "react";
import { toast } from "../../helpers/toast";
import { Checkbox } from "@mui/material";


const SelectMessageCheckbox = ({ message, showSelectMessageCheckbox, selectedMessagesList, setSelectedMessagesList }) => {
    const [isChecked, setIsChecked] = React.useState(false);

    const handleSelectMessage = (e, message) => {
        const list = selectedMessagesList;
        if (e.target.checked) {
          if (list.length >= 4) {
            toast.error("Não é possível selecionar mais de 4 mensagens para encaminhar.");
            return;
          }
          setIsChecked(true);
          list.push(message);
        } else {
          const index = list.findIndex((m) => m.id === message.id);
          list.splice(index, 1);
          setIsChecked(false);
        }
        setSelectedMessagesList(list);
      }

    if (showSelectMessageCheckbox) {
        return <Checkbox color="primary" checked={isChecked} onChange={(e) => handleSelectMessage(e, message)}  />;
    } else {
        return null;
    }
}

export default SelectMessageCheckbox;