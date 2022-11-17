const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const router = require("./routes");
const dotenv = require("dotenv");
dotenv.config();

//Inicializamos nuestro servicio web express
const app = express();

//Conectamos nuestra base de datos
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then()
  .catch((err) => console.log(err));

app.use(bodyParser.json());
app.use("/", router);

//Ponemos nuestro servidor a escuchar en el puerto 8080
app.listen(8080, () => {
  console.log("Server running");
});
module.exports = app;
