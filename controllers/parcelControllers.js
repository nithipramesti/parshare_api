const { db } = require("../database");
const { uploader } = require("../helper/uploader");
const fs = require("fs");

module.exports = {
  getParcelsUser: (req, res) => {
    //MySQL query to get parcel data
    let scriptQuery = `SELECT p.id_parcel, p.parcel_name, p.image_parcel, p.parcel_price, p.active, c.category, pc.parcelcategory_quantity
    FROM parcels p 
    JOIN parcel_categories pc ON p.id_parcel = pc.id_parcel
    JOIN categories c ON pc.id_category = c.id_category;`;

    //Get data from MySQL
    db.query(scriptQuery, (err, results) => {
      if (err) res.status(500).send({ errMessage: "Internal Server Error" });

      if (results) {
        console.log(results);

        //send parcel data to frontend
        res.status(200).send({ dataParcels: results });
      }
    });
  },
  listParcel: (req, res) => {
    let getQuery = `SELECT parcels.id_parcel as id,parcels.id_parcel, parcels.parcel_name, parcels.parcel_price, parcels.margin, parcels.image_parcel, parcels.description, parcels.active, GROUP_CONCAT(categories.category SEPARATOR',') as categories, GROUP_CONCAT(parcel_categories.parcelcategory_quantity SEPARATOR',') as quantities FROM parcels JOIN parcel_categories ON parcel_categories.id_parcel = parcels.id_parcel JOIN categories ON parcel_categories.id_category = categories.id_category GROUP BY parcels.id_parcel, parcels.parcel_name, parcels.image_parcel`
    db.query(getQuery, (err, result) => {
      if (err) {
        return res.status(500).send({
          success: false,
          data: err,
        });
      } else {
        var final = result.map((res) => {
          return {
            ...res,
            categoryQuantity: [res.categories, res.quantities],
          };
        });
        return res.status(200).send({
          success: true,
          data: final,
        });
      }
    });
  },
  getParcel: (req, res) => {
    if (req.query.id) {
      let getQuery = `SELECT parcels.id_parcel as id, parcels.parcel_name, parcels.parcel_price, parcels.margin, parcels.image_parcel, parcels.description, parcels.active, GROUP_CONCAT(categories.category SEPARATOR',') as categories, GROUP_CONCAT(parcel_categories.parcelcategory_quantity SEPARATOR',') as quantities FROM parcels JOIN parcel_categories ON parcel_categories.id_parcel = parcels.id_parcel JOIN categories ON parcel_categories.id_category = categories.id_category WHERE parcels.id_parcel = ${db.escape(
        parseInt(req.query.id)
      )}`;
      db.query(getQuery, (err, result) => {
        if (err) {
          return res.status(500).send({
            success: false,
            data: err,
          });
        } else {
          return res.status(200).send({
            success: true,
            data: result[0],
          });
        }
      });
    } else {
      return res.status(500).send({
        success: false,
        data: "Missing query!",
      });
    }
  },
  addParcel: (req, res) => {
    if (req.user.role === "admin") {
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
            console.log(`data:`,data)
            let {category, name, description, margin, price, image} = data
            image = filepath;
            
            if(category && name && description && margin && price && image){
              let addParcelQuery = `insert into parcels values (null, ${db.escape(
                data.name
              )}, ${db.escape(data.price)}, ${db.escape(data.margin)}, ${db.escape(
                filepath
              )}, ${db.escape(data.description)}, 'true')`;
              db.query(addParcelQuery, (errParcelQuery, resultParcelQuery) => {
                if (errParcelQuery) {
                  fs.unlinkSync("./public" + filepath);
                  return res.status(500).send({
                    success: false,
                    data: errParcelQuery,
                  });
                } else if (resultParcelQuery.insertId) {
                  for(let i = 0;i<data.category.length;i++){
                    let id_category = parseInt(data.category[i].category)
                    let quantity = parseInt(data.category[i].category)
                    let addCategoryQuery = `insert into parcel_categories values (null, ${db.escape(resultParcelQuery.insertId)}, ${db.escape(id_category)}, ${db.escape(quantity)})`
                    console.log(`addCategoryQuery ke-${i} : ${addCategoryQuery}`)
                    db.query(addCategoryQuery, (errCategoryQuery, resultCategoryQuery) => {
                      if (errCategoryQuery) {
                        fs.unlinkSync("./public" + filepath);
                        return res.status(500).send({
                          success: false,
                          data: errCategoryQuery,
                        });
                      }
                    });
                  }
                  
                  let getQueryParcels = `select * from parcels where id_parcel='${resultParcelQuery.insertId}'`;
                  db.query(getQueryParcels, (errGetParcel, resultGetParcel) => {
                    if (errGetParcel) {
                      fs.unlinkSync("./public" + filepath);
                      return res.status(500).send({
                        success: false,
                        data: errGetParcel,
                      });
                    } else {
                      return res.status(200).send({
                        success: true,
                        data: resultGetParcel[0],
                      });
                    }
                  });
                }
              });
            }else{
              res.status(500).send({
                success: false,
                data: "Missing query!",
              });
            }
          });
        } catch (error) {
          console.log(error);
          res.status(500).send({
            success: false,
            data: error,
          });
        }
    } else {
      return res.status(500).send({
        success: false,
        data: "User not allowed!",
      });
    }
  },
  deleteParcel: (req, res) => {
    if (req.user.role === "admin") {
      if (req.query.id) {
        let deleteQuery = `update parcels set active = 'false' where id_parcel = ${db.escape(
          req.query.id
        )}`;
        db.query(deleteQuery, (errorDeleteQuery, resultDeleteQuery) => {
          if (errorDeleteQuery) {
            return res.status(500).send({
              success: false,
              data: errorDeleteQuery,
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
  editParcel: (req, res) => {
    if (req.user.role === "admin") {
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
          console.log(`data:`,data)
          let {id, category, name, description, margin, price, image} = data
          image = filepath;
          console.log(`image: `,image)
          
          if(id && category && name && description && margin && price && image){
            let deleteCategoryQuery = `DELETE FROM parcel_categories WHERE id_parcel = ${id}`
            db.query(deleteCategoryQuery,(err,result) => {
              if (err) {
                return res.status(500).send({
                  success: false,
                  data: err,
                });
              } 
              let editParcelQuery = `update parcels set parcel_name=${db.escape(name)}, parcel_price=${(db.escape(price))}, margin=${db.escape(margin)},image_parcel=${(db.escape(filepath))}, description=${db.escape(description)} where id_parcel=${(id)}`;
              db.query(editParcelQuery, (errEditParcelQuery, resulteditParcelQuery) => {
                if (errEditParcelQuery) {
                  fs.unlinkSync("./public" + filepath);
                  return res.status(500).send({
                    success: false,
                    data: errEditParcelQuery,
                  });
                } 
                if (id) {
                  for(let i = 0;i<data.category.length;i++){
                    let id_category = parseInt(data.category[i].category)
                    let quantity = parseInt(data.category[i].category)
                    let addCategoryQuery = `insert into parcel_categories values (null, ${db.escape(id)}, ${db.escape(id_category)}, ${db.escape(quantity)})`
                    console.log(`addCategoryQuery ke-${i} : ${addCategoryQuery}`)
                    db.query(addCategoryQuery, (errCategoryQuery, resultCategoryQuery) => {
                      if (errCategoryQuery) {
                        fs.unlinkSync("./public" + filepath);
                        return res.status(500).send({
                          success: false,
                          data: errCategoryQuery,
                        });
                      }
                    });
                  }
                  
                  let getQueryParcels = `select * from parcels where id_parcel='${id}'`;
                  db.query(getQueryParcels, (errGetParcel, resultGetParcel) => {
                    if (errGetParcel) {
                      fs.unlinkSync("./public" + filepath);
                      return res.status(500).send({
                        success: false,
                        data: errGetParcel,
                      });
                    } else {
                      return res.status(200).send({
                        success: true,
                        data: resultGetParcel[0],
                      });
                    }
                  });
                }
              });
            })
          }else{
            res.status(500).send({
              success: false,
              data: "Missing query!",
            });
          }
        });
      } catch (error) {
        console.log(error);
        res.status(500).send({
          success: false,
          data: error,
        });
      }
  } else {
    return res.status(500).send({
      success: false,
      data: "User not allowed!",
    });
  }
  }
}
