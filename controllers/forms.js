const User = require("../model/user");

exports.createSwot = async (req, res) => {
  try {
    const {formdata, user} = req.body;
    console.log(formdata, user)
    if (!(formdata && user)) {
      const error = new Error("please provide details");
      throw error;
    }
    await User.findByIdAndUpdate(user, {
      $push: {
        swot: {
          village: formdata.village,
          strengths: formdata.strengths,
          weaknesses: formdata.weaknesses,
          opportunities: formdata.opportunities,
          threats: formdata.threats,
          date: Date.now(),
        },
      },
    });
    res.status(200).json({message : 'form submitted successfully'})
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error });
  }
};

exports.createInfluencer = async (req, res) => {
  try {
    const {formdata, user} = req.body;
    console.log(formdata, user)
    if (!(formdata && user)) {
      const error = new Error("please provide details");
      throw error;
    }
    await User.findByIdAndUpdate(user, {
      $push: {
        influencers: {
          name: formdata.name,
          phone: formdata.phone,
          occupation: formdata.occupation,
          district: formdata.district,
          mandal: formdata.mandal,
          village: formdata.village,
          date: Date.now(),
        },
      },
    });
    res.status(200).json({message : 'form submitted successfully'})
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error });
  }
};
