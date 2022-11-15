const router = require("express").Router();
const personaCTRL = require("../controllers/persona.controller");

router.get("/csv", personaCTRL.getCSV);
router.post("/alta", personaCTRL.alta);
router.get("/list", personaCTRL.getList);
router.put("/modify", personaCTRL.modifyPerson);
router.get("/find-by-id", personaCTRL.getPersonByID);
router.delete("/delete-one", personaCTRL.deletePerson);
router.get("/filtered-list", personaCTRL.getFilterList);

module.exports = router;
