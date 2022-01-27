const express = require("express");
const router = express.Router();

const Auth = require("../Authentication/is-auth");
const {
  adminSignup,
  adminLogin,
  getAllUsers,
  pushMeeting,
} = require("../controllers/admin");

router.post("/admin/signup", adminSignup);
router.post("/admin/login", adminLogin);
router.get("/admin/getAllUsers", Auth.authentication, getAllUsers);
router.post("/admin/pushMeeting", Auth.authentication, pushMeeting);

module.exports = router;
