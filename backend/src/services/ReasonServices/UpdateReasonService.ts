import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Reason from "../../models/Reason";
import {Op} from "sequelize";

interface Request {
    id: number;
    name?: string;
    message?: string;
    companyId: number;
}

const UpdateReasonService = async ({
                                       id,
                                       name,
                                       message,
                                       companyId
                                   }: Request): Promise<Reason> => {
    const schema = Yup.object().shape({
        id: Yup.number().required(),
        name: Yup.string().min(3),
        message: Yup.string(),
        companyId: Yup.number().required()
    });

    try {
        await schema.validate({ id, name, message, companyId });
    } catch (err: any) {
        throw new AppError(err.message);
    }

    const reason = await Reason.findOne({
        where: { id, companyId }
    });

    if (!reason) {
        throw new AppError("Motivo não encontrado!");
    }

    if (name !== undefined) {
        const reasonWithSameName = await Reason.findOne({
            where: { name, companyId, id: { [Op.not]: id } }
        });

        if (reasonWithSameName) {
            throw new AppError("Já existe um motivo com este nome para esta empresa.");
        }

        reason.name = name;
    }

    if (message !== undefined) reason.message = message;

    await reason.save();

    return reason;
};

export default UpdateReasonService;
