const expect = require("chai").expect;
const request = require("supertest");
const Persona = require("../models/persona.model");
const server = require("../server");
const Direccion = require("../models/direccion.model");
const mongoose = require("mongoose");

describe("GET /persona/list", () => {
  it("Si no hay personas deberia devolver un error", async () => {
    //Primero busco las personas y las guardo
    const personas = await Persona.find();
    //Luego de guardarlas las elimino
    await Persona.deleteMany({});
    //Realizo la peticion
    const res = await request(server).get("/persona/list");
    //Luego vuelvo a cargar las personas
    //Las relaciones seguirán intactas ya que no elimine la coleccion direcciones
    await Persona.insertMany(personas);
    expect(res.status).to.equal(404);
  });
  it("Debería devolver una lista de todas las personas y sus direcciones", async () => {
    //Busqueda de todas las personas con sus direcciones
    const personas = await Persona.find().populate({
      path: "Direcciones",
      select: "ID Calle Altura Ciudad",
    });
    const res = await request(server).get("/persona/list");
    expect(res.status).to.equal(201);
    expect(res.body.length).to.equal(personas.length);
  });
});

describe("GET /persona/find-by-id", () => {
  it("Si no se ingresa el ID debería devolver un mensaje de error", async () => {
    const res = await request(server).get("/persona/find-by-id");
    expect(res.status).to.equal(404);
  });
  it("Si existe la persona con el ID ingresado debe encontrarla y devolver sus datos", async () => {
    const persona = new Persona({
      DNI: 123,
      Nombre: "Abraham",
      Apellido: "Simpson",
      Edad: 86,
      Foto: "https://static.wikia.nocookie.net/lossimpson/images/a/a9/Abraham_Simpson.png/revision/latest/scale-to-width-down/278?cb=20150426055530&path-prefix=es",
      Direccion: {
        Calle: "Siempre viva",
        Altura: 742,
        Ciudad: "Springfield",
      },
    });
    await persona.save();
    const res = await request(server).get("/persona/find-by-id?ID=123");

    //Una vez que la encontró elimino los registros
    await Persona.findByIdAndDelete(persona._id);
    await Direccion.findByIdAndDelete(persona.Direcciones[0]);
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("DNI", 123);
    expect(res.body).to.have.property("Nombre", "Abraham");
    expect(res.body).to.have.property("Apellido", "Simpson");
    expect(res.body).to.have.property("Edad", 86);
    expect(res.body).to.have.property(
      "Foto",
      "https://static.wikia.nocookie.net/lossimpson/images/a/a9/Abraham_Simpson.png/revision/latest/scale-to-width-down/278?cb=20150426055530&path-prefix=es"
    );
  });
  it("Si no existe una persona con el ID ingresado debería devolver un error", async () => {
    const res = await request(server).get("/persona/find-by-id?ID=123");
    expect(res.status).to.equal(404);
  });
});

