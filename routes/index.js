const router = require("express").Router();
const persona = require("./persona.router");

router.use("/persona", persona);

module.exports = router;
