const { validateTypeFields } = require(".");

//Esta funcion se encarga de validar que la direccion contenga los campos necesarios para ser cargada
const validateDireccion = (direccion) => {
  //Verifico tener una direccion
  if (!direccion || direccion == undefined || !typeof direccion == "object") {
    return false;
  }

  //Obtengo los campos del objeto y verifico tener los necesarios
  const direccionKeys = Object.keys(direccion);
  if (
    !direccionKeys.includes("Calle") ||
    !direccionKeys.includes("Altura") ||
    !direccionKeys.includes("Ciudad")
  ) {
    return false;
  }

  //Obtengo los campos de la direccion y los verifico
  const { Calle, Altura, Ciudad } = direccion;

  //Validacion de tipos
  if (!validateTypeFields(Calle, "string")) return false;
  if (!validateTypeFields(Altura, "number")) return false;
  if (!validateTypeFields(Ciudad, "string")) return false;

  //Validacion de contenido
  if (!Altura || Altura == undefined) return false;
  if (!Calle || Calle == undefined || Calle.trim() == "") return false;
  if (!Ciudad || Ciudad == undefined || Ciudad.trim() == "") return false;

  return true;
};

module.exports = {
  validateDireccion,
};
