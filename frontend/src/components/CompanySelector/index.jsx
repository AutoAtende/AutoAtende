import React, { useState, useEffect, useContext } from 'react';
import { 
  Select, 
  MenuItem, 
  FormControl,
  Tooltip,
  IconButton,
  Typography,
  styled
} from '@mui/material';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import BusinessIcon from '@mui/icons-material/Business';
import { AuthContext } from '../../context/Auth/AuthContext';
import api from '../../services/api';
import { toast } from "../../helpers/toast";

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  margin: theme.spacing(0, 1),
  minWidth: 125,
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  color: 'white',
  '&.MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'white',
    },
    '&:hover fieldset': {
      borderColor: 'white',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'white',
    },
  },
  '& .MuiSvgIcon-root': {
    color: 'white',
  }
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.primary.light,
  }
}));

const StyledTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  '& .MuiTooltip-tooltip': {
    backgroundColor: theme.palette.common.white,
    color: theme.palette.text.primary,
    fontSize: 12,
    marginTop: '4px'
  }
}));

const AccessContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginRight: theme.spacing(2)
}));

const CurrentAccessText = styled(Typography)(({ theme }) => ({
  color: 'white',
  marginRight: theme.spacing(1),
  fontSize: '0.875rem'
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: 'white',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  }
}));

const CompanySelector = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, handleLogin } = useContext(AuthContext);
  
  const isAccessingAs = Boolean(user?.originalUser);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const { data } = await api.get('/companies/list');
        setCompanies(data);
      } catch (error) {
        toast.error('Erro ao carregar empresas');
        console.error(error);
      }
    };

    if (user?.super && user?.companyId === 1) {
      fetchCompanies();
    }
  }, [user]);

  const handleCompanyChange = async (event) => {
    const companyId = event.target.value;
    if (!companyId) return;

    try {
      setLoading(true);
      const { data } = await api.post('/auth/access-as', { companyId });
      localStorage.setItem('token', data.token);
      handleLogin(data);
      toast.success('Acessando como administrador da empresa');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao acessar como administrador');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExitAccessAs = async () => {
    try {
      setLoading(true);
      const { data } = await api.post('/auth/exit-access-as');
      localStorage.setItem('token', data.token);
      handleLogin(data);
      toast.success('Retornando à conta de super administrador');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao retornar à conta original');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!user?.super || user?.companyId !== 1) {
    return null;
  }

  if (isAccessingAs) {
    return (
      <AccessContainer>
        <CurrentAccessText>
          Acessando: {user?.company?.name}
        </CurrentAccessText>
        <StyledTooltip title="Retornar à conta principal">
          <StyledIconButton
            onClick={handleExitAccessAs}
            disabled={loading}
            size="small"
          >
            <KeyboardReturnIcon />
          </StyledIconButton>
        </StyledTooltip>
      </AccessContainer>
    );
  }

  return (
    <StyledFormControl size="small">
      <StyledSelect
        value=""
        onChange={handleCompanyChange}
        displayEmpty
        disabled={loading}
        IconComponent={BusinessIcon}
      >
        <MenuItem value="" disabled>
          Acessar como administrador...
        </MenuItem>
        {companies.map((company) => (
          <StyledMenuItem 
            key={company.id} 
            value={company.id}
          >
            {company.name}
          </StyledMenuItem>
        ))}
      </StyledSelect>
    </StyledFormControl>
  );
};

export default CompanySelector;