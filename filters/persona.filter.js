const Persona = require("../models/persona.model");

//Esta funcion se encarga de localizar el documento de la persona que tenga como DNI el valor recibido por parámetro
const filterByDNI = async (DNI) => {
  const persona = await Persona.findOne({ DNI }).populate({
    path: "Direcciones",
    select: "ID Calle Altura Ciudad",
  });
  return persona;
};

//Esta funcion se encarga de filtrar el listado de personas (segundo parametro) y devolver las que su nombre coincidan con el primer parámetro recibido
const filterByName = (name, personas) => {
  const filteredPeople = personas.filter((persona) => persona.Nombre === name);
  return filteredPeople;
};

//Esta funcion se encarga de filtrar el listado de personas (segundo parametro) y devolver aquellas que su edad coincida con el primer parametro recibido
const filterByAge = (age, personas) => {
  const filteredPeople = personas.filter((persona) => persona.Edad == age);
  return filteredPeople;
};

module.exports = {
  filterByDNI,
  filterByName,
  filterByAge,
};
