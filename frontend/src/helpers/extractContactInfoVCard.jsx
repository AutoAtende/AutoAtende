// helpers/extractContactInfoVCard.js
export const extractContactInfo = (vcardArray) => {
    try {
        let name = "";
        let phoneNumber = "";
        
        // Verificação de array válido
        if (!Array.isArray(vcardArray) || vcardArray.length === 0) {
            return { name: "Contato", phoneNumber: "" };
        }
        
        // Procurar nome (FN:)
        const nameLine = vcardArray.find(line => 
            typeof line === 'string' && line.startsWith("FN:")
        );
        if (nameLine) {
            name = nameLine.substring(3).trim();
        }
        
        // Se não encontrou nome FN, procurar no N:
        if (!name) {
            const nLine = vcardArray.find(line => 
                typeof line === 'string' && line.startsWith("N:")
            );
            if (nLine) {
                // N: formato é sobrenome;nome;...
                const parts = nLine.substring(2).split(';');
                name = (parts[1] && parts[0]) 
                    ? `${parts[1].trim()} ${parts[0].trim()}`
                    : parts[1] || parts[0] || "Contato";
            }
        }
        
        // Procurar número de telefone (TEL;)
        // Primeiro tenta padrão com waid
        let phoneLine = vcardArray.find(line => 
            typeof line === 'string' && line.includes("TEL;waid=")
        );
        
        // Se não encontrou com waid, procura qualquer TEL
        if (!phoneLine) {
            phoneLine = vcardArray.find(line => 
                typeof line === 'string' && line.includes("TEL")
            );
        }
        
        if (phoneLine) {
            // Usar regex para extrair o número - padrão mais abrangente
            const regex = /(?:TEL|TEL;[^:]+):([+\d\s\-()]+)/;
            const match = phoneLine.match(regex);
            if (match) {
                // Remove todos os caracteres não numéricos
                phoneNumber = match[1].replace(/\D/g, '');
            }
        }
        
        return { 
            name: name || "Contato", 
            phoneNumber: phoneNumber || ""
        };
    } catch (error) {
        console.error("Erro ao extrair informações do vCard:", error);
        return { name: "Contato", phoneNumber: "" };
    }
};