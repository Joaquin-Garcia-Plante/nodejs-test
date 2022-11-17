const Direccion = require("../models/direccion.model");
const { filterByDNI } = require("../filters/persona.filter");
const { validateTypeFields } = require("../validations");

//Este middleware de utiliza para validar que la direccion que se este intentando eliminar/actualizar en la ruta /person/modify sean de la persona con el DNI ingresado
const validateDirection = async (req, res, next) => {
  if (req.body.EliminarDireccionID || req.body.ModificarDireccion) {
    let persona = await filterByDNI(req.body.DNI);
    if (req.body.EliminarDireccionID) {
      let direccion = await Direccion.findOne({
        ID: req.body.EliminarDireccionID,
      });
      //Si no existe la direccion devuelvo un error
      if (!direccion) {
        return res
          .status(404)
          .send(
            `La direccion con ID ${req.body.EliminarDireccionID} no existe`
          );
      }
      if (!persona._id.equals(direccion.Persona)) {
        return res
          .status(404)
          .send(
            `La direccion con ID ${req.body.EliminarDireccionID} no le pertenece a la persona con DNI ${req.body.DNI}`
          );
      }
    }
    if (req.body.ModificarDireccion) {
      if (!req.body.ModificarDireccion.ID) {
        return res
          .status(404)
          .send("Debe ingresar el ID de la direccion que desea modificar");
      }
      let direccion = await Direccion.findOne({
        ID: req.body.ModificarDireccion.ID,
      });
      if (!direccion) {
        return res
          .status(404)
          .send(
            `La direccion con ID ${req.body.ModificarDireccion.ID} no existe`
          );
      }
      if (!persona._id.equals(direccion.Persona)) {
        return res
          .status(404)
          .send(
            `La direccion con ID ${req.body.ModificarDireccion.ID} no le pertenece a la persona con DNI ${req.body.DNI}`
          );
      }
      //Valido los tipos de los campos direccion
      if (req.body.ModificarDireccion.Calle) {
        if (!validateTypeFields(req.body.ModificarDireccion.Calle, "string"))
          return res
            .status(404)
            .send("Debe ingresar correctamente la calle de la direccion");
      }
      if (req.body.ModificarDireccion.Altura) {
        if (!validateTypeFields(req.body.ModificarDireccion.Altura, "number"))
          return res
            .status(404)
            .send("Debe ingresar correctamente la altura de la direccion");
      }
      if (req.body.ModificarDireccion.Ciudad) {
        if (!validateTypeFields(req.body.ModificarDireccion.Ciudad, "string"))
          return res
            .status(404)
            .send("Debe ingresar correctamente la ciudad de la direccion");
      }
    }
  }
  return next();
};

const validateDNI = async (req, res, next) => {
  if (req.body.DNI) {
    let persona = await filterByDNI(req.body.DNI);
    if (persona) {
      return next();
    } else {
      //Si no encuentro la persona con el DNI recibido devuelvo un error indicando el mensaje
      return res
        .status(404)
        .send(`No se encontró la persona con el DNI ${req.body.DNI}`);
    }
  } else {
    //Si no tengo el DNI devuelvo un error al no poder localizar la persona que se desea modificar
    return res
      .status(404)
      .send("Debe ingresar el DNI de la persona que desea modificar");
  }
};

module.exports = {
  validateDirection,
  validateDNI,
};
