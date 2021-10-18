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

app.get("/", (req, res) => {
  res.status(200).send("<h4>Welcome to your-api</h4>");
});

const {
  userRouters,
  changePasswordRouters,
  parcelRouters,
  productRouters,
  transactionRouters,
  categoryRouters,
  cartRouters,
} = require("./routers");

app.use("/users", userRouters);
app.use("/change-password", changePasswordRouters);
app.use("/parcels", parcelRouters);
app.use("/products", productRouters);
app.use("/transactions", transactionRouters);
app.use("/categories", categoryRouters);
app.use("/cart", cartRouters);

app.listen(PORT, () => console.log("Api Running :", PORT));
