import Api from "./environment/Api";

export const find_group = async (body) => {
  return await Api.post("sortgroupsbyudise", body);
};
