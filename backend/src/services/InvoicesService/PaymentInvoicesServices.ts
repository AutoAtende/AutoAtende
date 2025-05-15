import axios from "axios";

interface Boleto {
  identificationField: string;
  nossoNumero: string;
  barCode: string;
}

const PaymentInvoicesServices = async (faturaId: number | string): Promise<Boleto> => {
  try {
    const response = await axios.get(`https://www.asaas.com/api/v3/payments/${faturaId}/identificationField`, {
      headers: {
        'Content-Type': 'application/json',
        'access_token': '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAyODQ2NTE6OiRhYWNoXzFjYjgwYmFmLWZjYTQtNGMzNC04NTJkLWUwZGZmOWQ0ZjE5Zg=='
      }
    });
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    console.log('Data:', response.data);
    const boletoIndentificado: Boleto = {
      identificationField: response.data.identificationField,
      nossoNumero: response.data.nossoNumero,
      barCode: response.data.barCode
    };
    console.log("Boleto Asaas: ", boletoIndentificado);
    return boletoIndentificado;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export default PaymentInvoicesServices;
