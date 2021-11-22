const express = require("express");
const routers = express.Router();
const { productControllers } = require("../controllers");
const { auth } = require("../helper/authToken");

routers.post("/add", auth, productControllers.addProduct);
routers.delete("/delete", auth, productControllers.deleteProduct);
routers.patch("/edit", auth, productControllers.editProduct);
routers.post("/get/:id_parcel", productControllers.getProduct);
routers.post("/getPerPage", productControllers.getPerPage);
routers.post("/getFilter", productControllers.getFilter);
routers.get("/list", productControllers.listProduct);
routers.get("/sold", auth, productControllers.soldProduct);

module.exports = routers;
