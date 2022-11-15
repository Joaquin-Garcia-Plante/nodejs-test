const Persona = require("../models/persona.model");
const Direccion = require("../models/direccion.model");
const { Parser } = require("json2csv");
const validateFields =
  require("../validations/persona.validations").validateFields;

const validateDireccion =
  require("../validations/direccion.validations").validateDireccion;
const validateDNI = require("../validations/persona.validations").validateDNI;
const filterByDNI = require("../filters/persona.filter").filterByDNI;
const filterByName = require("../filters/persona.filter").filterByName;
const filterByAge = require("../filters/persona.filter").filterByAge;

//Esta funcion se utiliza para devolver un objeto persona listo para cargar en la base de datos
const createObjPersona = (body) => {
  //Recolecto los datos que ya se que recibi por body
  const { DNI, Nombre, Apellido, Edad } = body;
  var personaObj = new Object({
    DNI,
    Nombre,
    Apellido,
    Edad,
  });
  if (body.Foto && !body.Foto == undefined) {
    personaObj.Foto = body.Foto;
  }
  return personaObj;
};

//Esta funcion se utiliza para devolver un objeto con los campos de una direccion listos para cargar en la db
const createObjDireccion = (direccion) => {
  const { Calle, Altura, Ciudad } = direccion;
  //Una vez que tengo la direccion procedo a crear el objeto para devolverlo
  let objDireccion = new Object({
    Calle,
    Altura,
    Ciudad,
  });
  return objDireccion;
};

//Esta funcion analiza los campos recibidos en el body de la ruta para modificar una persona y devuelve un objeto para poder actualizar el documento
const getObjectModifyPerson = (body) => {
  let obj = {};
  if (body.Nombre) {
    obj.Nombre = body.Nombre;
  }
  if (body.Apellido) {
    obj.Apellido = body.Apellido;
  }
  if (body.Edad) {
    obj.Edad = body.Edad;
  }
  if (body.Foto) {
    obj.Foto = body.Foto;
  }
  return obj;
};

//Funcion para dar de alta una persona
const alta = async (req, res) => {
  //Verifico que los campos principales de una persona hayan sido recibidos por body
  if (!validateFields(req.body)) {
    return res
      .status(404)
      .send(
        "Para cargar una persona necesita ingresar correctamente el DNI, Nombre, Apellido y Edad"
      );
  }

  //Valido que no exista otra persona cargada con el dni recibido
  if (!(await validateDNI(req.body.DNI))) {
    return res.status(404).send("Ya existe una persona con el DNI ingresado");
  }

  //Verifico haber recibido una direccion valida
  if (!validateDireccion(req.body.Direccion)) {
    return res
      .status(404)
      .send("Debe ingresar correctamente los campos Calle, Altura y Ciudad");
  }

  //Creo el objeto persona
  const personaObj = createObjPersona(req.body);

  //Creo el objeto direccion
  var direccionObj = createObjDireccion(req.body.Direccion);

  //Paso a crear los documentos en la base de datos
  let personaDoc = new Persona(personaObj);
  let direccionDoc = new Direccion(direccionObj);

  //Creo la relacion entre ellos
  personaDoc.Direcciones.push(direccionDoc._id);
  direccionDoc.Persona = personaDoc._id;

  //Guardo los documentos
  await personaDoc.save();
  await direccionDoc.save();

  return res
    .status(201)
    .send(
      `La persona ${personaDoc.Nombre} ${personaDoc.Apellido} con el DNI ${personaDoc.DNI} ha sido añadida con éxito`
    );
};

//Esta funcion se encarga de devolver el listado de las personas y sus correspondientes direcciones
const getList = async (req, res) => {
  //Obtengo el listado de personas y reemplazo la relacion direcciones por el documento, obteniendo los datos para devolver
  const personas = await Persona.find().populate({
    path: "Direcciones",
    select: "ID Calle Altura Ciudad",
  });
  if (!personas) {
    return res.status(404).send("No se encontraron personas cargadas");
  }
  return res.status(201).json(personas);
};

