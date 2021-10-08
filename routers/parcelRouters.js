const express = require("express");
const routers = express.Router();
const { parcelControllers } = require("../controllers");

routers.get("/get-parcels-user", parcelControllers.getParcelsUser);

module.exports = routers;
