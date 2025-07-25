import Api from "../environment/Api";
import axios from "axios";

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

//------------------------Media Upload------------------------
export const getAllMedias = async (headerType) => {
  try {
    const response = await axios.get(
      `https://thinkzone.info/meta/getAllMediaByType/${headerType}/students/whatsapp_osepa`
    );

    if (response && response.status === 200)
      return { statusCode: response.status, resData: response.data.data };
    else {
      console.error("getAllMedias API err:", response.data.message);
      return { statusCode: response.status, resData: [] };
    }
  } catch (error) {
    console.error("Error getAllMedias:", error);
    return [];
  }
};

export const saveMedia = async (headerType, formData) => {
  try {
    const api = headerType === "video" ? "compressAndSaveVideo" : "saveMedia";
    const response = await axios.post(
      `https://thinkzone.info/meta/${api}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return response.status;
  } catch (error) {
    console.error("Error getAllMedias:", error);
    return 500;
  }
};

export const deleteMedia = async (mediaBody) => {
  try {
    const response = await axios.post(
      `https://tatvagyan.co.in/deleteMedia`,
      mediaBody
    );

    return response;
  } catch (error) {
    console.error("Error getAllMedias:", error);
    return [];
  }
};

export const checkMediaAvailability = async (mediaName) => {
  try {
    const response = await axios.get(
      `https://tatvagyan.co.in/check_template_availability/${mediaName}`
    );

    return response;
  } catch (error) {
    console.error("Error getAllMedias:", error);
    return [];
  }
};
