import axios from "axios";

const baseURL = process.env.REACT_APP_BASE_URL;

export const Version = {
  version: "1.0.0",
};

export default axios.create({
  baseURL,
});
