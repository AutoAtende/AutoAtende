import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  IconButton, 
  Collapse, 
  useMediaQuery,
  Divider 
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Field } from "formik";
import { KeyboardArrowDown, KeyboardArrowUp, AccessTime, Restaurant, Work } from "@mui/icons-material";
import TimeField from "./TimeField";
import { i18n } from "../../translate/i18n";

/**
 * Card de agenda para um dia da semana com design responsivo
 *
 * @component
 * @param {Object} props - Propriedades do componente
 * @param {Object} props.schedule - Dados do horário para o dia específico
 * @param {number} props.index - Índice do dia no array de dias da semana
 * @param {Object} [props.errors] - Erros de validação para este dia
 * @param {Object} [props.touched] - Estado de touch para os campos deste dia
 * @returns {React.Component} Card de horário do dia
 */
const DayScheduleCard = ({ schedule, index, errors, touched }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [expanded, setExpanded] = useState(true);

  const toggleExpanded = useCallback(() => {
    setExpanded(prev => !prev);
  }, []);

  // Verifica se há erros para dar destaque visual
  const hasErrors = errors && Object.keys(errors).length > 0;

  return (
    <Paper
      elevation={hasErrors ? 3 : 1}
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        borderRadius: 2,
        position: "relative",
        overflow: "hidden",
        border: hasErrors ? `1px solid ${theme.palette.error.main}` : "none",
      }}
    >
      <Box sx={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        mb: 2
      }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <AccessTime 
            sx={{ 
              mr: 1, 
              color: theme.palette.primary.main,
              fontSize: { xs: '1.5rem', md: '1.75rem' }
            }} 
          />
          <Typography 
            variant="h6" 
            component="h3" 
            sx={{ 
              fontWeight: 600,
              fontSize: { xs: '1.1rem', md: '1.3rem' }
            }}
          >
            {schedule.weekday}
          </Typography>
        </Box>
        {isMobile && (
          <IconButton 
            onClick={toggleExpanded} 
            size="medium"
            aria-expanded={expanded}
            aria-label={expanded ? i18n.t("serviceHours.collapse") : i18n.t("serviceHours.expand")}
          >
            {expanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        )}
      </Box>
      
      {(expanded || !isMobile) && (
        <Collapse in={expanded} timeout={300}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2, color: theme.palette.text.secondary }}>
              {i18n.t("serviceHours.workingHours")}
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Work fontSize="small" sx={{ mr: 1, color: theme.palette.info.main }} />
                  <Typography variant="body2">
                    {i18n.t("serviceHours.workTime")}
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Field name={`schedules.${index}.startTime`}>
                      {({ field, meta }) => (
                        <TimeField
                          field={field}
                          meta={meta}
                          label={i18n.t("serviceHours.startTime")}
                          icon="start"
                        />
                      )}
                    </Field>
                  </Grid>
                  <Grid item xs={6}>
                    <Field name={`schedules.${index}.endTime`}>
                      {({ field, meta }) => (
                        <TimeField
                          field={field}
                          meta={meta}
                          label={i18n.t("serviceHours.endTime")}
                          icon="end"
                        />
                      )}
                    </Field>
                  </Grid>
                </Grid>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Restaurant fontSize="small" sx={{ mr: 1, color: theme.palette.warning.main }} />
                  <Typography variant="body2">
                    {i18n.t("serviceHours.lunchTime")}
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Field name={`schedules.${index}.startLunchTime`}>
                      {({ field, meta }) => (
                        <TimeField
                          field={field}
                          meta={meta}
                          label={i18n.t("serviceHours.startLunchTime")}
                          icon="lunch"
                          optional
                        />
                      )}
                    </Field>
                  </Grid>
                  <Grid item xs={6}>
                    <Field name={`schedules.${index}.endLunchTime`}>
                      {({ field, meta }) => (
                        <TimeField
                          field={field}
                          meta={meta}
                          label={i18n.t("serviceHours.endLunchTime")}
                          icon="lunch"
                          optional
                        />
                      )}
                    </Field>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            
            {hasErrors && (
              <Box 
                sx={{ 
                  mt: 2, 
                  p: 1.5, 
                  bgcolor: 'error.light', 
                  borderRadius: 1,
                  color: 'error.contrastText'
                }}
              >
                <Typography variant="caption" component="div">
                  {Object.values(errors).map((error, i) => (
                    <div key={i}>{error}</div>
                  ))}
                </Typography>
              </Box>
            )}
          </Box>
        </Collapse>
      )}
    </Paper>
  );
};

DayScheduleCard.propTypes = {
  schedule: PropTypes.shape({
    weekday: PropTypes.string.isRequired,
    weekdayEn: PropTypes.string.isRequired,
    startTime: PropTypes.string,
    endTime: PropTypes.string,
    startLunchTime: PropTypes.string,
    endLunchTime: PropTypes.string
  }).isRequired,
  index: PropTypes.number.isRequired,
  errors: PropTypes.object,
  touched: PropTypes.object
};

export default React.memo(DayScheduleCard);