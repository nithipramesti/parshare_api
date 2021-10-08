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
};
