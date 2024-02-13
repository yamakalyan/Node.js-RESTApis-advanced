const Tables = require("../../Helpers/Tables");
const database = require("../../Config/database");
const {
  CHECK_ACCESS_ADMIN_OR_USER,
  tableNameParser,
  roleAndActionsCheck,
} = require("../../Helpers/Helpers");

const PROFILE_GET_METHOD = (req, res, next) => {
  try {
    const { role, id } = req;
    const accessCheck = CHECK_ACCESS_ADMIN_OR_USER(role);
    if (accessCheck) {
      const tableName = tableNameParser(role);
      const idKey = tableName.key + "_id";
      const condition = [{ [idKey]: id }, { ifdeleted: 0 }];
      const SQL = `SELECT * FROM ${tableName.value} WHERE ? AND ?`;
      database.query(SQL, [condition], (Err, results) => {
        if (Err) {
          res.results = res.status(400).json({
            success: false,
            message: "havingInternalIssues",
            Err,
          });
        } else {
          if (results.length !== 0) {
            req.results = res.status(200).json({
              success: true,
              message: "DataFound",
              results,
            });
            next();
          }
        }
      });
    } else {
      res.results = res.status(401).json(accessCheck);
    }
  } catch (error) {
    console.log(error);
  }
};

const GET_DETAILS_METHOD = (req, res, next) => {
  try {
    const { conditionTable, conditionId } = req.params;
    const { role } = req;
    const accessCheck = CHECK_ACCESS_ADMIN_OR_USER(role);
    if (accessCheck) {
      const tableName = tableNameParser(conditionTable);
      const roleActionCheck = roleAndActionsCheck(role, conditionTable);
      if (roleActionCheck) {
        const idKey = tableName.key + "_id";
        const condition = [{ ifdeleted: 0 }];
        if (conditionId) {
          condition.push({ [idKey]: conditionId });
        }

        let SQL = `SELECT * FROM ${tableName.value} WHERE ? `;
        if (conditionId) {
          SQL += "AND ?";
        }
        database.query(SQL, condition, (Err, results) => {
          if (Err) {
            res.results = res.status(400).json({
              success: false,
              message: "havingInternalIssues",
              Err,
            });
          } else {
            if (results.length != 0) {
              return (req.results = res.status(200).json({
                success: true,
                message: "DataFound",
                results,
              }));
            }
          }
        });
      } else {
        res.results = res.status(401).json({
          success: false,
          message: "YouDontHaveAccess",
        });
      }
    } else {
      res.results = res.status(401).json(accessCheck);
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  PROFILE_GET_METHOD,
  GET_DETAILS_METHOD,
};
