const database = require("../../Config/database");
const {
  tableNameParser,
  CHECK_ACCESS_ADMIN_OR_USER,
} = require("../../Helpers/Helpers");

// UPDATE DETAILS BY SANITIZING
const putUpdate = async (req, res, next) => {
  const tableName = tableNameParser(req.params.type);
  const ID = req.id;
  // const Password = req.body.password;

  // SANITIZING INPUT VALUES
  const values = req.body.values;
  const allowedCharecterForName = /^[A-Za-z ]+$/;
  const allowedLettersForEmail = /^[A-Za-z0-9.]+@[A-Za-z]+\.[A-Za-z]+$/;

  if (values[0].name && !values[0].name.match(allowedCharecterForName)) {
    return res.status(400).json("No special characters are allowed in Name");
  }
  if (values[0].email && !values[0].email.match(allowedLettersForEmail)) {
    return res.status(400).json("Invalid email format");
  }
  if (values[0].mobile && isNaN(Number(values[0].mobile))) {
    return res.status(400).json("No special characters are allowed in Mobile");
  }

  // FOR CHECHING IF EMAIL AND MOBILE EXIST IN DATABASE
  const email = values.map((em) => em.email);
  const mobile = values.map((mob) => mob.mobile);

  const tableWithId = tableName + "_id";

  const fullID = [
    {
      key: tableWithId,
      value: ID,
    },
    {
      key: "ifdeleted",
      value: "0",
    },
  ];

  const mappingWHEREkeys = fullID
    .map((key) => `${key.key} = '${key.value}'`)
    .join(" AND ");

  const checkEmailIFExists = async () => {
    return new Promise((resolve, reject) => {
      const checkEmailSql = `SELECT email FROM ${tableName} WHERE ? AND ifdeleted='0'`;
      database.query(
        checkEmailSql,
        {
          email,
        },
        (err, results) => {
          if (err) {
            reject(err);
          } else {
            if (results.length == 0) {
              results = true;
              resolve(results);
            } else {
              results = false;
              resolve(results);
            }
          }
        }
      );
    });
  };

  const checkMobileIFExists = async () => {
    return new Promise((resolve, reject) => {
      const checkEmailSql = `SELECT mobile FROM ${tableName} WHERE ? AND ifdeleted='0'`;
      database.query(
        checkEmailSql,
        {
          mobile,
        },
        (err, results) => {
          if (err) {
            reject(err);
          } else {
            if (results.length == 0) {
              results = true;
              resolve(results);
            } else {
              results = false;
              resolve(results);
            }
          }
        }
      );
    });
  };

  const checkIDSql = `SELECT * FROM ${tableName} WHERE ${mappingWHEREkeys}`;
  database.query(checkIDSql, async (err, getResults) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: "HavingIssues",
        err,
      });
    } else {
      if (getResults.length == 0) {
        return res.status(400).json({
          success: false,
          message: "NoDataFound",
        });
      } else {
        const checkEmailIFExistsFunction = await checkEmailIFExists();
        const checkMobileIFExistsFunction = await checkMobileIFExists();

        if (checkEmailIFExistsFunction) {
          if (checkMobileIFExistsFunction) {
            // const comparePassword = await bcrypt.compare(
            //   Password,
            //   getResults[0].password
            // );
            // if (comparePassword) {
            const checkIDSql = `UPDATE ${tableName} SET ? WHERE ${mappingWHEREkeys}`;
            database.query(checkIDSql, values, (err, updateResults) => {
              if (err) {
                return res.status(400).json({
                  success: false,
                  message: "HavingIssues",
                  err,
                });
              } else {
                return res.status(200).json({
                  success: true,
                  message: "Success",
                });
              }
            });
            // } else {
            //   return res.status(400).json({
            //     success: false,
            //     message: "IncorrectPassword",
            //   });
            // }
          } else {
            return res.status(400).json({
              success: false,
              message: "MobileAlreadyExists",
            });
          }
        } else {
          return res.status(400).json({
            success: false,
            message: "EmailAlreadyExists",
          });
        }
      }
    }
  });
};

