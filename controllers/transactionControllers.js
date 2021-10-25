const { db } = require("../database");
const { uploader } = require("../helper/uploader");
const fs = require("fs");

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

  parcelList: (req, res) => {
    //MySQL query to check token data
    let checkTokenQuery = `Select * from users where email=${db.escape(
      req.dataDecode.email
    )} ;`;

    //Send query to MySQL
    db.query(checkTokenQuery, (err, resultToken) => {
      if (err) res.status(500).send({ errMessage: "Internal server error" });

      if (resultToken[0].role === "admin") {
        console.log(`Admin confirmed with email: ${resultToken[0].email}`);

        let getParcelQuery = `SELECT parcels.parcel_name FROM parcels;`;

        db.query(getParcelQuery, (err, parcelList) => {
          if (err) {
            res.status(500).send({ errMessage: "Internal server error" });
          }

          if (parcelList) {
            console.log(parcelList);
            res.status(200).send({ parcelList });
          }
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

        //Check newStatus = CONFIRM or REJECT
        if (req.body.newStatus === "Confirmed") {
          //Get all products from the parcels and count TOTAL quantity
          let productAr = [];
          req.body.parcels.forEach((parcel) => {
            parcel.products.forEach((product) => {
              //Check if product already in productAr
              const indexFind = productAr.findIndex(
                (el) => el.id_product === product.id_product
              );

              if (indexFind === -1) {
                productAr.push(product);
              } else {
                //if product already in productAr, just add the quantity
                productAr[indexFind].product_quantity +=
                  product.product_quantity;
              }
            });
          });

          console.log(productAr);

          let bookedString = [];
          let idProductsString = [];
          productAr.forEach((val) => {
            bookedString.push(
              `WHEN id_product = ${val.id_product} THEN booked-${val.product_quantity}`
            );
            idProductsString.push(val.id_product);
          });

          let bookedQuery = `UPDATE products SET
            booked = (CASE ${bookedString.join(" ")} END)
            WHERE id_product IN (${idProductsString.join(", ")});`;

          console.log(bookedQuery);

          db.query(bookedQuery, (err, updateBooked) => {
            console.log("query booked sent");
            if (err) {
              res.status(500).send({ errMessage: "Internal server error" });
            }

            if (updateBooked) {
              console.log("booked Edited!");

              // MySQL query to change transaction status
              let confirmQuery = `UPDATE transactions SET status = '${
                req.body.newStatus
              }' WHERE id_transaction = ${db.escape(
                req.body.id_transaction
              )} ;`;

              //Send query to MySQL
              db.query(confirmQuery, (err, results) => {
                console.log(`query sent: ${confirmQuery}`);
                if (err)
                  res.status(500).send({ errMessage: "Internal server error" });

                if (results) {
                  //Status changed
                  console.log("Status changed");
                  res.status(200).send({ message: "Status changed" });
                }
              });
            }
          });
        } else if (req.body.newStatus === "Rejected") {
          //Get all products from the parcels and count TOTAL quantity
          let productAr = [];
          req.body.parcels.forEach((parcel) => {
            parcel.products.forEach((product) => {
              //Check if product already in productAr
              const indexFind = productAr.findIndex(
                (el) => el.id_product === product.id_product
              );

              if (indexFind === -1) {
                productAr.push(product);
              } else {
                //if product already in productAr, just add the quantity
                productAr[indexFind].product_quantity +=
                  product.product_quantity;
              }
            });
          });

          console.log(productAr);

          let bookedString = [];
          let productQtyString = [];
          let idProductsString = [];
          productAr.forEach((val) => {
            bookedString.push(
              `WHEN id_product = ${val.id_product} THEN booked-${val.product_quantity}`
            );
            productQtyString.push(
              `WHEN id_product = ${val.id_product} THEN product_quantity+${val.product_quantity}`
            );
            idProductsString.push(val.id_product);
          });

          let bookedQuery = `UPDATE products SET
            booked = (CASE ${bookedString.join(" ")} END),
            product_quantity = (CASE ${productQtyString.join(" ")} END)
            WHERE id_product IN (${idProductsString.join(", ")});`;

          console.log(bookedQuery);

          db.query(bookedQuery, (err, updateBooked) => {
            console.log("query change qty & change booked sent");
            if (err) {
              res.status(500).send({ errMessage: "Internal server error" });
            }

            if (updateBooked) {
              console.log("booked & qty Edited!");

              // MySQL query to change transaction status
              let confirmQuery = `UPDATE transactions SET status = '${
                req.body.newStatus
              }' WHERE id_transaction = ${db.escape(
                req.body.id_transaction
              )} ;`;

              //Send query to MySQL
              db.query(confirmQuery, (err, results) => {
                console.log(`query sent: ${confirmQuery}`);
                if (err)
                  res.status(500).send({ errMessage: "Internal server error" });

                if (results) {
                  //Status changed
                  console.log("Status changed");
                  res.status(200).send({ message: "Status changed" });
                }
              });
            }
          });
        }
      } else {
        console.log("Not an admin!");
        res.status(200).send({ message: "Not an admin!" });
      }
    });
  },
  incomeTransaction: (req, res) => {
    if (req.user.role === "admin") {
      let period = 30;
      if(!isNaN(req.query.period)){
        period = req.query.period;
      }
      let scriptQuery = `SELECT
        date_format(
          db_parshare.transactions.transaction_date,
          '%Y-%m-%d'
        ) as date,
        SUM(income) as income,
        SUM(db_parshare.transactions.transaction_totalprice) as totalPrice
      FROM
        db_parshare.transactions
      WHERE
        db_parshare.transactions.transaction_date BETWEEN CURDATE() - INTERVAL ${period} DAY
        AND db_parshare.transactions.status = "confirmed"
      GROUP BY
        date_format(
          db_parshare.transactions.transaction_date,
          '%Y-%m-%d'
        );`;

      db.query(scriptQuery, (err, results) => {
        if (err) {
          res.status(500).send({
            success: false,
            data: error,
          });
        } else {
          const month = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sept",
            "Oct",
            "Nov",
            "Dec",
          ];
          const d = new Date();
          let data = []
          d.setMonth(d.getMonth()+1);
          for(let i = 0; i < period; i++){
            const dateFormat = d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate();
            const dateFinal = d.getDate() + ' ' + month[d.getMonth()];
            
            for(let j = 0; j < results.length; j++){
              if(results[j].date === dateFormat){
                data.push({
                  ...results[j],
                  date: dateFinal,
                });
              } else {
                let search = results.find((res) => res.date === dateFormat);
                if (!search) {
                  data.push({
                    date: dateFinal,
                    income: 0,
                    totalPrice: 0,
                  });
                  break;
                }
              }
            }
            d.setDate(d.getDate() - 1);
          }
          return res.status(200).send({
            success: true,
            data,
          });
        }
      });
    } else {
      return res.status(500).send({
        success: false,
        data: "User not allowed!",
      });
    }
  },
  getUserTransactions: (req, res) => {
    if (req.user.role === "user") {
      //Send query to MySQL
      let getTransactionQuery = `SELECT t.id_transaction, t.id_user, u.fullname, t.transaction_date, 
      t.transaction_totalprice, t.income, t.image_userpayment, t.status
      FROM transactions t JOIN users u ON t.id_user = u.id_user and t.id_user = ${db.escape(
        req.user.id_user
      )} order by t.id_transaction desc;`;

      console.log(`getTransactionQuery`, getTransactionQuery);
      db.query(getTransactionQuery, (err, transactionsData) => {
        console.log(`transactionsData`, transactionsData);
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
    } else {
      return res.status(500).send({
        success: false,
        data: "User not allowed!",
      });
    }
  },

  uploadImgTrf: (req, res) => {
    if (req.user.role === "user") {
      try {
        let path = "/images";
        const upload = uploader(path, "IMG").fields([{ name: "file" }]);

        upload(req, res, (error) => {
          if (error) {
            console.log(error);
            res.status(500).send(error);
          }

          const { file } = req.files;
          const filepath = file ? path + "/" + file[0].filename : null;
          console.log(`filepath:${filepath}`);
          let data = JSON.parse(req.body.data);
          console.log(`data: ${JSON.stringify(data)}`);

          let updateQuery = `update transactions set image_userpayment = ${db.escape(
            filepath
          )} where id_transaction = ${db.escape(data.id_transaction)}`;
          db.query(updateQuery, (errUpdate, resultUpdate) => {
            if (errUpdate) {
              fs.unlinkSync("./public" + filepath);
              return res.status(500).send({
                success: false,
                message: errUpdate,
              });
            }
            return res.status(200).send({
              success: true,
              message: "Success Upload Bukti Transfer",
            });
          });
        });
      } catch (error) {
        console.log(error);
        res.status(500).send({
          success: false,
          message: error,
        });
      }
    } else {
      return res.status(500).send({
        success: false,
        data: "User not allowed!",
      });
    }
  },
};
