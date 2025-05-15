import Invoices from "../../models/Invoices";
import CompanyService from "../CompanyService/ShowCompanyService";
import axios from "axios";

const FindInvoiceAsaasServices = async (companyId: number | string): Promise<Invoices[]> => {
  let company = await CompanyService(companyId);
  console.log("EMpresa: " ,company);
  let companyDataAsaas = {
    object: '',
    id: '',
    dateCreated: '',
    name: '',
    email: '',
    company: null,
    phone: '',
    mobilePhone: '',
    address: '',
    addressNumber: '',
    complement: null,
    province: '',
    postalCode: '',
    cpfCnpj: '',
    personType: '',
    deleted: false,
    additionalEmails: null,
    externalReference: null,
    notificationDisabled: true,
    observations: '',
    municipalInscription: null,
    stateInscription: null,
    canDelete: true,
    cannotBeDeletedReason: null,
    canEdit: true,
    cannotEditReason: null,
    foreignCustomer: false,
    city: '',
    state: '',
    country: ''
  };

  //Requisição para recuperar os dados no Asaas usando o name vindo do froont
  await axios.get(`https://www.asaas.com/api/v3/customers?name=${company.name}`, {
    headers: {
      'access_token': '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAyODQ2NTE6OiRhYWNoXzFjYjgwYmFmLWZjYTQtNGMzNC04NTJkLWUwZGZmOWQ0ZjE5Zg=='
    }
  })
    .then(function (response) {
      console.log('Status:', response.status);
      console.log('Headers:', response.headers);
      console.log('Data:', response.data);
      companyDataAsaas = response.data.data[0];
      console.log("Company Data Asaas: ", companyDataAsaas);
    })
    .catch(function (error) {
      console.log(error);
    });

  let invoiceData = [];

  //Recuperar a list das cobranças daquela empresa
  await axios.get(`https://www.asaas.com/api/v3/payments?customer=${companyDataAsaas.id}`, {
    headers: {
      'access_token': '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAyODQ2NTE6OiRhYWNoXzFjYjgwYmFmLWZjYTQtNGMzNC04NTJkLWUwZGZmOWQ0ZjE5Zg=='
    }
  })
    .then(function (response) {
      console.log('Status:', response.status);
      console.log('Headers:', response.headers);
      console.log('Data:', response.data);
      invoiceData = response.data.data;
      console.log("Invoice Data: ", invoiceData);
    })
    .catch(function (error) {
      console.log(error);
    });
  return invoiceData;
};

export default FindInvoiceAsaasServices;
