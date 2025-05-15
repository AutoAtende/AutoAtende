import React, { useState, useEffect, useContext } from 'react';
import { useHistory } from "react-router-dom";
import QRCode from 'react-qr-code';
import { SuccessContent, Total } from './style';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { FaCopy, FaCheckCircle } from 'react-icons/fa';
import { SocketContext } from "../../../context/Socket/SocketContext";
import { useDate } from "../../../hooks/useDate";
import { toast } from "../../../helpers/toast";
import { AuthContext } from '../../../context/Auth/AuthContext';

function CheckoutSuccess(props) {

  const { pix } = props;
  const {user, socket} = useContext(AuthContext);
  const [pixString,] = useState(pix?.qrcode?.qrcode || '');
  const [stripeURL,] = useState(pix.stripeURL);
  const [asaasURL,] = useState(pix.asaasURL);
  const [mercadopagoURL,] = useState(pix.mercadopagoURL);
  const [valorext,] = useState(pix.valorext);
  const [copied, setCopied] = useState(false);
  const history = useHistory();
  const onClose = props.onClose;

  const { dateToClient } = useDate();

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    if (companyId === null) return () => {};
    const socket = socketManager.GetSocket(companyId);

    const onCompanyPayment = (data) => {
  
        if (data.action === "CONCLUIDA") {
          toast.success(`Sua licença foi renovada até ${dateToClient(data.company.dueDate)}!`);
          setTimeout(() => {
            history.push("/");
          }, 4000);
        }

        if (data.action === "EXPIRADA") {
          toast.error("Transação de cobrança expirou");
          onClose();
        }
      }

      socket.on(`company-${companyId}-payment`, onCompanyPayment);
      
      return () => {
        socket.off(`company-${companyId}-payment`, onCompanyPayment);

      }
    }, [history, dateToClient]);

  const handleCopyQR = () => {
    setTimeout(() => {
      setCopied(false);
    }, 1 * 1000);
    setCopied(true);
  };

  return (
    <React.Fragment>
      <Total>
        <p><span>TOTAL</span></p>
        <strong>R${pix.valor.original.toLocaleString('pt-br', { minimumFractionDigits: 2 })}</strong>
      </Total>

    <SuccessContent>
  
  	{pixString && (
    <>
  
  <QRCode value={pixString}
          style={
            { borderStyle: "solid",
              borderWidth: "1px",
              padding: "5px", 
              borderColor: "black",
              backgroundColor: "white",
              height: "auto",
              maxWidth: "100%" }} />
    <CopyToClipboard text={pixString} onCopy={handleCopyQR}>
      <button className="copy-button" type="button">
        {copied ? (
          <>
            <span>Copiado</span>
            <FaCheckCircle size={18} />
          </>
        ) : (
          <>
            <span>Copiar código QR PIX</span>
            <FaCopy size={18} />
          </>
        )}
      </button>
    </CopyToClipboard>
    <span>
      Para finalizar, basta realizar o pagamento escaneando ou colando o
      código Pix acima ou escolha Pagar com Cartão de Crédito abaixo.
    </span>
	<span><p> </p></span>
    
    </>
    )}
    
    {stripeURL && (
    <>
	<button onClick={() => window.open(stripeURL, '_blank')} type="button"

	style={{
    color: '#3c6afb',
    background: '#ffffff',
    border: '1px solid #3c6afb',
    padding: '6px 16px',
    fontSize: '18px',
    minWidth: '50%',
    boxSizing: 'border-box',
    transition: 'background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: '500',
    lineHeight: '1.75',
    borderRadius: '4px',
    letterSpacing: '0.02857em',
    textTransform: 'uppercase',
    // Add any additional styles here
  	}}

	>
      Pagar com Cartão de Crédito
    </button>
	<span><p> </p></span>
    </>
    )}
    
    
    {mercadopagoURL && (
    <>
    <button onClick={() => window.open(mercadopagoURL, '_blank')} type="button"

	style={{
    color: '#3c6afb',
    background: '#ffffff',
    border: '1px solid #3c6afb',
    padding: '6px 16px',
    fontSize: '18px',
    minWidth: '50%',
    boxSizing: 'border-box',
    transition: 'background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: '500',
    lineHeight: '1.75',
    borderRadius: '4px',
    letterSpacing: '0.02857em',
    textTransform: 'uppercase',
    // Add any additional styles here
  	}}

	>
      Pagar com MercadoPago
    </button>
	<span><p> </p></span>
    </>
    )}
    
    {asaasURL && (
    <>
    <button onClick={() => window.open(asaasURL, '_blank')} type="button"

	style={{
    color: '#3c6afb',
    background: '#ffffff',
    border: '1px solid #3c6afb',
    padding: '6px 16px',
    fontSize: '18px',
    minWidth: '50%',
    boxSizing: 'border-box',
    transition: 'background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: '500',
    lineHeight: '1.75',
    borderRadius: '4px',
    letterSpacing: '0.02857em',
    textTransform: 'uppercase',
    // Add any additional styles here
  	}}

	>
      Pagar com Asaas
    </button>
	<span><p> </p></span>
    </>
    )}
    
    
</SuccessContent>
    </React.Fragment>
  );
}

export default CheckoutSuccess;
