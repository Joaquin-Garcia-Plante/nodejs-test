const router = require("express").Router();
const persona = require("./persona.router");

router.use("/persona", persona);
router.get("/", (req, res) => {
  return res.status(200).send("¡Hola Nexo!");
});

module.exports = router;
