import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Reason from "../../models/Reason";

interface Request {
    name: string;
    message: string;
    companyId: number;
}

const CreateReasonService = async ({
                                       name,
                                       message,
                                       companyId
                                   }: Request): Promise<Reason> => {
    const schema = Yup.object().shape({
        name: Yup.string().required().min(3),
        message: Yup.string().required(),
        companyId: Yup.number().required()
    });

    try {
        await schema.validate({ name, message, companyId });
    } catch (err: any) {
        throw new AppError(err.message);
    }

    const reasonExists = await Reason.findOne({
        where: { name, companyId }
    });

    if (reasonExists) {
        throw new AppError("Já existe um motivo com este nome para esta empresa.");
    }

    return Reason.create({
        name,
        message,
        companyId
    });
};

export default CreateReasonService;
