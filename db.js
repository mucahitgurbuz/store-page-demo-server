const companies = require("./companies.json");
const items = require("./items.json");

module.exports = function () {
  return {
    companies: companies,
    items: items,
  };
};
