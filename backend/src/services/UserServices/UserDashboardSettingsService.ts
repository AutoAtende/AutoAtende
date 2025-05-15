// services/UserDashboardSettingsService.ts
import UserDashboardSettings from "../../models/UserDashboardSettings";
import AppError from "../../errors/AppError";

interface ComponentVisibility {
  id: string;
  visible: boolean;
}

interface TabSettings {
  id: string;
  components: ComponentVisibility[];
}

interface DashboardSettings {
  tabs: TabSettings[];
}

export const getDashboardSettings = async (userId: number): Promise<DashboardSettings> => {
  const settings = await UserDashboardSettings.findOne({
    where: { userId }
  });

  if (!settings) {
    // Retornar configurações padrão (tudo visível)
    return getDefaultDashboardSettings();
  }

  return settings.settings as DashboardSettings;
};

export const updateDashboardSettings = async (
  userId: number,
  settings: DashboardSettings
): Promise<UserDashboardSettings> => {
  const [dashboardSettings, created] = await UserDashboardSettings.findOrCreate({
    where: { userId },
    defaults: {
      userId,
      settings
    }
  });

  if (!created) {
    await dashboardSettings.update({ settings });
  }

  return dashboardSettings;
};

export const updateComponentVisibility = async (
  userId: number,
  tabId: string,
  componentId: string,
  visible: boolean
): Promise<UserDashboardSettings> => {
  let settings = await getDashboardSettings(userId);
  
  const tabIndex = settings.tabs.findIndex(tab => tab.id === tabId);
  
  if (tabIndex === -1) {
    throw new AppError("Aba não encontrada", 404);
  }
  
  const componentIndex = settings.tabs[tabIndex].components.findIndex(
    comp => comp.id === componentId
  );
  
  if (componentIndex === -1) {
    throw new AppError("Componente não encontrado", 404);
  }
  
  settings.tabs[tabIndex].components[componentIndex].visible = visible;
  
  return updateDashboardSettings(userId, settings);
};

// Configurações padrão - Todos os componentes visíveis
export const getDefaultDashboardSettings = (): DashboardSettings => {
  return {
    tabs: [
      {
        id: "overviewTab",
        components: [
          { id: "totalTicketsCard", visible: true },
          { id: "totalMessagesCard", visible: true },
          { id: "timeAvgCard", visible: true },
          { id: "newContactsCard", visible: true },
          { id: "dailyActivityChart", visible: true },
          { id: "ticketsStatusChart", visible: true },
          { id: "ratingCard", visible: true }
        ]
      },
      {
        id: "ticketsTab",
        components: [
          { id: "ticketsStatusChart", visible: true },
          { id: "ticketsQueueChart", visible: true },
          { id: "ticketsUserTable", visible: true },
          { id: "ticketsHourChart", visible: true },
          { id: "ticketsWeekdayChart", visible: true },
          { id: "resolutionTimeChart", visible: true },
          { id: "serviceMetricsCard", visible: true }
        ]
      },
      {
        id: "usersTab",
        components: [
          { id: "ticketsPerUserChart", visible: true },
          { id: "messagesPerUserChart", visible: true },
          { id: "resolutionTimePerUserChart", visible: true },
          { id: "ratingsChart", visible: true },
          { id: "performanceTable", visible: true }
        ]
      },
      {
        id: "contactsTab",
        components: [
          { id: "newContactsChart", visible: true },
          { id: "contactsWeekdayChart", visible: true },
          { id: "contactsHourChart", visible: true },
          { id: "tagsUsedChart", visible: true },
          { id: "contactsTable", visible: true }
        ]
      },
      {
        id: "queuesTab",
        components: [
          { id: "ticketsQueueChart", visible: true },
          { id: "waitTimeChart", visible: true },
          { id: "resolutionTimeChart", visible: true },
          { id: "queueRatingsTable", visible: true },
          { id: "queueAnalysisChart", visible: true }
        ]
      },
      {
        id: "tagsTab",
        components: [
          { id: "mostUsedTagsChart", visible: true },
          { id: "resolutionTimeTagsChart", visible: true },
          { id: "tagsStatusChart", visible: true },
          { id: "tagsDetailTable", visible: true }
        ]
      }
    ]
  };
};