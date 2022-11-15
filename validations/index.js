//Esta funcion se encarga de validar que el tipo de campo coincida con el declarado en el modelo
const validateTypeFields = (field, fieldType) => {
  if (typeof field != fieldType) {
    return false;
  }
  return true;
};

module.exports = {
  validateTypeFields,
};
