import React, { useEffect, useState, useContext } from 'react';
import { useHistory } from "react-router-dom";
import api from "../../services/api";

import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import { Button, Divider } from "@mui/material";

import { AuthContext } from "../../context/Auth/AuthContext";
import { GlobalContext } from '../../context/GlobalContext';
import { toast } from '../../helpers/toast';
import { useLoading } from '../../hooks/useLoading';

const VcardPreview = ({ contact, numbers, comandoAdicional, ticket }) => {
    const history = useHistory();
    const { user } = useContext(AuthContext);
    const companyId = localStorage.getItem("companyId");
    const [selectedQueue] = useState(ticket?.queueId || null);
    const [selectedWhatsapp] = useState(ticket?.whatsappId || null);
    const { setMakeRequestUpdateVCard, setTabOpen, setMakeRequestTicketList } = useContext(GlobalContext);
    const { Loading } = useLoading();

    const validateContactData = (name, number) => {
        if (!name || typeof name !== 'string') {
            throw new Error('Nome do contato inválido');
        }

        // Remove caracteres não numéricos e valida o número
        const cleanNumber = number.replace(/\D/g, "");
        if (!cleanNumber || cleanNumber.length < 10) {
            throw new Error('Número de telefone inválido');
        }

        return {
            name: name.trim(),
            number: cleanNumber
        };
    };

    const handleNewChat = async () => {
        try {
            Loading.turnOn();

            // Validação dos dados antes de enviar
            const validatedData = validateContactData(contact, numbers);
            
            // Criar ou encontrar contato
            const { data: contactData } = await api.post("/contacts/findOrCreate", {
                name: validatedData.name,
                number: validatedData.number
            });

            if (!contactData?.id) {
                throw new Error('Erro ao processar dados do contato');
            }

            // Criar ticket
            const { data: ticket } = await api.post("/tickets", {
                contactId: contactData.id,
                userId: user.id,
                status: "open",
                companyId,
                queueId: selectedQueue,
                whatsappId: selectedWhatsapp,
            });

            if (!ticket?.uuid) {
                throw new Error('Erro ao criar ticket');
            }

            setMakeRequestUpdateVCard(Math.random());
            setTabOpen('open');
            setMakeRequestTicketList(Math.random());
            history.push(`/tickets/${ticket.uuid}`);

        } catch (err) {
            console.error(err);
            toast.error(err.message || "Erro ao criar conversa. Verifique os dados do contato.");
        } finally {
            Loading.turnOff();
        }
    };

    return (
        <div style={{ minWidth: "250px" }}>
            <Grid container spacing={1}>
                <Grid item xs={2}>
                    <Avatar 
                        imgProps={{ loading: "lazy" }}
                        src="" 
                    />
                </Grid>
                <Grid item xs={9}>
                    <Typography 
                        style={{ marginTop: "12px", marginLeft: "10px" }} 
                        variant="subtitle1" 
                        color="primary" 
                        gutterBottom
                    >
                        {contact}
                    </Typography>
                </Grid>
                <Grid item xs={12}>
    <Divider />
    <Button 
        fullWidth 
        color="primary" 
        onClick={handleNewChat}
        disabled={!contact || !numbers}
    >
        Conversar
    </Button>
    {(!contact || !numbers) && (
        <Typography variant="caption" color="error" align="center" style={{ display: 'block', marginTop: 4 }}>
            Número de telefone inválido ou não encontrado
        </Typography>
    )}
</Grid>
            </Grid>
            {comandoAdicional === '<br>' && (
                <div style={{ marginTop: "8px", borderTop: "1px dotted #b0a8a8" }} />
            )}
        </div>
    );
};

export default VcardPreview;