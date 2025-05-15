import AppError from "../../errors/AppError";
import Reason from "../../models/Reason";

interface Request {
    id: number;
    companyId: number;
}

const DeleteReasonService = async ({ id, companyId }: Request): Promise<void> => {
    const reason = await Reason.findOne({
        where: { id, companyId }
    });

    if (!reason) {
        throw new AppError("Motivo não encontrado!");
    }

    await reason.destroy({ force: true });
};

export default DeleteReasonService;
