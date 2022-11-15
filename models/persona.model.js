const mongoose = require("mongoose");

//Defino el schema
const personaSchema = new mongoose.Schema({
  DNI: Number,
  Nombre: String,
  Apellido: String,
  Edad: Number,
  Foto: String,
  Direcciones: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Direccion",
    },
  ],
});

//Exporto el modelo para poder hacerle consultas a la db
module.exports = mongoose.model("Persona", personaSchema);
