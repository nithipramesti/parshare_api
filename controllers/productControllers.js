const { db } = require("../database");

module.exports = {
  deleteProduct: (req,res) => {
    if(req.user.role === "admin"){
      let {id} = req.body;
      let addQuery = `update products set active = 'false' where id_product = '${id}'`
      db.query(addQuery, (err, result) => {
        if(err){
          return res.status(500).send({
            success: false,
            data: err
          })
        }else if(result.insertId){
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
