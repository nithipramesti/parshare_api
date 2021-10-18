const { db } = require("../database");
const { uploader } = require("../helper/uploader");
const fs = require("fs");

module.exports = {
  listProduct: (req, res) => {
    let getQuery = `SELECT id_product as id, id_product, product_name, product_price, image_product, db_parshare.products.id_category, db_parshare.categories.category, product_quantity, db_parshare.products.active FROM products INNER JOIN db_parshare.categories ON db_parshare.products.id_category = db_parshare.categories.id_category`;
    db.query(getQuery, (err, result) => {
      if (err) {
        return res.status(500).send({
          success: false,
          data: err,
        });
      } else {
        return res.status(200).send({
          success: true,
          data: result,
        });
      }
    });
  },
  getProduct: (req, res) => {
    //Get parcel categories & qty
    const id_parcel = req.params.id_parcel;

    let getCategoriesQuery = `SELECT p.parcel_name, c.id_category, c.category, pc.parcelcategory_quantity
    FROM parcels p 
    JOIN parcel_categories pc ON p.id_parcel = pc.id_parcel
    JOIN categories c ON pc.id_category = c.id_category
    WHERE p.id_parcel = ${id_parcel};`;

    db.query(getCategoriesQuery, (err, parcelData) => {
      if (err) {
        res.status(500).send({ errMessage: "Internal server error" });
      }

      if (parcelData) {
        // console.log(parcelData);

        let id_categoriesQuery = [];
        parcelData.forEach((val) => {
          id_categoriesQuery.push(`p.id_category = ${val.id_category}`);
        });

        //Get products with parcel's categories
        let getProductsQuery = `SELECT p.id_product, p.product_name, p.image_product, p.product_quantity, c.category FROM products p
        JOIN categories c ON p.id_category = c.id_category WHERE (${id_categoriesQuery.join(
          " OR "
        )}) AND p.active = 'true';`;

        db.query(getProductsQuery, (err, products) => {
          if (err) {
            res.status(500).send({ errMessage: "Internal server error" });
          }

          if (products) {
            //Restructure parcelData into an object:

            const obj = {}; //Create temporary object to store parcelData

            //Set parcel name
            obj.name = parcelData[0].parcel_name;

            //Set parcel categories quantity
            obj.categories = {};
            parcelData.forEach((val) => {
              obj.categories[val.category] = val.parcelcategory_quantity;
            });

            //Make new object to save selected categories (default = 0)
            const selectedCategories = {};
            parcelData.forEach((val) => {
              selectedCategories[val.category] = 0;
            });
            console.log(selectedCategories);

            //Assign obj to parcelData
            parcelData = obj;
            console.log(parcelData);

            //Send products data to front end
            res.status(200).send({
              parcelData,
              selectedCategories,
              products,
            });
          } else {
            res.status(200).send({
              errMessage: "Incorrect parcel data",
            });
          }
        });
      } else {
        res.status(200).send({
          errMessage: "Incorrect parcel data",
        });
      }
    });
  },
  addProduct: (req, res) => {
    if (req.user.role === "admin") {
      let { name, price, category, quantity } = JSON.parse(req.body.data);
      if (name && price && category && quantity && req.files) {
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
            let data = JSON.parse(req.body.data);
            data.image = filepath;

            let addQuery = `insert into products values (null, ${db.escape(
              name
            )}, ${db.escape(filepath)}, ${db.escape(price)}, ${db.escape(
              category
            )}, ${db.escape(quantity)}, 'true')`;
            db.query(addQuery, (err, result) => {
              if (err) {
                fs.unlinkSync("./public" + filepath);
                return res.status(500).send({
                  success: false,
                  data: err,
                });
              } else if (result.insertId) {
                let getQuery = `select * from products where id_product='${result.insertId}'`;
                db.query(getQuery, (err2, result2) => {
                  if (err2) {
                    fs.unlinkSync("./public" + filepath);
                    return res.status(500).send({
                      success: false,
                      data: err2,
                    });
                  } else {
                    return res.status(200).send({
                      success: true,
                      data: result2[0],
                    });
                  }
                });
              }
            });
          });
        } catch (error) {
          console.log(error);
          res.status(500).send({
            success: false,
            data: error,
          });
        }
      } else {
        res.status(500).send({
          success: false,
          data: "Missing query!",
        });
      }
    } else {
      return res.status(500).send({
        success: false,
        data: "User not allowed!",
      });
    }
  },
  editProduct: (req, res) => {
    if (req.user.role === "admin") {
      console.log(req);
      let { id, name, price, category, quantity } = JSON.parse(req.body.data);
      if (id && name && category && quantity && req.files) {
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
            let data = JSON.parse(req.body.data);
            data.image = filepath;

            fs.unlinkSync("./public" + image);
            let updateQuery = `update products set product_name = ${db.escape(
              name
            )}, product_price = ${db.escape(
              price
            )}, image_product = ${db.escape(
              filepath
            )}, id_category = ${db.escape(
              category
            )}, product_quantity = ${db.escape(
              quantity
            )} where id_product = ${db.escape(id)}`;
            db.query(updateQuery, (err2, result2) => {
              if (err2) {
                fs.unlinkSync("./public" + filepath);
                return res.status(500).send({
                  success: false,
                  data: err2,
                });
              } else {
                res.status(200).send({
                  status: true,
                });
              }
            });
          });
        } catch (error) {
          console.log(error);
          res.status(500).send({
            success: false,
            data: error,
          });
        }
      } else if (id && name && category && quantity) {
        let updateQuery = `update products set product_name = ${db.escape(
          name
        )}, product_price = ${db.escape(price)}, id_category = ${db.escape(
          category
        )}, product_quantity = ${db.escape(
          quantity
        )} where id_product = ${db.escape(id)}`;
        db.query(updateQuery, (err, result) => {
          if (err) {
            return res.status(500).send({
              success: false,
              data: err,
            });
          } else {
            let getQuery = `select * from products where id_product = ${db.escape(
              id
            )}`;
            db.query(getQuery, (err2, result2) => {
              if (err2) {
                return res.status(500).send({
                  success: false,
                  data: err2,
                });
              } else {
                return res.status(200).send({
                  success: true,
                  data: result2[0],
                });
              }
            });
          }
        });
      }
    } else {
      return res.status(500).send({
        success: false,
        data: "User not allowed!",
      });
    }
  },
  deleteProduct: (req, res) => {
    if (req.user.role === "admin") {
      if (req.query.id) {
        let deleteQuery = `update products set active = 'false' where id_product = ${db.escape(
          req.query.id
        )}`;
        db.query(deleteQuery, (err, result) => {
          if (err) {
            return res.status(500).send({
              success: false,
              data: err,
            });
          } else {
            return res.status(200).send({
              success: true,
              data: "Delete succeed!",
            });
          }
        });
      } else {
        return res.status(500).send({
          success: false,
          data: "Missing query!",
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
