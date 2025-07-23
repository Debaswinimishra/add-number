import Api from "../environment/Api";

export const find_group = async (body) => {
  return await Api.post("sortgroupsbyudise", body);
};

export const sync_group = async () => await Api.get(`syncallgroups`);

export const add_number_to_group = async (body) => {
  return await Api.post("addnumbertogroups", body);
};
