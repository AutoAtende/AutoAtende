import React, { useContext, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  IconButton,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Divider,
  Skeleton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { QrCodePix } from 'qrcode-pix';
import makeStyles from "@mui/styles/makeStyles";
import moment from 'moment';
import ColorModeContext from '../../layout/themeContext';
import { toast } from '../../helpers/toast';
import { i18n } from "../../translate/i18n";
import useCompanies from '../../hooks/useCompanies';
import { useTheme } from "@mui/material/styles";

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    padding: theme.spacing(3),
    minWidth: '600px'
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1)
  },
  logo: {
    height: '50px',
    marginBottom: theme.spacing(3)
  },
  invoiceHeader: {
    marginBottom: theme.spacing(3)
  },
  qrCodeSection: {
    textAlign: 'center',
    padding: theme.spacing(2),
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(3)
  },
  qrCode: {
    background: 'white',
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius
  },
  table: {
    marginBottom: theme.spacing(3)
  },
  footer: {
    marginTop: theme.spacing(3),
    fontSize: '0.8em',
    color: theme.palette.text.secondary
  },
  companyInfo: {
    marginBottom: theme.spacing(2),
    '& > p': {
      margin: theme.spacing(0.5, 0)
    }
  },
  skeleton: {
    margin: theme.spacing(1, 0)
  },
  errorMessage: {
    color: theme.palette.error.main,
    marginTop: theme.spacing(1)
  }
}));

const CompanyInfo = ({ loading, company, error }) => {
  const classes = useStyles();

  if (loading) {
    return (
      <div className={classes.companyInfo}>
        <Skeleton width="60%" height={24} className={classes.skeleton} />
        <Skeleton width="40%" height={20} className={classes.skeleton} />
        <Skeleton width="50%" height={20} className={classes.skeleton} />
        <Skeleton width="45%" height={20} className={classes.skeleton} />
      </div>
    );
  }

  if (error) {
    return (
      <Typography className={classes.errorMessage}>
        {i18n.t("financial.errorLoadingCompany")}
      </Typography>
    );
  }

  return (
    <div className={classes.companyInfo}>
      <Typography variant="body1" component="p">
        <strong>{company?.name}</strong>
      </Typography>
      <Typography variant="body2" component="p">
        {company?.email}
      </Typography>
      <Typography variant="body2" component="p">
        {company?.phone}
      </Typography>
    </div>
  );
};


const InvoicePreview = ({ open, onClose, invoice, payerCompany }) => {
  const classes = useStyles();
  const theme = useTheme();
  const { colorMode } = useContext(ColorModeContext);
  const logoUrl = colorMode === 'light' ? theme.calculatedLogoLight() : theme.calculatedLogoDark();
  const companiesService = useCompanies();
  
  const [mainCompany, setMainCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrCodeImage, setQrCodeImage] = useState('');
  const [qrCodePayload, setQrCodePayload] = useState('');

  useEffect(() => {
    const fetchMainCompany = async () => {
      try {
        setLoading(true);
        const data = await companiesService.find(1);
        setMainCompany(data);
      } catch (err) {
        console.error('Erro ao buscar empresa principal:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMainCompany();
  }, []);

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        if (mainCompany && invoice) {
          const qrCodePix = QrCodePix({
            version: '01',
            key: mainCompany.pixKey, // Substitua pela chave PIX real
            name: mainCompany.name,
            city: mainCompany.city,
            transactionId: `INV${invoice.id}`.substring(0, 25), // Limita a 25 caracteres
            message: `Fatura #${invoice.id}`,
            cep: mainCompany.cep,
            value: parseFloat(invoice.value)
          });

          const base64Image = await qrCodePix.base64();
          const payload = qrCodePix.payload();
          
          setQrCodeImage(base64Image);
          setQrCodePayload(payload);
        }
      } catch (error) {
        console.error('Erro ao gerar QR Code PIX:', error);
      }
    };

    if (!loading && mainCompany) {
      generateQRCode();
    }
  }, [mainCompany, invoice, loading]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      aria-labelledby="invoice-preview-title"
    >
      <DialogContent className={classes.dialogContent}>
        <IconButton 
          className={classes.closeButton} 
          onClick={onClose}
          size="large"
          aria-label={i18n.t("financial.closeModal")}
        >
          <CloseIcon />
        </IconButton>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <img src={logoUrl} alt={i18n.t("financial.companyLogo")} className={classes.logo} />
          </Grid>
          
          <Grid item xs={6}>
            <Typography variant="h4">
              {i18n.t("financial.tableInvoice", { number: invoice.id })}
            </Typography>
            <Typography variant="subtitle1">
              {moment(invoice.createdAt).format("DD/MM/YYYY")}
            </Typography>
          </Grid>

          <Grid item xs={6}>
          <div className={classes.qrCodeSection}>
            <Typography variant="h6" gutterBottom>
              {i18n.t("financial.payWithPix")}
            </Typography>
            {qrCodeImage ? (
              <>
                <div className={classes.qrCode}>
                  <img 
                    src={qrCodeImage} 
                    alt="QR Code PIX"
                    style={{ width: '200px', height: '200px' }}
                  />
                </div>
                <Typography variant="body2" style={{ marginTop: '8px' }}>
                  {i18n.t("financial.pixCode")}
                </Typography>
                <Typography 
                  variant="caption" 
                  component="div" 
                  style={{ 
                    wordBreak: 'break-all',
                    padding: '8px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '4px',
                    marginTop: '8px',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    navigator.clipboard.writeText(qrCodePayload);
                    toast.sucess('Código do PIX copiado!');
                  }}
                >
                  {qrCodePayload}
                </Typography>
              </>
            ) : (
              <Skeleton 
                variant="rectangular" 
                width={200} 
                height={200} 
                style={{ margin: '0 auto' }}
              />
            )}
            <Typography variant="h5" style={{ marginTop: '16px' }}>
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(invoice.value)}
            </Typography>
            <Typography variant="body2">
              {i18n.t("financial.dueDate")}: {moment(invoice.dueDate).format("DD/MM/YYYY")}
            </Typography>
          </div>
        </Grid>

          <Grid item xs={6}>
            <Typography variant="h6" gutterBottom>
              {i18n.t("financial.emitter")}
            </Typography>
            <CompanyInfo 
              loading={loading} 
              company={mainCompany} 
              error={error}
            />
          </Grid>

          <Grid item xs={6}>
            <Typography variant="h6" gutterBottom>
              {i18n.t("financial.recipient")}
            </Typography>
            <div className={classes.companyInfo}>
              <Typography variant="body1">
                <strong>{payerCompany.name}</strong>
              </Typography>
              <Typography variant="body2">{payerCompany.email}</Typography>
              <Typography variant="body2">{payerCompany.phone}</Typography>
            </div>
          </Grid>

          <Grid item xs={12}>
            <Table className={classes.table}>
              <TableHead>
                <TableRow>
                  <TableCell>{i18n.t("financial.description")}</TableCell>
                  <TableCell align="right">{i18n.t("financial.value")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>{invoice.detail}</TableCell>
                  <TableCell align="right">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(invoice.value)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Grid>

          <Grid item xs={12}>
            <Divider />
            <Typography className={classes.footer}>
              {i18n.t("financial.terms")}
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default InvoicePreview;