describe("GET /persona/filtered-list", () => {
  it("Si no se ingresan filtros debe devolver un error", async () => {
    const res = await request(server).get("/persona/filtered-list");
    expect(res.status).to.equal(404);
  });
  it("Si se ingresa DNI como filtro debe localizar a la persona y devolverla", async () => {
    const persona = new Persona({
      DNI: 123,
      Nombre: "Abraham",
      Apellido: "Simpson",
      Edad: 86,
      Foto: "https://static.wikia.nocookie.net/lossimpson/images/a/a9/Abraham_Simpson.png/revision/latest/scale-to-width-down/278?cb=20150426055530&path-prefix=es",
      Direccion: {
        Calle: "Siempre viva",
        Altura: 742,
        Ciudad: "Springfield",
      },
    });
    await persona.save();
    const res = await request(server).get("/persona/filtered-list?DNI=123");

    //Una vez que la encontró elimino los registros
    await Persona.findByIdAndDelete(persona._id);
    await Direccion.findByIdAndDelete(persona.Direcciones[0]);

    //Verifico haber recibido los datos de la persona
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("DNI", 123);
    expect(res.body).to.have.property("Nombre", "Abraham");
    expect(res.body).to.have.property("Apellido", "Simpson");
    expect(res.body).to.have.property("Edad", 86);
    expect(res.body).to.have.property(
      "Foto",
      "https://static.wikia.nocookie.net/lossimpson/images/a/a9/Abraham_Simpson.png/revision/latest/scale-to-width-down/278?cb=20150426055530&path-prefix=es"
    );
  });
  it("Si se ingresa DNI como filtro y no existe la persona debe devolver un mensaje de error", async () => {
    const res = await request(server).get("/persona/filtered-list?DNI=123");
    expect(res.status).to.equal(404);
  });
  it("Si se ingresa un nombre como filtro debe localizar las personas con ese nombre y devolverlas", async () => {
    const res = await request(server).get(
      "/persona/filtered-list?Nombre=Bartholomew"
    );
    expect(res.status).to.equal(201);
  });
  it("Si se ingresa un nombre como filtro y no hay coincidencias debe devolver un error", async () => {
    const res = await request(server).get(
      "/persona/filtered-list?Nombre=nombreFalso"
    );
    expect(res.status).to.equal(404);
  });
  it("Si se ingresa una edad como filtro deberia localizar las personas con esa edad y devolverlas", async () => {
    const res = await request(server).get("/persona/filtered-list?Edad=34");
    expect(res.status).to.equal(201);
  });
  it("Si se ingresa una edad como filtro y no hay coincidencias deberia devolver un error", async () => {
    const res = await request(server).get("/persona/filtered-list?Edad=120");
    expect(res.status).to.equal(404);
  });
  it("Si se ingresa una edad y un nombre como filtro deberia localizar las personas con esa edad y nombre y devolverlas", async () => {
    const res = await request(server).get(
      "/persona/filtered-list?Edad=10&Nombre=Bartholomew"
    );
    expect(res.status).to.equal(201);
  });
  it("Si se ingresa una edad y un nombre como filtro y no hay coincidencias debería devolver un error", async () => {
    const res = await request(server).get(
      "/persona/filtered-list?Edad=120&Nombre=nombreFalso"
    );
    expect(res.status).to.equal(404);
  });
});

describe("GET /persona/csv", () => {
  it("Si no se encuentran personas cargadas debería devolver un error", async () => {
    //Primero busco las personas y las guardo
    const personas = await Persona.find();
    //Luego de guardarlas las elimino
    await Persona.deleteMany({});
    //Realizo la peticion
    const res = await request(server).get("/persona/csv");
    //Luego vuelvo a cargar las personas
    //Las relaciones seguirán intactas ya que no elimine la coleccion direcciones
    await Persona.insertMany(personas);
    expect(res.status).to.equal(404);
  });
  it("Si se encuentran personas debería devolver un status OK exportando el csv", async () => {
    const res = await request(server).get("/persona/csv");
    expect(res.status).to.equal(201);
  });
});

