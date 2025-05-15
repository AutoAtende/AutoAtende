import { Op } from "sequelize";
import { startOfDay, endOfDay, parseISO } from "date-fns";
import Contact from "../../models/Contact";
import Tag from "../../models/Tag";

interface Request {
  startDate: string;
  endDate: string;
  companyId: string | number;
  tags?: number[] | string[];
  ddds?: string[];
  userId?: number;
  profile?: string;
  searchParam?: string;
  state?: string;
}

export const dddsPorEstado = {
  AC: ["68"], AL: ["82"], AP: ["96"], AM: ["92", "97"], BA: ["71", "73", "74", "75", "77"],
  CE: ["85", "88"], DF: ["61"], ES: ["27", "28"], GO: ["62", "64"], MA: ["98", "99"],
  MT: ["65", "66"], MS: ["67"], MG: ["31", "32", "33", "34", "35", "37", "38"],
  PA: ["91", "93", "94"], PB: ["83"], PR: ["41", "42", "43", "44", "45", "46"],
  PE: ["81", "87"], PI: ["86", "89"], RJ: ["21", "22", "24"], RN: ["84"], RS: ["51", "53", "54", "55"],
  RO: ["69"], RR: ["95"], SC: ["47", "48", "49"], SP: ["11", "12", "13", "14", "15", "16", "17", "18", "19"],
  SE: ["79"], TO: ["63"]
};

const ListContactsService = async ({
  startDate,
  endDate,
  companyId,
  tags,
  ddds,
  userId,
  profile,
  searchParam,
  state
}: Request): Promise<{ contacts: Contact[] }> => {
  let whereCondition: any = {
    companyId,
    isGroup: false
  };

  if (startDate && endDate) {
    whereCondition.createdAt = {
      [Op.between]: [
        startOfDay(parseISO(startDate)),
        endOfDay(parseISO(endDate))
      ]
    };
  }

  if (searchParam) {
    whereCondition[Op.or] = [
      { name: { [Op.iLike]: `%${searchParam}%` } },
      { number: { [Op.like]: `%${searchParam}%` } }
    ];
  }

  const includeCondition: any[] = [];

  if (tags && tags.length > 0) {
    includeCondition.push({
      model: Tag,
      as: "tags",
      where: { id: { [Op.in]: tags } },
      required: true
    });
  }

  if (ddds && ddds.length > 0) {
    whereCondition.number = {
      [Op.or]: ddds.map(ddd => ({ [Op.like]: `55${ddd}%` }))
    };
  }

  if (state) {
    const stateDDDs = dddsPorEstado[state];
    if (stateDDDs) {
      whereCondition.number = {
        [Op.or]: stateDDDs.map(ddd => ({ [Op.like]: `55${ddd}%` }))
      };
    }
  }

  const contacts = await Contact.findAll({
    where: whereCondition,
    include: includeCondition,
    attributes: ["id", "name", "number", "email"],
    order: [["name", "ASC"]]
  });

  return { contacts };
};

export default ListContactsService;