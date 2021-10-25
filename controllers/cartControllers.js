const { db } = require("../database");

module.exports = {
  add: (req, res) => {
    console.log(req.body);

    const { id_user, id_parcel, products } = req.body;

    let addCartQuery = `INSERT INTO cart VALUES
    (null, ${id_user}, ${id_parcel})`;

    db.query(addCartQuery, (err, resultsCart) => {
      if (err) {
        res.status(500).send({ errMessage: "Internal server error" });
      }

      if (resultsCart.insertId) {
        let id_cart = resultsCart.insertId;

        let productsQuery = [];
        products.forEach((val) => {
          productsQuery.push(
            `(null, ${id_cart}, ${val.id_product}, ${val.selected})`
          );
        });

        let addCartProductsQuery = `INSERT INTO cart_products VALUES
        ${productsQuery.join(", ")}`;

        db.query(addCartProductsQuery, (err, resultsCartProducts) => {
          console.log(productsQuery.join(", "));
          if (err) {
            res.status(500).send({ errMessage: "Internal server error" });
          }

          if (resultsCartProducts) {
            console.log("SUCCESS ADD");

            let getCartQuery = `SELECT c.id_cart, c.id_user, par.id_parcel, par.parcel_name, par.parcel_price, par.image_parcel, pro.id_product,  pro.product_name, pro.product_price, cp.product_quantity FROM cart c
      JOIN cart_products cp ON c.id_cart = cp.id_cart
      JOIN parcels par ON c.id_parcel = par.id_parcel
      JOIN products pro ON cp.id_product = pro.id_product
      WHERE c.id_user = ${id_user};`;

            db.query(getCartQuery, (err, result) => {
              if (err) {
                res.status(500).send({ errMessage: "Internal server error" });
              }

              if (result) {
                console.log("SUCCESS GET");
                res.status(200).send({
                  message: "Parcel added to cart",
                  data: result,
                });
              } else {
                console.log("NOT SUCCESS");
              }
            });
          }
        });
      }
    });
  },

  get: (req, res) => {
    //Get products with parcel's categories
    let getCartQuery = `SELECT c.id_cart, c.id_user, par.id_parcel, par.parcel_name, par.parcel_price, par.image_parcel, pro.id_product,  pro.product_name, pro.product_price, cp.product_quantity FROM cart c
      JOIN cart_products cp ON c.id_cart = cp.id_cart
      JOIN parcels par ON c.id_parcel = par.id_parcel
      JOIN products pro ON cp.id_product = pro.id_product
      WHERE c.id_user = ${req.body.id_user};`;

    db.query(getCartQuery, (err, cartItems) => {
      console.log("Query sent");
      if (err) {
        res.status(500).send({ errMessage: "Internal server error" });
      }

      if (cartItems) {
        console.log("SUCCESS GET");
        //Send cart data to front end
        res.status(200).send({
          cartItems,
        });
      } else {
        console.log("GET CART DATA NOT SUCCESS");
      }
    });
  },

  checkout: (req, res) => {
    console.log(req.body);

    const {
      id_user,
      transaction_date,
      transaction_totalprice,
      income,
      cartRaw,
    } = req.body;

    console.log({
      id_user,
      transaction_date,
      transaction_totalprice,
      income,
    });

    let addTransactionQuery = `INSERT INTO transactions VALUES
    (null, ${id_user}, "${transaction_date}", ${transaction_totalprice}, ${income}, null, "Pending")`;
    //(null, 83, "2021/10/16 12:18:16", 150000, 5000, null, "Pending");

    db.query(addTransactionQuery, (err, results1) => {
      if (err) {
        res.status(500).send({ errMessage: "Internal server error" });
      }

      if (results1.insertId) {
        console.log("Add to cart table succeed");
        let id_transaction = results1.insertId;

        let productsQuery = [];
        cartRaw.forEach((val) => {
          productsQuery.push(
            `(null, ${id_transaction}, ${val.id_parcel}, ${val.id_product}, ${val.product_quantity})`
          );
        });

        let addTransactionProductsQuery = `INSERT INTO transaction_parcel VALUES
        ${productsQuery.join(", ")}`;

        db.query(addTransactionProductsQuery, (err, results2) => {
          if (err) {
            res.status(500).send({ errMessage: "Internal server error" });
          }

          if (results2) {
            console.log("add to transaction_parcel succeed");

            let productBooked = {};

            //Count TOTAL product quantity
            cartRaw.forEach((val) => {
              if (
                Object.keys(productBooked).findIndex(
                  (el) => el === val.id_product
                ) === -1
              ) {
                productBooked[`${val.id_product}`] = val.product_quantity;
              } else {
                productBooked[`${val.id_product}`] += val.product_quantity;
              }
            });

            let bookedString = [];
            let productQtyString = [];
            let idProductString = [];
            Object.keys(productBooked).forEach((val) => {
              bookedString.push(
                `when id_product = ${val} then booked+${
                  productBooked[`${val}`]
                }`
              );
              productQtyString.push(
                `when id_product = ${val} then product_quantity-${
                  productBooked[`${val}`]
                }`
              );
              idProductString.push(val);
            });

            let bookedQuery = `UPDATE products SET
            booked = (case ${bookedString.join(" ")} end),
            product_quantity = (case ${productQtyString.join(" ")} end)
            WHERE id_product in (${idProductString.join(", ")});`;

            console.log(bookedQuery);

            db.query(bookedQuery, (err, results3) => {
              console.log("query booked sent");
              if (err) {
                res.status(500).send({ errMessage: "Internal server error" });
              }

              if (results3) {
                console.log("Set booked products succeed");

                let idCarts = [];
                cartRaw.forEach((val) => {
                  if (idCarts.findIndex((el) => el === val.id_cart) === -1) {
                    idCarts.push(val.id_cart);
                  }
                });

                let idCartsQuery = [];
                idCarts.forEach((val) => {
                  idCartsQuery.push(`id_cart = ${val}`);
                });

                let deleteCartQuery = `DELETE FROM cart where ${idCartsQuery.join(
                  " OR "
                )}`;

                db.query(deleteCartQuery, (err, results4) => {
                  if (err) {
                    res
                      .status(500)
                      .send({ errMessage: "Internal server error" });
                  }

                  if (results4) {
                    console.log("Delete cart succeed");

                    let deleteCartProductsQuery = `DELETE FROM cart_products where ${idCartsQuery.join(
                      " OR "
                    )}`;

                    db.query(deleteCartProductsQuery, (err, results5) => {
                      if (err) {
                        res
                          .status(500)
                          .send({ errMessage: "Internal server error" });
                      }

                      if (results5) {
                        console.log("delete card products succeed");
                        res.status(200).send({
                          message: "Checkout succeed!",
                        });
                      }
                    });
                  } else {
                    console.log("Failed to delete cart products");
                  }
                });
              }
            });
          } else {
            console.log("Failed to delete cart");
          }
        });
      }
    });
  },

  edit: (req, res) => {
    const { id_user, id_cart, id_parcel, products } = req.body;

    let deleteQuery = `DELETE FROM cart_products WHERE id_cart = ${db.escape(
      id_cart
    )}`;

    console.log(`deleteQuery: `, deleteQuery);

    db.query(deleteQuery, (errDeleteQuery, resultDeleteQuery) => {
      if (errDeleteQuery) {
        res.status(500).send({ errMessage: "Internal server error" });
      }

      let productsInsertQuery = [];
      products.forEach((val) => {
        productsInsertQuery.push(
          `(null, ${id_cart}, ${val.id_product}, ${val.selected})`
        );
      });

      let editCartProductsQuery = `INSERT INTO cart_products VALUES
      ${productsInsertQuery.join(", ")}`;

      console.log(`editCartProductsQuery: `, editCartProductsQuery);

      db.query(
        editCartProductsQuery,
        (errEditCartProductsQuery, resultsEditCartProductsQuery) => {
          if (errEditCartProductsQuery) {
            res.status(500).send({ errMessage: "Internal server error" });
          }

          if (resultsEditCartProductsQuery) {
            console.log("SUCCESS");

            res.status(200).send({
              message: "Edit Cart Success",
              data: products,
            });
          } else {
            console.log("NOT SUCCESS");
          }
        }
      );
    });
  },

  delete: (req, res) => {
    console.log(req.body);

    let deleteCartQuery = `DELETE FROM cart where id_cart = ${req.body.id_cart};`;

    db.query(deleteCartQuery, (err, deleteCart) => {
      if (err) {
        res.status(500).send({ errMessage: "Internal server error" });
      }

      if (deleteCart) {
        console.log("Delete from cart succeed");
        let deleteCartProductsQuery = `DELETE FROM cart_products where id_cart = ${req.body.id_cart};`;

        db.query(deleteCartProductsQuery, (err, deleteCartProducts) => {
          if (err) {
            res.status(500).send({ errMessage: "Internal server error" });
          }

          if (deleteCartProducts) {
            console.log("delete card products succeed");
            res.status(200).send({
              message: "Delete cart item succeed!",
            });
          }
        });
      }
    });
  },
};
