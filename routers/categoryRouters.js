const express = require("express");
const routers = express.Router();
const { categoryControllers } = require("../controllers");
const { auth } = require("../helper/authToken");

//Insert routers here
routers.get('/average', categoryControllers.averagePrice);
routers.post('/add', auth, categoryControllers.addCategory)
routers.get('/get', categoryControllers.getCategory)
routers.get('/list', categoryControllers.listCategory)
routers.patch('/edit', auth, categoryControllers.editCategory)
routers.delete('/delete', auth, categoryControllers.deleteCategory)

module.exports = routers;