describe("POST /persona/alta", () => {
  it("Si se intenta dar de alta una persona con un DNI que ya existe debe devolver un error", async () => {
    let persona = {
      DNI: 12345678,
      Nombre: "Margaret Abigail",
      Apellido: "Simpson",
      Edad: 1,
      Foto: "https://static.wikia.nocookie.net/lossimpson/images/9/9d/Maggie_Simpson.png/revision/latest?cb=20100529224628&path-prefix=es",
      Direccion: {
        Calle: "Siempre viva",
        Altura: 742,
        Ciudad: "Springfield",
      },
    };
    const res = await request(server).post("/persona/alta").send(persona);
    expect(res.status).to.equal(404);
  });
  it("Si se intenta dar de alta una persona ingresando como DNI un tipo de dato incorrecto debe devolver un error", async () => {
    let persona = {
      DNI: "Hola Mundo",
      Nombre: "Margaret Abigail",
      Apellido: "Simpson",
      Edad: 1,
      Foto: "https://static.wikia.nocookie.net/lossimpson/images/9/9d/Maggie_Simpson.png/revision/latest?cb=20100529224628&path-prefix=es",
      Direccion: {
        Calle: "Siempre viva",
        Altura: 742,
        Ciudad: "Springfield",
      },
    };
    const res = await request(server).post("/persona/alta").send(persona);
    expect(res.status).to.equal(404);
  });
  it("Si se intenta dar de alta una persona ingresando como Nombre un tipo de dato incorrecto debe devolver un error", async () => {
    let persona = {
      DNI: 123456789,
      Nombre: 101,
      Apellido: "Simpson",
      Edad: 1,
      Foto: "https://static.wikia.nocookie.net/lossimpson/images/9/9d/Maggie_Simpson.png/revision/latest?cb=20100529224628&path-prefix=es",
      Direccion: {
        Calle: "Siempre viva",
        Altura: 742,
        Ciudad: "Springfield",
      },
    };
    const res = await request(server).post("/persona/alta").send(persona);
    expect(res.status).to.equal(404);
  });
  it("Si se intenta dar de alta una persona ingresando como Apellido un tipo de dato incorrecto debe devolver un error", async () => {
    let persona = {
      DNI: 123456789,
      Nombre: "Margaret Abigail",
      Apellido: 1234,
      Edad: 1,
      Foto: "https://static.wikia.nocookie.net/lossimpson/images/9/9d/Maggie_Simpson.png/revision/latest?cb=20100529224628&path-prefix=es",
      Direccion: {
        Calle: "Siempre viva",
        Altura: 742,
        Ciudad: "Springfield",
      },
    };
    const res = await request(server).post("/persona/alta").send(persona);
    expect(res.status).to.equal(404);
  });
  it("Si se intenta dar de alta una persona ingresando como Edad un tipo de dato incorrecto debe devolver un error", async () => {
    let persona = {
      DNI: 123456789,
      Nombre: "Margaret Abigail",
      Apellido: "Simpson",
      Edad: "Hola mundo",
      Foto: "https://static.wikia.nocookie.net/lossimpson/images/9/9d/Maggie_Simpson.png/revision/latest?cb=20100529224628&path-prefix=es",
      Direccion: {
        Calle: "Siempre viva",
        Altura: 742,
        Ciudad: "Springfield",
      },
    };
    const res = await request(server).post("/persona/alta").send(persona);
    expect(res.status).to.equal(404);
  });
  it("Si se intenta dar de alta una persona ingresando como Foto un tipo de dato incorrecto debe devolver un error", async () => {
    let persona = {
      DNI: 123456789,
      Nombre: "Margaret Abigail",
      Apellido: "Simpson",
      Edad: 1,
      Foto: 1234,
      Direccion: {
        Calle: "Siempre viva",
        Altura: 742,
        Ciudad: "Springfield",
      },
    };
    const res = await request(server).post("/persona/alta").send(persona);
    expect(res.status).to.equal(404);
  });
  it("Si se intenta dar de alta una persona sin ingresar su direccion debe devolver un error", async () => {
    let persona = {
      DNI: 123456789,
      Nombre: "Margaret Abigail",
      Apellido: "Simpson",
      Edad: 1,
      Foto: "https://static.wikia.nocookie.net/lossimpson/images/9/9d/Maggie_Simpson.png/revision/latest?cb=20100529224628&path-prefix=es",
    };
    const res = await request(server).post("/persona/alta").send(persona);
    expect(res.status).to.equal(404);
  });
  it("Si se intenta dar de alta una persona ingresando incorrectamente el tipo del campo Calle en su direccion debe devolver un error", async () => {
    let persona = {
      DNI: 123456789,
      Nombre: "Margaret Abigail",
      Apellido: "Simpson",
      Edad: 1,
      Foto: "https://static.wikia.nocookie.net/lossimpson/images/9/9d/Maggie_Simpson.png/revision/latest?cb=20100529224628&path-prefix=es",
      Direccion: {
        Calle: 123,
        Altura: 742,
        Ciudad: "Springfield",
      },
    };
    const res = await request(server).post("/persona/alta").send(persona);
    expect(res.status).to.equal(404);
  });
  it("Si se intenta dar de alta una persona ingresando incorrectamente el tipo del campo Altura en su direccion debe devolver un error", async () => {
    let persona = {
      DNI: 123456789,
      Nombre: "Margaret Abigail",
      Apellido: "Simpson",
      Edad: 1,
      Foto: "https://static.wikia.nocookie.net/lossimpson/images/9/9d/Maggie_Simpson.png/revision/latest?cb=20100529224628&path-prefix=es",
      Direccion: {
        Calle: "Siempre viva",
        Altura: "Hola mundo",
        Ciudad: "Springfield",
      },
    };
    const res = await request(server).post("/persona/alta").send(persona);
    expect(res.status).to.equal(404);
  });
  it("Si se intenta dar de alta una persona ingresando incorrectamente el tipo del campo Ciudad en su direccion debe devolver un error", async () => {
    let persona = {
      DNI: 123456789,
      Nombre: "Margaret Abigail",
      Apellido: "Simpson",
      Edad: 1,
      Foto: "https://static.wikia.nocookie.net/lossimpson/images/9/9d/Maggie_Simpson.png/revision/latest?cb=20100529224628&path-prefix=es",
      Direccion: {
        Calle: "Siempre viva",
        Altura: 742,
        Ciudad: 123,
      },
    };
    const res = await request(server).post("/persona/alta").send(persona);
    expect(res.status).to.equal(404);
  });
  it("Si se intenta dar de alta una persona sin su DNI repetido y con sus tipos correctamente, debe cargarla y devolver un status OK", async () => {
    let persona = {
      DNI: 1233,
      Nombre: "Mona Penelope Janet",
      Apellido: "Simpson",
      Edad: 78,
      Foto: "https://static.wikia.nocookie.net/lossimpson/images/f/fa/Mona_Simpson.png/revision/latest/scale-to-width-down/169?cb=20150920205339&path-prefix=es",
      Direccion: {
        Calle: "Siempre viva",
        Altura: 742,
        Ciudad: "Springfield",
      },
    };
    const res = await request(server).post("/persona/alta").send(persona);
    //Una vez cargada la elimino para no generar un posible error
    const deletedPerson = await request(server).delete(
      "/persona/delete-one?DNI=1233"
    );
    expect(res.status).to.equal(201);
  });
});

