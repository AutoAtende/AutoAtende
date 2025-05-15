import ScheduleSettings from "../../models/ScheduleSettings";
import AppError from "../../errors/AppError";

interface ScheduleSettingsData {
  scheduleEnabled: boolean;
  minScheduleHoursAhead?: number;
  maxScheduleDaysAhead?: number;
  reminderHours?: number;
  welcomeMessage?: string;
  confirmationMessage?: string;
  reminderMessage?: string;
  cancelMessage?: string;
  noSlotsMessage?: string;
  companyId: number;
}

class ScheduleSettingsService {
  async findOrCreate(companyId: number): Promise<ScheduleSettings> {
    const [settings] = await ScheduleSettings.findOrCreate({
      where: { companyId },
      defaults: {
        scheduleEnabled: true,
        minScheduleHoursAhead: 1,
        maxScheduleDaysAhead: 30,
        reminderHours: 24,
        welcomeMessage: `Olá! Bem-vindo ao nosso sistema de agendamento.\n\nDigite o número da opção desejada:\n1 - Fazer um agendamento\n2 - Consultar meus agendamentos\n3 - Falar com um atendente`,
        confirmationMessage: `Seu agendamento foi recebido com sucesso.\n\nServiço: {service}\nProfissional: {professional}\nData: {date}\nHorário: {time}\n\nPara confirmar este agendamento, responda com *CONFIRMAR*.\nPara cancelar, responda com *CANCELAR*.`,
        reminderMessage: `Olá {name}! Lembrete do seu agendamento para amanhã.\n\nServiço: {service}\nProfissional: {professional}\nData: {date}\nHorário: {time}\n\nAguardamos sua presença!`,
        cancelMessage: `Seu agendamento foi cancelado.\n\nServiço: {service}\nProfissional: {professional}\nData: {date}\nHorário: {time}\n\nPara reagendar, entre em contato conosco.`,
        noSlotsMessage: `Desculpe, não temos horários disponíveis para o dia selecionado. Por favor, tente outra data.`
      }
    });

    return settings;
  }

  async update(settingsData: ScheduleSettingsData): Promise<ScheduleSettings> {
    const { companyId } = settingsData;

    const settings = await this.findOrCreate(companyId);

    await settings.update(settingsData);

    return settings;
  }
}

export default new ScheduleSettingsService();