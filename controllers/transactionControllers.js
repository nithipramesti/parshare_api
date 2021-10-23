const { db } = require("../database");

module.exports = {
  getAll: (req, res) => {
    //MySQL query to check token data
    let checkTokenQuery = `Select * from users where email=${db.escape(
      req.dataDecode.email
    )} ;`;

    //Send query to MySQL
    db.query(checkTokenQuery, (err, resultToken) => {
      if (err) res.status(500).send({ errMessage: "Internal server error" });

      if (resultToken[0].role === "admin") {
        console.log(`Admin confirmed with email: ${resultToken[0].email}`);

        let getTransactionQuery = `SELECT t.id_transaction, t.id_user, u.fullname, t.transaction_date, 
        t.transaction_totalprice, t.income, t.image_userpayment, t.status
        FROM transactions t JOIN users u ON t.id_user = u.id_user order by t.id_transaction desc;`;

        db.query(getTransactionQuery, (err, transactionsData) => {
          if (err) {
            res.status(500).send({ errMessage: "Internal server error" });
          }

          if (transactionsData) {
            transactionsData.forEach((transaction) => {
              transaction.parcels = [];
            });
          }

          let getProductsQuery = `SELECT tp.id_transaction, tp.id_parcel, par.parcel_name, par.image_parcel, tp.id_product, pro.product_name, tp.product_quantity
      FROM transaction_parcel tp 
      JOIN parcels par ON tp.id_parcel = par.id_parcel
      JOIN products pro ON tp.id_product = pro.id_product order by tp.id_transaction desc;`;

          db.query(getProductsQuery, (err, productsData) => {
            if (err) {
              res.status(500).send({ errMessage: "Internal server error" });
            }

            if (productsData) {
              //   console.log(productsData);

              transactionsData.forEach((transaction) => {
                productsData.forEach((val) => {
                  //   console.log(transaction.id_transaction);
                  if (transaction.id_transaction === val.id_transaction) {
                    const {
                      id_parcel,
                      parcel_name,
                      image_parcel,
                      id_product,
                      product_name,
                      product_quantity,
                    } = val;

                    const indexFind = transaction.parcels.findIndex((el) => {
                      return el.id_parcel === val.id_parcel;
                    });

                    if (indexFind === -1) {
                      transaction.parcels.push({
                        id_parcel,
                        parcel_name,
                        image_parcel,
                        products: [
                          {
                            id_product,
                            product_name,
                            product_quantity,
                          },
                        ],
                      });
                    } else {
                      transaction.parcels[indexFind].products.push({
                        id_product,
                        product_name,
                        product_quantity,
                      });
                    }
                  }
                });
              });

              res.status(200).send({ transactionsData });
            }
          });
        });
      }
    });
  },

  confirmation: (req, res) => {
    console.log(req.body);

    //MySQL query to check token data
    let checkTokenQuery = `Select * from users where email=${db.escape(
      req.dataDecode.email
    )} ;`;

    //Send query to MySQL
    db.query(checkTokenQuery, (err, resultToken) => {
      if (err) res.status(500).send({ errMessage: "Internal server error" });

      if (resultToken[0].role === "admin") {
        console.log(`Admin confirmed with email: ${resultToken[0].email}`);

        //MySQL query to change transaction status
        let confirmQuery = `UPDATE transactions SET status = '${
          req.body.newStatus
        }' WHERE id_transaction = ${db.escape(req.body.id_transaction)} ;`;

        //Send query to MySQL
        db.query(confirmQuery, (err, results) => {
          console.log(`query sent: ${confirmQuery}`);
          if (err)
            res.status(500).send({ errMessage: "Internal server error" });

          if (results) {
            console.log("Status changed");
            res.status(200).send({ message: "Status changed" });
          }
        });
      } else {
        console.log("Not an admin!");
        res.status(200).send({ message: "Not an admin!" });
      }
    });
  },
};
