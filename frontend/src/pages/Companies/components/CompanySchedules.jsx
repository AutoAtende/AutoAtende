import React, { useContext, useState} from "react";
import { useTheme } from "@mui/material/styles";
import { Formik, Form, Field } from "formik";
import { TextField } from "@mui/material";
import { i18n } from "../../../translate/i18n";
import ButtonWithSpinner from "../../../components/ButtonWithSpinner";
import { toast } from "../../../helpers/toast";
import { AuthContext } from "../../../context/Auth/AuthContext";
import api from "../../../services/api";

const TimeInput = ({ field, label }) => (
  <TextField
    {...field}
    label={label}
    variant="outlined"
    type="time"
    InputLabelProps={{ shrink: true }}
    inputProps={{ 
      step: 300,
      style: { width: '100px' } // Reduz o tamanho do input
    }}
    size="small" // Reduz a altura do input
    className="w-full"
  />
);

const SchedulesForm = ({ 
  initialValues, 
  onSubmit: externalOnSubmit, 
  loading: externalLoading,
  companyId,
  labelSaveButton = "Salvar" 
}) => {
  const theme = useTheme();
  const [loading, setLoading] = React.useState(false);
  const { user } = useContext(AuthContext);

  const defaultSchedules = [
    { weekday: i18n.t("daysweek.day1"), weekdayEn: "monday" },
    { weekday: i18n.t("daysweek.day2"), weekdayEn: "tuesday" },
    { weekday: i18n.t("daysweek.day3"), weekdayEn: "wednesday" },
    { weekday: i18n.t("daysweek.day4"), weekdayEn: "thursday" },
    { weekday: i18n.t("daysweek.day5"), weekdayEn: "friday" },
    { weekday: i18n.t("daysweek.day6"), weekdayEn: "saturday" },
    { weekday: i18n.t("daysweek.day7"), weekdayEn: "sunday" },
  ].map(day => ({
    ...day,
    startTime: "",
    endTime: "",
    startLunchTime: "",
    endLunchTime: "",
  }));

  const schedules = initialValues?.length > 0 ? initialValues : defaultSchedules;

  const handleSubmit = async (values) => {
    setLoading(true);
    
    try {
      const formattedSchedules = values.schedules.map(schedule => ({
        ...schedule,
        startTime: schedule.startTime || "00:00",
        endTime: schedule.endTime || "23:59",
        startLunchTime: schedule.startLunchTime || null,
        endLunchTime: schedule.endLunchTime || null
      }));
  
      const response = await api.put(`/companies/${user.companyId}/schedules`, {
        schedules: formattedSchedules
      });
  
      // Só executa o onSubmit externo se a requisição for bem sucedida
      if (response.data && externalOnSubmit) {
        externalOnSubmit(formattedSchedules);
      }
  
      toast.success("Horários salvos com sucesso!");
    } catch (error) {
      console.error(error);
      // Usa a mensagem de erro da API se disponível, senão usa mensagem padrão
      const errorMessage = error?.response?.data?.error || "Erro ao salvar horários";
      toast.error(errorMessage);
      // Retorna false para indicar que houve erro
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Formik
      initialValues={{ schedules }}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ values }) => (
        <Form className="space-y-6">
          <div className="space-y-6">
            {values.schedules.map((schedule, index) => (
              <div key={schedule.weekdayEn} className="bg-white shadow-md rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">{schedule.weekday}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Field name={`schedules.${index}.startTime`}>
                    {({ field }) => (
                      <TimeInput 
                        field={field} 
                        label="Hora Inicial" 
                      />
                    )}
                  </Field>
                  <Field name={`schedules.${index}.endTime`}>
                    {({ field }) => (
                      <TimeInput 
                        field={field} 
                        label="Hora Final" 
                      />
                    )}
                  </Field>
                  <Field name={`schedules.${index}.startLunchTime`}>
                    {({ field }) => (
                      <TimeInput 
                        field={field} 
                        label="Início do Almoço" 
                      />
                    )}
                  </Field>
                  <Field name={`schedules.${index}.endLunchTime`}>
                    {({ field }) => (
                      <TimeInput 
                        field={field} 
                        label="Fim do Almoço" 
                      />
                    )}
                  </Field>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-8">
            <ButtonWithSpinner
              loading={loading || externalLoading}
              type="submit"
              color="primary"
              variant="contained"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {labelSaveButton}
            </ButtonWithSpinner>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default SchedulesForm;