// UPDATE SIMILAR INSERTION CASES
const similarUpdateCases = async (req, res, next) => {
  try {
    // REMOVING LAST LETTER IF S INCLUDES AT LAST
    const tableName = tableNameParser(req.params.type);
    const ID = req.params.id;
    const values = req.body.values;
    const tableWithId = tableName + "_id";

    const fullID = [
      {
        key: tableWithId,
        value: ID,
      },
      {
        key: "ifdeleted",
        value: "0",
      },
    ];

    const mappingWHEREkeys = fullID
      .map((key) => `${key.key} = '${key.value}'`)
      .join(" AND ");

    const checkingSql = `SELECT * FROM ${tableName} WHERE ${mappingWHEREkeys}`;
    database.query(checkingSql, (err, results) => {
      if (err) {
        res.status(400).json({
          success: false,
          message: "HavingInternalIssues",
          err,
        });
      } else {
        if (results.length == 0) {
          res.status(400).json({
            success: false,
            message: `NoDataFound`,
          });
        } else {
          const createSql = `UPDATE ${tableName} SET ? WHERE ${mappingWHEREkeys}`;
          database.query(createSql, values, (err, results) => {
            if (err) {
              res.status(400).json({
                success: false,
                message: "HavingInternalIssues",
                err,
              });
            } else {
              res.status(200).json({
                success: true,
                message: `Data SuccessfullyUpdated`,
                results,
              });
            }
          });
        }
      }
    });
  } catch (error) {
    console.log(error);
  }
};

const DELETE_METHOD = (req, res, next) => {
  try {
    const { conditionTable, conditionId, role } = req;
    const accessCheck = CHECK_ACCESS_ADMIN_OR_USER(role);
    if (accessCheck) {
      const tableName = tableNameParser(conditionTable);
      const idKey = tableName.key + "_id";
      const condition = [{ [idKey]: conditionId }, { ifdeleted: 0 }];
      const SQL = `SELECT * FROM ${tableName} WHERE ? AND ?`;
      database.query(SQL, [condition], (Err, results) => {
        if (Err) {
          res.status(400).json({
            success: false,
            message: "havingInternalIssues",
            Err,
          });
        } else {
          if (results.length != 0) {
            const DELETE_SQL = `UPDATE ${tableName.value} SET ifdeleted="1" WHERE ? AND ?`;
            database.query(DELETE_SQL, [condition], (Err, results) => {
              if (Err) {
                res.status(400).json({
                  success: false,
                  message: "havingInternalIssues",
                  Err,
                });
              } else {
                req.results = res.status(200).json({
                  success: true,
                  message: "DeletedSuccessfully",
                });
              }
            });
          }
        }
      });
    } else {
      res.status(401).json(accessCheck);
    }
  } catch (error) {
    console.log(error);
  }
};
const UPDATE_METHOD = (req, res, next) => {
  try {
    const { conditionTable, conditionId, role } = req;
    const accessCheck = CHECK_ACCESS_ADMIN_OR_USER(role);
    if (accessCheck) {
      const tableName = tableNameParser(conditionTable);
      const idKey = tableName.key + "_id";
      const condition = [{ [idKey]: conditionId }, { ifdeleted: 0 }];
      const SQL = `SELECT * FROM ${tableName} WHERE ? AND ?`;
      database.query(SQL, [condition], (Err, results) => {
        if (Err) {
          res.status(400).json({
            success: false,
            message: "havingInternalIssues",
            Err,
          });
        } else {
          if (results.length != 0) {
            const DELETE_SQL = `UPDATE ${tableName.value} SET ifdeleted="1" WHERE ? AND ?`;
            database.query(DELETE_SQL, [condition], (Err, results) => {
              if (Err) {
                res.status(400).json({
                  success: false,
                  message: "havingInternalIssues",
                  Err,
                });
              } else {
                req.results = res.status(200).json({
                  success: true,
                  message: "DeletedSuccessfully",
                });
              }
            });
          }
        }
      });
    } else {
      res.status(401).json(accessCheck);
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  putUpdate,
  similarUpdateCases,
  DELETE_METHOD,
};
