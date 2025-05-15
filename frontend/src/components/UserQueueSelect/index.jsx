// QueueSelect.jsx
import React, { useEffect, useState } from "react";
import makeStyles from '@mui/styles/makeStyles';
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Chip from "@mui/material/Chip";
import { toast } from "../../helpers/toast";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles(theme => ({
    chips: {
        display: "flex",
        flexWrap: "wrap",
    },
    chip: {
        margin: 2,
    },
}));

const UserQueueSelect = ({ selectedQueueIds, companyId, onChange }) => {
    const classes = useStyles();
    const [queues, setQueues] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get("/queue", {
                    params: { companyId }
                });
                setQueues(data);
            } catch (err) {
                toast.error(err);
            }
        })();
    }, [companyId]);

    useEffect(() => {
        // Garantir que selectedQueueIds seja sempre um array de números
        if (selectedQueueIds && Array.isArray(selectedQueueIds)) {
            const normalizedIds = selectedQueueIds.map(queue => 
                typeof queue === 'object' ? queue.id : parseInt(queue)
            ).filter(id => !isNaN(id));
            
            if (JSON.stringify(normalizedIds) !== JSON.stringify(selectedQueueIds)) {
                onChange(normalizedIds);
            }
        }
    }, [selectedQueueIds]);

    const handleChange = e => {
        const selectedIds = e.target.value;
        // Garantir que estamos passando um array de números
        const normalizedIds = selectedIds.map(id => parseInt(id)).filter(id => !isNaN(id));
        onChange(normalizedIds);
    };

    // Garantir que o value do Select seja sempre um array de números
    const normalizedSelectedIds = Array.isArray(selectedQueueIds) 
        ? selectedQueueIds.map(queue => typeof queue === 'object' ? queue.id : parseInt(queue)).filter(id => !isNaN(id))
        : [];

    return (
        <div style={{ marginTop: 6 }}>
            <FormControl fullWidth variant="outlined">
                <InputLabel>{i18n.t("queueSelect.inputLabel")}</InputLabel>
                <Select
                    multiple
                    labelWidth={60}
                    value={normalizedSelectedIds}
                    onChange={handleChange}
                    MenuProps={{
                        anchorOrigin: {
                            vertical: "bottom",
                            horizontal: "left",
                        },
                        transformOrigin: {
                            vertical: "top",
                            horizontal: "left",
                        },
                        getContentAnchorEl: null,
                    }}
                    renderValue={selected => (
                        <div className={classes.chips}>
                            {selected?.length > 0 &&
                                selected.map(id => {
                                    const queue = queues.find(q => q.id === id);
                                    return queue ? (
                                        <Chip
                                            key={id}
                                            style={{ backgroundColor: queue.color }}
                                            variant="outlined"
                                            label={queue.name}
                                            className={classes.chip}
                                        />
                                    ) : null;
                                })}
                        </div>
                    )}
                >
                    {queues.map(queue => (
                        <MenuItem key={queue.id} value={queue.id}>
                            {queue.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </div>
    );
};

export default UserQueueSelect;