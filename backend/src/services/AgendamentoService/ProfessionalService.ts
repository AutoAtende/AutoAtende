import { Op } from "sequelize";
import Professional from "../../models/Professional";
import Service from "../../models/Service";
import Availability from "../../models/Availability";
import AppError from "../../errors/AppError";
import Company from "../../models/Company";
import User from "../../models/User";

interface ProfessionalData {
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  profileImage?: string;
  userId?: number;
  serviceIds?: number[];
  companyId: number;
}

interface UpdateProfessionalData {
  name?: string;
  description?: string;
  email?: string;
  phone?: string;
  profileImage?: string;
  userId?: number;
  serviceIds?: number[];
  active?: boolean;
}

interface ProfessionalFilters {
  searchParam?: string;
  companyId: number;
  serviceId?: number;
  active?: boolean;
}

class ProfessionalService {
  async create(professionalData: ProfessionalData): Promise<Professional> {
    const { name, serviceIds, companyId } = professionalData;

    const nameExists = await Professional.findOne({
      where: { 
        name, 
        companyId 
      }
    });

    if (nameExists) {
      throw new AppError("ERR_PROFESSIONAL_NAME_ALREADY_EXISTS");
    }

    const professional = await Professional.create(professionalData);

    if (serviceIds && serviceIds.length > 0) {
      await professional.$set("services", serviceIds);
    }

    await professional.reload({
      include: [
        { model: Service },
        { model: Company },
        { model: User, attributes: ["id", "name"] }
      ]
    });

    console.log("[PROFESSIONALSERVICE] create - Professional created:", JSON.stringify({
      id: professional.id,
      name: professional.name,
      email: professional.email,
      foto: professional.profileImage,
      active: professional.active,
      companyId: professional.companyId,
      userId: professional.userId,
      services: professional.services?.map(s => s.id),
      servicesCount: professional.services?.length || 0
    }, null, 2));

    return professional;
  }

  async list({ searchParam, companyId, serviceId, active }: ProfessionalFilters): Promise<Professional[]> {
    const whereCondition: any = {
      companyId
    };

    if (active !== undefined) {
      whereCondition.active = active;
    }

    if (searchParam) {
      whereCondition[Op.or] = [
        { name: { [Op.iLike]: `%${searchParam}%` } },
        { description: { [Op.iLike]: `%${searchParam}%` } },
        { email: { [Op.iLike]: `%${searchParam}%` } },
        { phone: { [Op.iLike]: `%${searchParam}%` } }
      ];
    }

    const include: any = [
      { model: Service },
      { model: Company },
      { model: User, attributes: ["id", "name"] }
    ];

    if (serviceId) {
      include[0].where = { id: serviceId };
      include[0].through = { attributes: [] };
    }

    const professionals = await Professional.findAll({
      where: whereCondition,
      include,
      order: [["name", "ASC"]]
    });

    return professionals;
  }

  async findById(id: number, companyId: number): Promise<Professional> {
    const professional = await Professional.findOne({
      where: { id, companyId },
      include: [
        { model: Service },
        { model: Company },
        { model: User, attributes: ["id", "name"] },
        { model: Availability }
      ]
    });

    if (!professional) {
      throw new AppError("ERR_PROFESSIONAL_NOT_FOUND", 404);
    }

    return professional;
  }

  async update(id: number, professionalData: UpdateProfessionalData, companyId: number): Promise<Professional> {
    const professional = await this.findById(id, companyId);

    if (professionalData.name && professionalData.name !== professional.name) {
      const nameExists = await Professional.findOne({
        where: { 
          name: professionalData.name, 
          companyId,
          id: { [Op.ne]: id }
        }
      });

      if (nameExists) {
        throw new AppError("ERR_PROFESSIONAL_NAME_ALREADY_EXISTS");
      }
    }

    await professional.update(professionalData);

    if (professionalData.serviceIds) {
      await professional.$set("services", professionalData.serviceIds);
    }

    await professional.reload({
      include: [
        { model: Service },
        { model: Company },
        { model: User, attributes: ["id", "name"] },
        { model: Availability }
      ]
    });

    return professional;
  }

  async delete(id: number, companyId: number): Promise<void> {
    const professional = await this.findById(id, companyId);
    await professional.destroy();
  }
}

export default new ProfessionalService();