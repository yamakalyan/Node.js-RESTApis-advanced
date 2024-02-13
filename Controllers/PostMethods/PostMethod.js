const database = require("../../Config/database");
const bcrypt = require("bcrypt");
const Tables = require("../../Helpers/Tables");
const {
  tableNameParser,
  roleAndActionsCheck,
} = require("../../Helpers/Helpers");
const salt = 10;

// POST METHOD TO CREATE / MANAGEMENT / STAFF / STUDENT BASED ON ROLE
const postCreate = async (req, res, next) => {
  try {
    if (req.role === "admin") {
      const tableName = req.params.type === "MEM" && Tables.members;

      const values = req.body.values;
      // SANITIZING INPUT VALUES
      const allowedCharecterForName = /^[A-Za-z ]+$/;
      const allowedLettersForEmail = /^[A-Za-z0-9.]+@[A-Za-z]+\.[A-Za-z]+$/;

      if (values[0].name && !values[0].name.match(allowedCharecterForName)) {
        return res
          .status(400)
          .json("No special characters are allowed in Name");
      }
      if (values[0].email && !values[0].email.match(allowedLettersForEmail)) {
        return res.status(400).json("Invalid email format");
      }
      if (values[0].mobile && isNaN(Number(values[0].mobile))) {
        return res
          .status(400)
          .json("No special characters are allowed in Mobile");
      }

      // FOR CHECHING IF EMAIL AND MOBILE EXIST IN DATABASE
      const name = values.map((na) => na.name);
      const email = values.map((em) => em.email);
      const mobile = values.map((mob) => mob.mobile);

      const firstTwoLettersFromTableName = tableName
        .substring(0, 3)
        .toUpperCase();
      const tableWithId = tableName + "_id";

      const mixedValues = values.map((mix) => ({
        ...mix,
        created_by: req.id,
        [tableWithId]:
          firstTwoLettersFromTableName +
          Math.floor(1000000 + Math.random() * 9999999),
      }));

      // if (tableName == "admin") {
      // }
      // mixedValues.splice(0, 3)
      if (tableName === "admin") {
        delete mixedValues[0].created_by;
      }

      // HASHING PASSWORD HERE
      const Password = values.map((pass) => pass.password);
      const hashingPAssword = await bcrypt.hash(Password[0], salt);

      // const comparePAssword = await bcrypt.compare(Password[0], hashingPAssword)
      const bcryptingPasswordWITHvalues = mixedValues.map((values) => {
        if (values.password) {
          values.password = hashingPAssword;
        }
        return values;
      });

      const checkEmailSql = `SELECT * FROM ${tableName} WHERE ? AND ifdeleted='0'`;
      database.query(
        checkEmailSql,
        {
          email,
        },
        (err, emailCheckResults) => {
          if (err) {
            return res.status(400).json({
              success: false,
              message: "HavingIssues",
              err,
            });
          } else {
            if (emailCheckResults.length == 0) {
              const checkMobileSql = `SELECT * FROM ${tableName} WHERE ? AND ifdeleted='0' `;
              database.query(
                checkMobileSql,
                {
                  mobile,
                },
                (err, mobileCheckResults) => {
                  if (err) {
                    return res.status(400).json({
                      success: false,
                      message: "HavingIssues",
                      err,
                    });
                  } else {
                    if (mobileCheckResults.length == 0) {
                      const createSql = `INSERT INTO ${tableName} SET ?`;

                      database.query(
                        createSql,
                        bcryptingPasswordWITHvalues,
                        (err, results) => {
                          if (err) {
                            return res.status(400).json({
                              success: false,
                              message: "HavingIssues",
                              err,
                            });
                          } else {
                            return (req.createResponse = res.status(200).json({
                              success: true,
                              message: `${name} SuccessfullyInserted`,
                              results,
                            }));
                          }
                        }
                      );
                    } else {
                      return res.status(400).json({
                        success: false,
                        message: "MobileNumberAlreadyExists",
                      });
                    }
                  }
                }
              );
            } else {
              return res.status(400).json({
                success: false,
                message: "EmailAddressAlreadyExists",
              });
            }
          }
        }
      );
    } else {
      res.status(401).json({
        success: false,
        message: "No dont have access for this",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

// POST METHOD TO CREATE SIMILAR INSERTION CASES
const similarInsertionCases = async (req, res, next) => {
  try {
    const check = roleAndActionsCheck(req.role, req.params.type);
    if (check) {
      const tableName = tableNameParser(req.params.type);
      // REMOVING LAST LETTER IF S INCLUDES AT LAST
      const checkingIFSincludesAtLast = tableName[tableName.length - 1];

      const removingLastLetter =
        checkingIFSincludesAtLast.toLowerCase() == "s"
          ? tableName.slice(0, -1)
          : tableName;

      // TAKING 3 LETTERS FROM TABLENAME FOR ID
      const firstTwoLettersFromTableName = tableName
        .substring(0, 3)
        .toUpperCase();

      const values = req.body.values;
      const tableWithId = removingLastLetter + "_id";

      const checkingLastTableID = `SELECT ${tableWithId} FROM ${tableName} ORDER BY id DESC LIMIT 1`;
      database.query(checkingLastTableID, (err, lastIdResults) => {
        if (err) {
          res.status(400).json({
            success: false,
            message: "HavingInternalIssues",
            err,
          });
        } else {
          const resultID =
            lastIdResults[0] == undefined || null
              ? "0"
              : lastIdResults[0][tableWithId];
          const removingStringFromNumberID = resultID.match(/\d+/);
          const finalLastID = parseFloat(removingStringFromNumberID) + 1;

          const mixedValues = values.map((mix) => ({
            ...mix,
            created_by: req.id,
            [tableWithId]: firstTwoLettersFromTableName + finalLastID,
          }));
          const createSql = `INSERT INTO ${tableName} SET ?`;
          database.query(createSql, mixedValues, (err, results) => {
            if (err) {
              res.status(400).json({
                success: false,
                message: "HavingIssues",
                err,
              });
            } else {
              const id = mixedValues[0].application_form_id;
              res.results = res.status(200).json({
                success: true,
                message: `Data SuccessfullyInserted`,
                results,
                id,
              });
              next();
            }
          });
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: "You dont have access for this",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  postCreate,
  similarInsertionCases,
};
