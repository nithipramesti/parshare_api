const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bearerToken = require("express-bearer-token");
dotenv.config();

const PORT = process.env.PORT;
const app = express();

app.use(cors());
app.use(express.json());
app.use(bearerToken());

app.use(express.static("public"));

const {
  userRouters,
  parcelRouters,
  productRouters,
  transactionRouters,
} = require("./routers");

app.use("/users", userRouters);
app.use("/parcels", parcelRouters);
app.use("/products", productRouters);
app.use("/transaction", transactionRouters);

app.listen(PORT, () => console.log("Api Running :", PORT));
