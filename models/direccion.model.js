const mongoose = require("mongoose");
let AutoIncrement = require("mongoose-sequence")(mongoose);

const direccionSchema = new mongoose.Schema({
  ID: Number,
  Calle: String,
  Altura: Number,
  Ciudad: String,
  Persona: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Persona",
  },
});

//Utilizacion de plugin para autoincrementar el id de las direcciones
direccionSchema.plugin(AutoIncrement, {
  id: "ID_seq",
  inc_field: "ID",
});

module.exports = mongoose.model("Direccion", direccionSchema);
