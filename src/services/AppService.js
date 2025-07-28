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

// ---------------------- UnMatched Groups -----------------------

export const get_unmatched_groups = async () =>
  await Api.get(`getnoudisegroups`);

// ----------------------------- Template API ---------------------------
export const getAllMessageTemplates = async () => {
  try {
    const response = await axios.get(
      "https://thinkzone.org/osepa/getAllMessageTemplates"
    );

    if (response.data.status === "success") {
      return response.data.data;
    } else {
      console.error(
        "Failed to fetch message templates: ",
        response.data.message
      );
      return null;
    }
  } catch (error) {
    console.error("Error fetching message templates:", error);
    return null;
  }
};

export const createMessageTemplate = async ({
  id,
  name,
  type,
  text,
  mediaurl,
}) => {
  try {
    const response = await axios.post(
      "https://thinkzone.org/osepa/createMessageTemplate",
      {
        id,
        name,
        type,
        text,
        mediaurl,
      }
    );

    if (response.data.status === "success") {
      return true;
    } else {
      console.error(
        "Failed to create message template: ",
        response.data.message
      );
      return false;
    }
  } catch (error) {
    console.error("Error creating message template:", error);
    return false;
  }
};

export const updateMessageTemplate = async ({
  _id,
  name,
  type,
  text,
  mediaurl,
}) => {
  try {
    const response = await axios.put(
      "https://thinkzone.org/osepa/updateMessageTemplate/" + _id,
      {
        name,
        type,
        text,
        mediaurl,
      }
    );
    if (response.data.status === "success") {
      return true;
    } else {
      console.error(
        "Failed to update message template: ",
        response.data.message
      );
      return false;
    }
  } catch (error) {
    console.error("Error updating message template:", error);
    return false;
  }
};

export const deleteMessageTemplate = async ({ _id }) => {
  try {
    const response = await axios.delete(
      "https://thinkzone.org/osepa/deleteMessageTemplate/" + _id
    );

    if (response.data.status === "success") {
      return true;
    } else {
      console.error(
        "Failed to delete message template: ",
        response.data.message
      );
      return false;
    }
  } catch (error) {
    console.error("Error deleting message template:", error);
    return false;
  }
};
// --------------------------------------------------------------------------------

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
