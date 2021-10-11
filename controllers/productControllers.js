const { db } = require("../database");
const { uploader } = require("../helper/uploader");
const fs = require("fs");

module.exports = {
  listProduct: (req, res) => {
    let getQuery = `SELECT id_product as id, id_product, product_name, product_price, image_product, db_parshare.products.id_category, db_parshare.categories.category, product_quantity, db_parshare.products.active FROM products INNER JOIN db_parshare.categories ON db_parshare.products.id_category = db_parshare.categories.id_category`
    db.query(getQuery, (err, result) => {
      if(err){
        return res.status(500).send({
          success: false,
          data: err
        })
      }else{
        return res.status(200).send({
          success: true,
          data: result
        })
      }
    })
  },
  getProduct: (req, res) => {
    if(req.query.id) {
      let getQuery = `SELECT id_product as id, id_product, product_name, product_price, image_product, db_parshare.products.id_category, db_parshare.categories.category, product_quantity, db_parshare.products.active FROM products INNER JOIN db_parshare.categories ON db_parshare.products.id_category = db_parshare.categories.id_category WHERE id_product = ${req.query.id}`
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
      res.status(500).status({
        success: false,
        data: "Missing query!"
      })
    }
  },
  addProduct: (req, res) => {
    if(req.user.role === 'admin'){
      let { name, price, category, quantity } = JSON.parse(req.body.data);
      if(name && price && category && quantity && req.files) {
        try {
          let path = '/images'
          const upload = uploader(path, 'IMG').fields([{ name: 'file' }])
          
          upload(req, res, (error) => {
            if (error) {
                console.log(error)
                res.status(500).send(error)
            }
            
            const { file } = req.files
            const filepath = file ? path + '/' + file[0].filename : null
            let data = JSON.parse(req.body.data)
            data.image = filepath
            
            let addQuery = `insert into products values (null, ${db.escape(name)}, ${db.escape(filepath)}, ${db.escape(price)}, ${db.escape(category)}, ${db.escape(quantity)}, 'true')`
            db.query(addQuery, (err, result) => {
              if(err){
                fs.unlinkSync('./public' + filepath)
                return res.status(500).send({
                  success: false,
                  data: err
                })
              }else if(result.insertId){
                let getQuery = `select * from products where id_product='${result.insertId}'`
                db.query(getQuery, (err2, result2) => {
                  if(err2){
                    fs.unlinkSync('./public' + filepath)
                    return res.status(500).send({
                      success: false,
                      data: err2
                    })
                  }else{
                    return res.status(200).send({
                      success: true,
                      data: result2[0]
                    })
                  }
                })
              }
            })
          })
        } catch (error) {
          console.log(error)
          res.status(500).send({
            success: false,
            data: error
          })
        }
      }else{
        res.status(500).send({
          success: false,
          data: "Missing query!"
        })
      }
    }else{
      return res.status(500).send({
        success: false,
        data: "User not allowed!"
      })
    }
  },
  editProduct: (req, res) => {
    if(req.user.role === "admin"){
      console.log(req)
      let { id, name, price, category, quantity } = JSON.parse(req.body.data);
      if(id && name && category && quantity && req.files) {
        try {
          let path = '/images'
          const upload = uploader(path, 'IMG').fields([{ name: 'file' }])
          
          upload(req, res, (error) => {
            if (error) {
                console.log(error)
                res.status(500).send(error)
            }
            
            const { file } = req.files
            const filepath = file ? path + '/' + file[0].filename : null
            let data = JSON.parse(req.body.data)
            data.image = filepath

            fs.unlinkSync('./public' + image);
            let updateQuery = `update products set product_name = ${db.escape(name)}, product_price = ${db.escape(price)}, image_product = ${db.escape(filepath)}, id_category = ${db.escape(category)}, product_quantity = ${db.escape(quantity)} where id_product = ${db.escape(id)}`
            db.query(updateQuery, (err2, result2) => {
              if(err2){
                fs.unlinkSync('./public' + filepath)
                return res.status(500).send({
                  success: false,
                  data: err2
                })
              }else{
                res.status(200).send({
                  status: true
                })
              }
            })
          })
        } catch (error) {
          console.log(error)
          res.status(500).send({
            success: false,
            data: error
          })
        }
      }else if(id && name && category && quantity){
        let updateQuery = `update products set product_name = ${db.escape(name)}, product_price = ${db.escape(price)}, id_category = ${db.escape(category)}, product_quantity = ${db.escape(quantity)} where id_product = ${db.escape(id)}`
        db.query(updateQuery, (err, result) => {
          if(err){
            return res.status(500).send({
              success: false,
              data: err
            })
          }else{
            let getQuery = `select * from products where id_product = ${db.escape(id)}`
            db.query(getQuery, (err2, result2) => {
              if(err2){
                return res.status(500).send({
                  success: false,
                  data: err2
                })
              }else{
                return res.status(200).send({
                  success: true,
                  data: result2[0]
                })
              }
            })
          }
        })
      }
    }else{
      return res.status(500).send({
        success: false,
        data: "User not allowed!"
      })
    }
  },
  deleteProduct: (req, res) => {
    if(req.user.role === "admin"){
      if(req.query.id){
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
          data: "Missing query!"
        })
      }
    }else{
      return res.status(500).send({
        success: false,
        data: "User not allowed!"
      })
    }
  }
}
