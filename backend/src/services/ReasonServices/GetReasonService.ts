import Reason from "../../models/Reason";
import AppError from "../../errors/AppError";

interface Request {
    companyId: number;
}

const GetReasonsService = async ({ companyId }: Request): Promise<Reason[]> => {
    const reasons = await Reason.findAll({
        where: { companyId },
        order: [['createdAt', 'DESC']]
    });

    if (!reasons) {
        throw new AppError("Nenhum motivo de encerramento encontrado para esta empresa.");
    }

    return reasons;
};

export default GetReasonsService;
