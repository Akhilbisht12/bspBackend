const Admin = require("../model/admin");
const User = require("../model/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const api_key = require("../config/config");
const Courses = require("../model/courses");
const moment = require("moment");

exports.adminSignup = async (req, res) => {
  try {
    const { uid, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);
    const admin = new Admin({
      uid: uid,
      password: hashedPassword,
    });
    await admin.save();
    console.log("details saved in the database");
    res.status(200).json({
      message: "Registered successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "something went wrong", error });
  }
};

exports.adminLogin = async (req, res, next) => {
  try {
    const { uid, password } = req.body;
    const admin = await Admin.findOne({ uid: uid });
    if (!admin) {
      throw new Error("no user found");
    }
    console.log(admin);
    const check = await bcrypt.compare(password, admin.password);
    if (check) {
      const access_token = await jwt.sign({ uid: uid }, api_key.accessToken, {
        algorithm: "HS256",
        expiresIn: api_key.accessTokenLife,
      });

      const referesh_token = await jwt.sign(
        { uid: uid },
        api_key.refereshToken,
        {
          algorithm: "HS256",
          expiresIn: api_key.refereshTokenLife,
        }
      );

      res.status(201).json({
        message: "Admin logged in!",
        access_token: access_token,
        referesh_token: referesh_token,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "something went wrong", error });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    if (!users) {
      throw new Error("no users found");
    }
    res.status(200).json({ users });
  } catch (error) {
    console.loge(error);
    res.status(400).json({ error });
  }
};

exports.pushMeeting = async (req, res) => {
  try {
    const { users, meeting } = req.body;
    const meetingUpdate = await User.updateMany(
      { _id: { $in: users } },
      { $push: { meetings: meeting } },
      { multi: true }
    );
    res.status(200).json({ message: "meeting links sent" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "server error", error });
  }
};

exports.getPlatiniumUsers = async (req, res) => {
  try {
    const users = await User.find({});
    if (!users) throw new Error("Failed to get users from db");
    let platusers = [];
    const courses = await Courses.find({});
    users.map((user) => {
      let count = 0;
      courses.map((course) => {
        let check = false;
        for (let index = 0; index < course.videoContent.length; index++) {
          let video = course.videoContent[index];
          if (!video.usersWatched.includes(user._id)) {
            check = false;
            break;
          } else {
            check = true;
          }
        }
        check ? count++ : count;
      });
      count === courses.length ? platusers.push(user) : null;
    });
    res.status(200).json({ platusers, message: "Platinium users" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "failed to get platinium users", error });
  }
};

exports.neutralInfluencersCount = async (req, res) => {
  try {
    const users = await User.find({});
    let neutral = [];
    users.map((user) => {
      if (user.influencers.length !== 0) neutral.push(user);
    });
    res.status(200).json({ message: "Neutral Influencers", neutral });
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .json({ message: "failed to fetch neutral influencers", error });
  }
};

exports.swotInfluencers = async (req, res) => {
  try {
    const users = await User.find({});
    let swot = [];
    users.map((user) => {
      if (user.swot.length !== 0) swot.push(user);
    });
    res.status(200).json({ message: "Swot Analysis", swot });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "failed to fetch swot analysis" });
  }
};

exports.usersTrend = async (req, res) => {
  try {
    const trendData = [
      { count: 0 },
      { count: 0 },
      { count: 0 },
      { count: 0 },
      { count: 0 },
      { count: 0 },
      { count: 0 },
      { count: 0 },
      { count: 0 },
      { count: 0 },
      { count: 0 },
      { count: 0 },
    ];
    const trend = await User.find({});
    trend.map((user) => {
      const month = moment(user.createdAt).format("MM");
      const year = moment(user.createdAt).format("YY");
      if (year === "22") {
        console.log(month, month - 1);
        trendData[month - 1].count++;
      }
    });
    res.status(200).json({ message: "users trend", trendData });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "failed to get users trend data", error });
  }
};
