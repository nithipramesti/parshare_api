const express = require("express");
const routers = express.Router();
const { parcelControllers } = require("../controllers");

routers.get("/get-parcels-user", parcelControllers.getParcelsUser);
routers.get('/list', parcelControllers.listParcel)
routers.get('/get', parcelControllers.getParcel)

module.exports = routers;
