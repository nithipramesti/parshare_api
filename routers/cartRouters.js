const express = require("express");
const routers = express.Router();
const { cartControllers } = require("../controllers");

routers.post("/add", cartControllers.add);
routers.post("/get", cartControllers.get);
routers.post("/checkout", cartControllers.checkout);

module.exports = routers;
