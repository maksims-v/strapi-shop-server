import logo from "./extensions/logo.png";
import favicon from "./extensions/favicon.ico";

const config = {
  auth: {
    logo: logo,
  },
  menu: {
    logo: logo,
  },
  head: {
    favicon: favicon,
  },
  locales: ["lv", "ru"],
  tutorials: false,
  // Disable notifications about new Strapi releases
  notifications: { releases: false },
};

const bootstrap = (app) => {};

export default {
  config,
  bootstrap,
};
