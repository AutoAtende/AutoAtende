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

const QueueSelect = ({ selectedQueueIds = [], companyId, onChange }) => {
    const classes = useStyles();
    const [queues, setQueues] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);

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

    // Sincroniza os IDs selecionados quando selectedQueueIds muda
    useEffect(() => {
        const normalizedIds = Array.isArray(selectedQueueIds) 
            ? selectedQueueIds.map(queue => typeof queue === 'object' ? queue.id : Number(queue))
                .filter(id => !isNaN(id) && id > 0)
            : [];
        
        console.log("QueueSelect - IDs normalizados:", normalizedIds);
        setSelectedIds(normalizedIds);
    }, [selectedQueueIds]);

    const handleChange = e => {
        const newSelectedIds = e.target.value;
        console.log("QueueSelect - handleChange recebeu:", newSelectedIds);
        
        // Atualiza o estado interno
        setSelectedIds(newSelectedIds);
        
        // Se a função onChange existir, chama ela com os novos IDs
        if (typeof onChange === 'function') {
            if (Array.isArray(newSelectedIds) && newSelectedIds.length === 0) {
                // Se é um array vazio, passa diretamente o array vazio
                console.log("QueueSelect - Enviando array vazio para callback");
                onChange([]);
            } else {
                // Converte os IDs selecionados em objetos ou números, dependendo do caso
                console.log("QueueSelect - Enviando setores selecionados para callback");
                
                // Enviar apenas os IDs numéricos para simplificar
                onChange(newSelectedIds);
            }
        }
    };

    return (
        <div style={{ marginTop: 6 }}>
            <FormControl fullWidth variant="outlined">
                <InputLabel>{i18n.t("queueSelect.inputLabel")}</InputLabel>
                <Select
                    multiple
                    label={i18n.t("queueSelect.inputLabel")}
                    value={selectedIds}
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

export default QueueSelect;