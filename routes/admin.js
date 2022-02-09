const express = require("express");
const router = express.Router();

const Auth = require("../Authentication/is-auth");
const {
  adminSignup,
  adminLogin,
  getAllUsers,
  pushMeeting,
  getPlatiniumUsers,
  neutralInfluencersCount,
  swotInfluencers,
  usersTrend,
} = require("../controllers/admin");

router.post("/admin/signup", adminSignup);
router.post("/admin/login", adminLogin);
router.get("/admin/getAllUsers", Auth.authentication, getAllUsers);
router.post("/admin/pushMeeting", Auth.authentication, pushMeeting);
router.get("/admin/getPlautiniumUsers", getPlatiniumUsers);
router.get("/admin/getNeutralInfluencers", neutralInfluencersCount);
router.get("/admin/getSwotAnalysis", swotInfluencers);
router.get("/admin/userstrend", usersTrend);

module.exports = router;
