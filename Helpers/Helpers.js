const Tables = require("./Tables");

const roleAndActionsCheck = (role, params) => {
  if (role == "admin") {
    const optionsAdmin = ["CAT", "PRO", "USR"];
    if (optionsAdmin.includes(params)) {
      return true;
    } else {
      return false;
    }
  } else if (role === "user") {
    const options = ["PRO"];
    if (options.includes(params)) {
      return true;
    } else {
      return false;
    }
  }
};

const tableNameParser = (code) => {
  const values = [
    {
      code: "ADM",
      value: Tables.admin,
      key: "admin",
    },
    {
      code: "USR",
      value: Tables.user,
      key: "user",
    },
    {
      code: "PRO",
      value: Tables.product,
      key: "product",
    },
    {
      code: "CAT",
      value: Tables.category,
      key: "category",
    },
  ];
  const findTheTable = values.find((item) => item.code == code);
  return findTheTable;
};

const CHECK_ACCESS_ADMIN_OR_USER = (role) => {
  if (role == "admin" || role == "user") {
    return true;
  } else {
    return {
      success: false,
      message: "YouDontHaveAccess",
    };
  }
};
module.exports = {
  roleAndActionsCheck,
  tableNameParser,
  CHECK_ACCESS_ADMIN_OR_USER,
};
