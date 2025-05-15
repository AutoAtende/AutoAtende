import Report from "../../models/Report";

interface ReportUserParams {
  chatId: number;
  userId: number;
  reportedBy: number;
  reason: string;
}

const ReportUserService = async ({ chatId, userId, reportedBy, reason }: ReportUserParams) => {
  const report = await Report.create({
    chatId,
    userId,
    reportedBy,
    reason,
    status: "pending"
  });

  return report;
};

export default ReportUserService;