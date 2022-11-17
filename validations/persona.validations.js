const { validateTypeFields } = require(".");
const Persona = require("../models/persona.model");
validateTypeFields;

//Esta funcion se encargará de validar que los campos necesarios para cargar una persona en la base de datos no esten vacíos
const validateFields = (body) => {
  //En primera instancia valido que el body no este vacio
  if (!body || body == undefined) {
    return false;
  }

  //Obtengo las claves del body y verifico que existan todas las necesarias
  const bodyKeys = Object.keys(body);
  if (
    !bodyKeys.includes("DNI") ||
    !bodyKeys.includes("Edad") ||
    !bodyKeys.includes("Nombre") ||
    !bodyKeys.includes("Apellido")
  ) {
    return false;
  }

  //Una vez que se que tengo los valores procedo a validar los tipos y que tengan valores para cargar
  const { DNI, Nombre, Apellido, Edad } = body;

  //Validacion de tipos
  if (!validateTypeFields(DNI, "number")) return false;
  if (!validateTypeFields(Edad, "number")) return false;
  if (!validateTypeFields(Nombre, "string")) return false;
  if (!validateTypeFields(Apellido, "string")) return false;
  if (bodyKeys.includes("Foto")) {
    if (!validateTypeFields(body.Foto, "string")) return false;
  }
  //Validacion de contenido
  if (!DNI || DNI == undefined) return false;
  if (!Edad || Edad == undefined) return false;
  if (!Nombre || Nombre == undefined || Nombre.trim() == "") return false;
  if (!Apellido || Apellido == undefined || Apellido.trim() == "") return false;

  return true;
};

// Esta funcion se encarga de validar que no se intente dar de alta una persona con el dni repetido
const validateDNI = async (DNI) => {
  //Busco en la db una persona con el dni recibido
  const persona = await Persona.findOne({ DNI });
  //Si ya tengo una persona con ese dni devuelvo false
  if (persona || !persona == undefined) {
    return false;
  } else {
    return true;
  }
};

//Esta funcion valida que la direccion que se esta intentando añadir no se encuentre ya cargada
const validateDuplicateDirection = (direccion, arrDirecciones) => {
  let bool = true;
  for (let i = 0; i < arrDirecciones.length; i++) {
    if (
      direccion.Calle == arrDirecciones[i].Calle &&
      direccion.Altura == arrDirecciones[i].Altura &&
      direccion.Ciudad == arrDirecciones[i].Ciudad
    ) {
      bool = false;
      break;
    }
  }
  return bool;
};

module.exports = {
  validateFields,
  validateDNI,
  validateTypeFields,
  validateDuplicateDirection,
};
