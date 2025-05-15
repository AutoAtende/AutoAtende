import axios from "axios";

interface Pix {
  encodedImage: string;
  payload: string;
  expirationDate: string;
}

const PaymentInvoicesPixServices = async (faturaId: number | string): Promise<Pix> => {
  try {
    const response = await axios.get(`https://www.asaas.com/api/v3/payments/${faturaId}/pixQrCode`, {
      headers: {
        'Content-Type': 'application/json',
        'access_token': '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAyODQ2NTE6OiRhYWNoXzFjYjgwYmFmLWZjYTQtNGMzNC04NTJkLWUwZGZmOWQ0ZjE5Zg=='
      }
    });
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    console.log('Data:', response.data);
    const pixIndentificado: Pix = {
      encodedImage: response.data.encodedImage,
      payload: response.data.payload,
      expirationDate: response.data.expirationDate
    };
    console.log("Pix Asaas: ", pixIndentificado);
    return pixIndentificado;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export default PaymentInvoicesPixServices;
