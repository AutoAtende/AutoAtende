import React, { useContext, useState, useMemo } from "react";
import PropTypes from "prop-types";
import { useTheme } from "@mui/material/styles";
import { Box, Typography, Paper, useMediaQuery, Collapse } from "@mui/material";
import { Formik, Form } from "formik";
import { i18n } from "../../translate/i18n";
import ButtonWithSpinner from "../ButtonWithSpinner";
import { toast } from "../../helpers/toast";
import { AuthContext } from "../../context/Auth/AuthContext";
import api from "../../services/api";
import DayScheduleCard from "./DayScheduleCard";
import { validationSchema } from "./schema";
import { defaultWeekdays } from "./constants";
import { formatScheduleForSubmission } from "./utils";

/**
 * Componente de formulário de horários de atendimento com abordagem mobile-first
 *
 * @component
 * @param {Object} props - Propriedades do componente
 * @param {Array} [props.initialValues] - Valores iniciais dos horários
 * @param {Function} [props.onSubmit] - Função a ser executada após submissão bem-sucedida
 * @param {boolean} [props.loading] - Estado de carregamento externo
 * @param {number} [props.companyId] - ID da empresa (opcional, usa o contexto se não fornecido)
 * @param {string} [props.labelSaveButton="Salvar"] - Texto do botão de salvar
 * @returns {React.Component} Componente de formulário de horários
 */
const SchedulesForm = ({
  initialValues,
  onSubmit: externalOnSubmit,
  loading: externalLoading,
  companyId,
  labelSaveButton = "Salvar"
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  // Prepara os valores iniciais dos horários
  const schedules = useMemo(() => {
    return initialValues?.length > 0 
      ? initialValues 
      : defaultWeekdays.map(day => ({
          ...day,
          startTime: "",
          endTime: "",
          startLunchTime: "",
          endLunchTime: "",
        }));
  }, [initialValues]);

  /**
   * Processa o envio do formulário
   * @param {Object} values - Valores do formulário
   * @param {Object} formikHelpers - Objeto com funções auxiliares do Formik
   * @returns {Promise<boolean>} - Resultado do processamento
   */
  const handleSubmit = async (values, { setSubmitting }) => {
    setLoading(true);
    
    try {
      // Verifica se pelo menos um horário foi preenchido (diferente do padrão)
      const hasAtLeastOneSchedule = values.schedules.some(
        schedule => schedule.startTime || schedule.endTime
      );
      
      if (!hasAtLeastOneSchedule) {
        toast.error(i18n.t("serviceHours.defaultError"));
        return false;
      }
      
      const formattedSchedules = formatScheduleForSubmission(values.schedules);
      const targetCompanyId = companyId || user.companyId;
      
      const response = await api.put(`/companies/${targetCompanyId}/schedules`, {
        schedules: formattedSchedules
      });
  
      if (response.data && externalOnSubmit) {
        externalOnSubmit(formattedSchedules);
      }
  
      toast.success(i18n.t("serviceHours.successMessage"));
      return true;
    } catch (error) {
      console.error(error);
      const errorMessage = error?.response?.data?.error || i18n.t("serviceHours.defaultError");
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Formik
        initialValues={{ schedules }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched }) => (
          <Form aria-label={i18n.t("serviceHours.formAriaLabel")}>
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: { xs: 2, sm: 3, md: 4 },
                mb: 4
              }}
            >
              {values.schedules.map((schedule, index) => (
                <DayScheduleCard 
                  key={schedule.weekdayEn}
                  schedule={schedule}
                  index={index}
                  errors={errors?.schedules?.[index]}
                  touched={touched?.schedules?.[index]}
                />
              ))}
            </Box>

            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mt: { xs: 4, md: 6 } 
              }}
            >
              <ButtonWithSpinner
                loading={loading || externalLoading}
                type="submit"
                color="primary"
                variant="contained"
                sx={{
                  px: { xs: 4, md: 6 },
                  py: { xs: 1.5, md: 2 },
                  minWidth: { xs: '60%', sm: '40%', md: '30%' },
                  borderRadius: 2,
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  boxShadow: 3,
                }}
                aria-label={labelSaveButton}
              >
                {labelSaveButton}
              </ButtonWithSpinner>
            </Box>
          </Form>
        )}
      </Formik>
    </div>
  );
};

SchedulesForm.propTypes = {
  initialValues: PropTypes.arrayOf(
    PropTypes.shape({
      weekday: PropTypes.string.isRequired,
      weekdayEn: PropTypes.string.isRequired,
      startTime: PropTypes.string,
      endTime: PropTypes.string,
      startLunchTime: PropTypes.string,
      endLunchTime: PropTypes.string
    })
  ),
  onSubmit: PropTypes.func,
  loading: PropTypes.bool,
  companyId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  labelSaveButton: PropTypes.string
};

export default React.memo(SchedulesForm);