//Filtrado de personas por A, B y D
const getFilterList = async (req, res) => {
  if (req.query.DNI) {
    //Si me llegó un DNI como filtrado solo devuelvo la persona a la cual le pertenece el DNI
    let persona = await filterByDNI(req.query.DNI);
    //Si encontré una persona la devuelvo, de lo contrario devuelvo un mensaje de error
    if (persona) {
      return res.status(201).json(persona);
    } else {
      return res
        .status(404)
        .send(`No se encontró una persona con el DNI ${req.query.DNI}`);
    }
  }

  //Obtengo el listado de personas para posteriormente filtrarlo
  let personas = await Persona.find().populate({
    path: "Direcciones",
    select: "ID Calle Altura Ciudad",
  });

  //Filtrado por nombre
  if (req.query.Nombre) {
    personas = filterByName(req.query.Nombre, personas);
  }
  //Filtrado por edad
  if (req.query.Edad) {
    personas = filterByAge(req.query.Edad, personas);
  }

  //Si encuentro personas devuelvo el listado, de lo contrario devuelvo un error y un mensaje indicando el motivo
  if (personas) {
    return res.status(201).json(personas);
  } else {
    return res
      .status(404)
      .send("No se encontraron personas con los filtros aplicados");
  }
};

const getCSV = async (req, res) => {
  //Obtengo el listado de personas con sus direciones
  let personas = await Persona.find({}).populate({
    path: "Direcciones",
    select: "ID Calle Altura Ciudad",
  });

  //Defino los campos del csv
  const fields = [
    {
      label: "DNI",
      value: "DNI",
    },
    {
      label: "Nombre",
      value: "Nombre",
    },
    {
      label: "Apellido",
      value: "Apellido",
    },
    {
      label: "Edad",
      value: "Edad",
    },
    {
      label: "Foto",
      value: "Foto",
    },
    {
      label: "Direcciones",
      value: "Direcciones",
    },
  ];
  const json2csv = new Parser({ fields: fields });
  try {
    //Parseo el listado de personas a csv
    const csv = json2csv.parse(personas);
    res.attachment("data.csv");
    res.status(201).send(csv);
  } catch (error) {
    console.log("error:", error.message);
    res.status(404).send(error.message);
  }
};

//Funcion para modificar un documento de una persona en la base de datos
const modifyPerson = async (req, res) => {
  //En primer lugar localizo el documento por su DNI (recibido por body) para luego poder actualizarlo
  if (req.body.DNI) {
    let persona = await filterByDNI(req.body.DNI);
    if (persona) {
      //Si encontré la persona formo un objeto para poder actualizar el documento
      let objPerson = getObjectModifyPerson(req.body);
      Object.assign(persona, objPerson);

      //Una vez que tengo el objeto actualizado paso a guardarlo
      await persona.save();
      return res
        .status(201)
        .json(
          `La persona con el DNI ${req.body.DNI} ha sido actualizada con éxito`
        );
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

//Esta funcion se encarga de localizar un documento de la coleccion personas la cual su ID(DNI) coincida con el recibido por query params
const getPersonByID = async (req, res) => {
  //Valido haber recibido el ID
  if (!req.query.ID) {
    return res.status(404).send("Debe ingresar el DNI para obtener la persona");
  }
  const persona = await filterByDNI(req.query.ID);
  if (persona) {
    return res.status(201).json(persona);
  } else {
    return res
      .status(404)
      .send(`La persona con DNI ${req.query.ID} no ha sido encontrada`);
  }
};

//Esta funcion se encarga de eliminar el documento persona y sus relaciones
//Recibe por query params el DNI de la persona
const deletePerson = async (req, res) => {
  if (!req.query.DNI) {
    return res
      .status(404)
      .send("Debe ingresar el DNI para poder eliminar una persona");
  }
  //Busco la persona y valido que exista
  const persona = await filterByDNI(req.query.DNI);
  if (!persona) {
    return res
      .status(404)
      .send(`La persona con DNI ${req.query.DNI} no ha sido encotrada`);
  }
  //Eliminacion de las direcciones
  if (persona.Direcciones.length > 0) {
    for (let i = 0; i < persona.Direcciones.length; i++) {
      await Direccion.findByIdAndDelete(persona.Direcciones[i]);
    }
  }
  //ELiminacion del documento de la persona
  await Persona.findByIdAndDelete(persona._id);

  return res
    .status(201)
    .send(`La persona con DNI ${req.query.DNI} ha sido eliminada con éxito`);
};

module.exports = {
  alta,
  getList,
  getCSV,
  getFilterList,
  modifyPerson,
  getPersonByID,
  deletePerson,
};
