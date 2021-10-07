const { db } = require("../database");
const { uploader } = require("../helper/uploader");
const fs = require("fs");

module.exports = {
  deleteProduct: (req, res) => {
    if(req.user.role === "admin"){
      let deleteQuery = `update products set active = 'false' where id_product = ${db.escape(req.query.id)}`
      db.query(deleteQuery, (err, result) => {
        if(err){
          return res.status(500).send({
            success: false,
            data: err
          })
        }else{
          return res.status(200).send({
            success: true,
            data: "Delete succeed!"
          })
        }
      })
    }else{
      return res.status(500).send({
        success: false,
        data: "User not allowed!"
      })
    }
  }
}