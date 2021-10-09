const { db } = require("../database");

module.exports = {
  getParcelsUser: (req, res) => {
    //MySQL query to get parcel data
    let scriptQuery = `SELECT p.id_parcel, p.parcel_name, p.image_parcel, p.active, c.category, pc.parcelcategory_quantity
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
    let getQuery = `SELECT parcels.id_parcel as id, parcels.parcel_name, parcels.parcel_price, parcels.margin, parcels.image_parcel, parcels.description, parcels.active, GROUP_CONCAT(categories.category SEPARATOR',') as categories, GROUP_CONCAT(parcel_categories.parcelcategory_quantity SEPARATOR',') as quantities FROM parcels JOIN parcel_categories ON parcel_categories.id_parcel = parcels.id_parcel JOIN categories ON parcel_categories.id_category = categories.id_category GROUP BY parcels.id_parcel, parcels.parcel_name, parcels.image_parcel`
    db.query(getQuery, (err, result) => {
      if(err){
        return res.status(500).send({
          success: false,
          data: err
        })
      }else{
        var final = result.map(res => {
          return {
            ...res,
            categoryQuantity: [res.categories, res.quantities],
          }
        })
        return res.status(200).send({
          success: true,
          data: final
        })
      }
    })
  },
  getParcel: (req, res) => {
    if(req.query.id){
      let getQuery = `select * from parcels where id_parcel = ${db.escape(parseInt(req.query.id))}`
      db.query(getQuery, (err, result) => {
        if(err){
          return res.status(500).send({
            success: false,
            data: err
          })
        }else{
          return res.status(200).send({
            success: true,
            data: result[0]
          })
        }
      })
    }else{
      return res.status(500).send({
        success: false,
        data: "Parcel id required!"
      })
    }
  }
}