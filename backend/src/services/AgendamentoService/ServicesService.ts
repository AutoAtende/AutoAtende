import { Op } from "sequelize";
import Service from "../../models/Service";
import Professional from "../../models/Professional";
import AppError from "../../errors/AppError";

interface ServiceData {
  name: string;
  description?: string;
  duration: number;
  price?: number;
  color?: string;
  companyId: number;
}

interface UpdateServiceData {
  name?: string;
  description?: string;
  duration?: number;
  price?: number;
  color?: string;
  active?: boolean;
}

interface ServiceFilters {
  searchParam?: string;
  companyId: number;
  professionalId?: number;
  active?: boolean;
}

class ServicesService {
  async create(serviceData: ServiceData): Promise<Service> {
    const { name, companyId } = serviceData;

    const nameExists = await Service.findOne({
      where: { 
        name, 
        companyId 
      }
    });

    if (nameExists) {
      throw new AppError("ERR_SERVICE_NAME_ALREADY_EXISTS");
    }

    const service = await Service.create(serviceData);

    return service;
  }

  async list({ searchParam, companyId, professionalId, active }: ServiceFilters): Promise<Service[]> {
    const whereCondition: any = {
      companyId
    };

    if (active !== undefined) {
      whereCondition.active = active;
    }

    if (searchParam) {
      whereCondition[Op.or] = [
        { name: { [Op.iLike]: `%${searchParam}%` } },
        { description: { [Op.iLike]: `%${searchParam}%` } }
      ];
    }

    const include: any = [];

    if (professionalId) {
      include.push({
        model: Professional,
        where: { id: professionalId },
        through: { attributes: [] }
      });
    }

    const services = await Service.findAll({
      where: whereCondition,
      include,
      order: [["name", "ASC"]]
    });

    return services;
  }

  async findById(id: number, companyId: number): Promise<Service> {
    const service = await Service.findOne({
      where: { id, companyId },
      include: [{ model: Professional }]
    });

    if (!service) {
      throw new AppError("ERR_SERVICE_NOT_FOUND", 404);
    }

    return service;
  }

  async update(id: number, serviceData: UpdateServiceData, companyId: number): Promise<Service> {
    const service = await this.findById(id, companyId);

    if (serviceData.name && serviceData.name !== service.name) {
      const nameExists = await Service.findOne({
        where: { 
          name: serviceData.name, 
          companyId,
          id: { [Op.ne]: id }
        }
      });

      if (nameExists) {
        throw new AppError("ERR_SERVICE_NAME_ALREADY_EXISTS");
      }
    }

    await service.update(serviceData);

    await service.reload({
      include: [{ model: Professional }]
    });

    return service;
  }

  async delete(id: number, companyId: number): Promise<void> {
    const service = await this.findById(id, companyId);

    await service.destroy();
  }
}

export default new ServicesService();