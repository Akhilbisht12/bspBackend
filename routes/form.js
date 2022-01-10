const express = require("express");
const router = express.Router();
const Auth = require("../Authentication/is-auth");
const { createSwot, createInfluencer } = require("../controllers/forms");

router.post("/swot", Auth.authentication, createSwot);
router.post("/influencer", Auth.authentication, createInfluencer);
module.exports = router