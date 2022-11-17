const router = require("express").Router();
const personaCTRL = require("../controllers/persona.controller");
const {
  validateDirection,
  validateDNI,
} = require("../middlewares/modify.route");

router.get("/csv", personaCTRL.getCSV);
router.post("/alta", personaCTRL.alta);
router.get("/list", personaCTRL.getList);
router.put(
  "/modify",
  [validateDNI, validateDirection],
  personaCTRL.modifyPerson
);
router.get("/find-by-id", personaCTRL.getPersonByID);
router.delete("/delete-one", personaCTRL.deletePerson);
router.get("/filtered-list", personaCTRL.getFilterList);

module.exports = router;
