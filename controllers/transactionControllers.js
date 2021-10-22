const { db } = require("../database");

module.exports = {
  getAll: (req, res) => {
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

        console.log(transactionsData);
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

        console.log(transactionsData);
      });
    });
  },
};
