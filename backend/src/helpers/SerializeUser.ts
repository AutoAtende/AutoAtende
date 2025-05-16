import { SerializedUser } from '../@types/User';
import User from "../models/User";

export const SerializeUser = async (user: User): Promise<SerializedUser> => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    profile: user.profile,
    profilePic: user.profilePic,
    number: user.number,
    color: user.color,
    companyId: user.companyId,
    company: user.company ? {
      id: user.company.id,
      name: user.company.name,
      status: user.company.status,
      dueDate: user.company.dueDate,
      settings: user.company.settings?.map(s => ({
        key: s.key,
        value: s.value
      }))
    } : null,
    super: user.super,
    queues: user.queues?.map(q => ({
      id: q.id,
      name: q.name,
      color: q.color
    })) || [],
    allTicket: user.allTicket,
    startWork: user.startWork,
    endWork: user.endWork,
    spy: user.spy,
    isTricked: user.isTricked,
    defaultMenu: user.defaultMenu,
    tokenVersion: user.tokenVersion,
    ramal: user.ramal,
    notifyNewTicket: user.notifyNewTicket,
    notifyTask: user.notifyTask,
    canManageSchedulesNodesData: user.canManageSchedulesNodesData,
    whatsapp: user.whatsapp ? {
      id: user.whatsapp.id,
      name: user.whatsapp.name,
      status: user.whatsapp.status
    } : null
  };
};