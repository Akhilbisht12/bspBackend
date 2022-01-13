const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
  },
  gender : String,
  residence : String,
  community : String,
  education : String,
  occupation : String,
  district : String,
  mandal : String,
  village : String,
  pconst : String,
  aconst : String,
  isverified: {
    type: Boolean,
    required: true,
  },
  resetVerified: {
    type: Boolean,
    required: false,
  },

  courses: [
    {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Course",
    },
  ],

  preferences: [{ type: String }],

  Bookmark: [
    {
      type: Schema.Types.ObjectId,
      required: false,
      ref: "Course",
    },
  ],

  swot: [
    {
      village: String,
      strengths: String,
      weaknesses: String,
      opportunities: String,
      threats: String,
      date: Date,
    },
  ],
  influencers: [
    {
      name: String,
      phone: Number,
      occupation: String,
      district: String,
      mandal: String,
      village: String,
    },
  ],
  //Token:String,
  //resetToken:String,
  //resetTokenExpiration:Date,
});

module.exports = mongoose.model("User", userSchema);
