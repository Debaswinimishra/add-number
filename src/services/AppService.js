import Api from "../environment/Api";

// ---------------------Block-Wise Number Fetch --------------------

export const find_group = async (body) => {
  return await Api.post("sortgroupsbyudise", body);
};

export const sync_group = async () => await Api.get(`syncallgroups`);

export const get_groups_by_udise = async (data) =>
  await Api.get(`getgroupsbyudisecount/${data.district}/${data.block}`);

// ----------------------Block-Wise Number add -----------------------

export const add_number_to_group = async (body) => {
  return await Api.post("addnumbertogroups", body);
};

export const get_status = async (data) =>
  await Api.get(`getnumberadditionstatus/${data.district}/${data.block}`);