describe("PUT /persona/modify", () => {
  it("Si intento modificar una persona sin ingresar el DNI debe devolver un error", async () => {
    const res = await request(server).put("/persona/modify");
    expect(res.status).to.equal(404);
  });
  it("Si intento modificar una persona ingresando un DNI que no le pertenece a ninguna, debe devolver un error", async () => {
    const res = await request(server).put("/persona/modify").send({
      DNI: 1,
    });
    expect(res.status).to.equal(404);
  });
  it("Si intento modificar una persona ingresando como nombre un tipo de dato incorrecto debe devolver un error", async () => {
    const res = await request(server).put("/persona/modify").send({
      DNI: 1234,
      Nombre: 123,
    });
    expect(res.status).to.equal(404);
  });
  it("Si intento modificar una persona ingresando como Apellido un tipo de dato incorrecto debe devolver un error", async () => {
    const res = await request(server).put("/persona/modify").send({
      DNI: 1234,
      Apellido: 123,
    });
    expect(res.status).to.equal(404);
  });
  it("Si intento modificar una persona ingresando como Edad un tipo de dato incorrecto debe devolver un error", async () => {
    const res = await request(server).put("/persona/modify").send({
      DNI: 1234,
      Edad: "Hola mundo",
    });
    expect(res.status).to.equal(404);
  });
  it("Si intento modificar una persona ingresando como Foto un tipo de dato incorrecto debe devolver un error", async () => {
    const res = await request(server).put("/persona/modify").send({
      DNI: 1234,
      Apellido: 123,
    });
    expect(res.status).to.equal(404);
  });
  it("Si intento modificar una persona eliminando una direccion que no le pertenece al DNI ingresado debe devolver un error", async () => {
    const res = await request(server).put("/persona/modify").send({
      DNI: 1234,
      EliminarDireccionID: 3,
    });
    expect(res.status).to.equal(404);
  });
  it("Si intento modificar la direccion de una persona que no le pertenece debe devolver un error", async () => {
    const res = await request(server)
      .put("/persona/modify")
      .send({
        DNI: 1234,
        ModificarDireccion: {
          Calle: "Siempre vivaa",
          Altura: 742,
          Ciudad: "Springfieldd",
          ID: 3,
        },
      });
    expect(res.status).to.equal(404);
  });
  it("Si intento modificar la direccion de una persona ingresando incorrectamente el tipo de dato calle debe devolver un error", async () => {
    const res = await request(server)
      .put("/persona/modify")
      .send({
        DNI: 1234,
        ModificarDireccion: {
          Calle: 123,
          Altura: 742,
          Ciudad: "Springfieldd",
          ID: 1,
        },
      });
    expect(res.status).to.equal(404);
  });
  it("Si intento modificar la direccion de una persona ingresando incorrectamente el tipo de dato altura debe devolver un error", async () => {
    const res = await request(server)
      .put("/persona/modify")
      .send({
        DNI: 1234,
        ModificarDireccion: {
          Calle: "Siempre vivaa",
          Altura: "Hola mundo",
          Ciudad: "Springfieldd",
          ID: 1,
        },
      });
    expect(res.status).to.equal(404);
  });
  it("Si intento modificar la direccion de una persona ingresando incorrectamente el tipo de dato ciudad debe devolver un error", async () => {
    const res = await request(server)
      .put("/persona/modify")
      .send({
        DNI: 1234,
        ModificarDireccion: {
          Calle: "Siempre vivaa",
          Altura: 123,
          Ciudad: 1234,
          ID: 1,
        },
      });
    expect(res.status).to.equal(404);
  });
  it("Si intento añadir una direccion a una persona ingresando incorrectamente el tipo de dato ciudad debe devolver un error", async () => {
    const res = await request(server)
      .put("/persona/modify")
      .send({
        DNI: 1234,
        NuevaDireccion: {
          Calle: "Juan Del Campillo",
          Altura: 123,
          Ciudad: 1234,
        },
      });
    expect(res.status).to.equal(404);
  });
  it("Si intento añadir una direccion a una persona ingresando incorrectamente el tipo de dato altura debe devolver un error", async () => {
    const res = await request(server)
      .put("/persona/modify")
      .send({
        DNI: 1234,
        NuevaDireccion: {
          Calle: "Juan Del Campillo",
          Altura: "Hola mundo",
          Ciudad: "Córdoba Capital",
        },
      });
    expect(res.status).to.equal(404);
  });
  it("Si intento añadir una direccion a una persona ingresando incorrectamente el tipo de dato calle debe devolver un error", async () => {
    const res = await request(server)
      .put("/persona/modify")
      .send({
        DNI: 1234,
        NuevaDireccion: {
          Calle: 2345,
          Altura: 123,
          Ciudad: "Córdoba Capital",
        },
      });
    expect(res.status).to.equal(404);
  });
  it("Si intento modificar una persona ingresando correctamente su DNI y los tipos de datos debe devolver un status OK", async () => {
    const res = await request(server).put("/persona/modify").send({
      DNI: 1234,
      Nombre: "Homeroo",
      Apellido: "Simpsonn",
      Edad: 40,
      Foto: "https://s3.amazonaws.com/arc-wordpress-client-uploads/infobae-wp/wp-content/uploads/2017/05/12115047/homero-simpson-1920.jpg",
    });
    //Una vez que modifico la persona la devuelvo al estado incial
    const returnToInitialState = await request(server)
      .put("/persona/modify")
      .send({
        DNI: 1234,
        Nombre: "Homero",
        Apellido: "Simpson",
        Edad: 39,
        Foto: "https://static.wikia.nocookie.net/lossimpson/images/b/bd/Homer_Simpson.png/revision/latest?cb=20100522180809&path-prefix=es",
      });
    expect(res.status).to.equal(201);
  });
});

describe("DELETE /persona/delete-one", () => {
  it("Si intento eliminar una persona sin ingresar su DNI debe devolver un error", async () => {
    const res = await request(server).delete("/persona/delete-one");
    expect(res.status).to.equal(404);
  });
  it("Si intento eliminar una persona ingresando un DNI que no le pertenece a ninguna debe devolver un error", async () => {
    const res = await request(server).delete("/persona/delete-one?DNI=1233");
    expect(res.status).to.equal(404);
  });
  it("Si intento eliminar una persona ingresando un DNI y la persona existe debería devolver un status OK", async () => {
    const persona = new Persona({
      DNI: 123,
      Nombre: "Abraham",
      Apellido: "Simpson",
      Edad: 86,
      Foto: "https://static.wikia.nocookie.net/lossimpson/images/a/a9/Abraham_Simpson.png/revision/latest/scale-to-width-down/278?cb=20150426055530&path-prefix=es",
      Direccion: {
        Calle: "Siempre viva",
        Altura: 742,
        Ciudad: "Springfield",
      },
    });
    await persona.save();
    const res = await request(server).delete("/persona/delete-one?DNI=123");
    expect(res.status).to.equal(201);
  });
});
