const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/user");
const Otp = require("../model/otp");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const { validationResult } = require("express-validator");
const api_key = require("../config/config");
const AWS = require("aws-sdk");
const S3 = require("aws-sdk/clients/s3");
// const transporter =nodemailer.createTransport(sendgridTransport({
//     auth:{
//         api_key:api_key.Sendgrid
//     }
// }))
let transporter = nodemailer.createTransport({
  host: api_key.smtp_host,
  port: api_key.smtp_pass,
  secure: true, // true for 465, false for other ports
  auth: {
    user: api_key.smtp_user, // generated ethereal user
    pass: api_key.smtp_pass, // generated ethereal password
  },
});

const s3 = new S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const OTPHandler = (otp, phone, res, email) => {
  new AWS.SNS({ apiVersion: "2010-03-31" })
    .publish({
      Message: `${otp} is your BSP Learning verification code`,
      PhoneNumber: "+91" + phone,
      MessageAttributes: {
        "AWS.SNS.SMS.SenderID": {
          DataType: "String",
          StringValue: "BSPVERIFY",
        },
      },
    })
    .promise()
    .then((response) => {
      console.log(response);
      res.status(200).json({
        message: "OTP has been sent to your phone",
        redirect: true,
        email: email,
      });
    })
    .catch((error) => {
      const errorotp = new Error(error);
      console.log(error);
      res.status(400).json({
        message: "otp not sent",
      });
      throw errorotp;
    });
};

exports.signupPhone = async (req, res) => {
  try {
    const {
      phone,
      firstName,
      surName,
      email,
      password,
      gender,
      age,
      residence,
      community,
      education,
      occupation,
      district,
      mandal,
      village,
      pconst,
      aconst,
    } = req.body;
    // const confirmPassword=req.body.confirmPassword;
    let otp = null;
    // let tokenGenerated=null;
    console.log(name);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed");
      error.statusCode = 422;
      error.data = errors.array();
      console.log(error, error[0]);
      res.status(422).json({ message: errors.array() });
      throw error;
    }

    const Newuser = new User({
      email: email,
      isverified: false,
      name: firstName + " " + lastName,
      phone: phone,
      resetVerified: false,
    });
    Newuser.save();
    console.log("details saved in the database");

    otp = Math.floor(100000 + Math.random() * 900000);

    const OTP = new Otp({
      otp: otp,
      email: email,
    });

    const otpsave = await OTP.save();
    console.log(otp);
    // const sendOtp = new AWS.SNS({ apiVersion: "2010-03-31" })
    //   .publish({
    //     Message: `${otp} is your BSP Learning verification code`,
    //     PhoneNumber: "+91" + phone,
    //     MessageAttributes: {
    //       "AWS.SNS.SMS.SenderID": {
    //         DataType: "String",
    //         StringValue: "BSPVERIFY",
    //       },
    //     },
    //   })
    //   .promise();
    // sendOtp
    //   .then((response) => {
    //     res.status(201).json({
    //       message: "OTP sent to your Phone",
    //       messageID: response.MessageId,
    //     });
    //   })
    //   .catch((error) => {
    //     const errorotp = new Error(error);
    //     console.log(error);
    //     throw errorotp;
    //   });
  } catch (error) {
    console.log(error);
  }
};

exports.loginPhone = (req, res, next) => {
  try {
    console.log("hit");
    const phone = req.body.phone;
    console.log(phone);
    let otp = null;
    // const errors = validationResult(req);

    // if (!errors.isEmpty()) {
    //   const error = new Error("Validation failed");
    //   error.statusCode = 422;
    //   error.data = errors.array();
    //   console.log(error, error[0]);
    //   res.status(422).json({ message: "User with this email doesnt exists" });
    //   throw error;
    // }

    User.findOne({ phone: phone })
      .then((user) => {
        if (!user) {
          const error = new Error("No User Found");
          return res
            .status(404)
            .json({ message: "no user found, try signing up" });
          throw error;
        }
        console.log(user);
        const { email } = user;
        otp = Math.floor(100000 + Math.random() * 900000);
        console.log("otp =", otp);
        Otp.findOne({ email: email }).then((user) => {
          // if the otp record is deleted
          if (!user) {
            const OTP = new Otp({
              otp: otp,
              email: email,
            });

            OTP.save().then(() => {
              const sendOtp = new AWS.SNS({ apiVersion: "2010-03-31" })
                .publish({
                  Message: `${otp} is your BSP Learning verification code`,
                  PhoneNumber: "+91" + phone,
                  MessageAttributes: {
                    "AWS.SNS.SMS.SenderID": {
                      DataType: "String",
                      StringValue: "BSPVERIFY",
                    },
                  },
                })
                .promise();
              sendOtp
                .then((response) => {
                  return res.status(422).json({
                    message: "OTP has been sent to your phone",
                    redirect: true,
                    email: email,
                  });
                  console.log(response);
                })
                .catch((error) => {
                  const errorotp = new Error(error);
                  console.log(error);
                  throw errorotp;
                });

              console.log("mail sent ", otp);
            });
          } else {
            user.otp = otp;
            user.save().then(() => {
              const sendOtp = new AWS.SNS({ apiVersion: "2010-03-31" })
                .publish({
                  Message: `${otp} is your BSP Learning verification code`,
                  PhoneNumber: "+91" + phone,
                  MessageAttributes: {
                    "AWS.SNS.SMS.SenderID": {
                      DataType: "String",
                      StringValue: "BSPVERIFY",
                    },
                  },
                })
                .promise();
              sendOtp
                .then((response) => {
                  return res.status(422).json({
                    message: "OTP has been sent to your phone",
                    redirect: true,
                    email: email,
                  });
                  console.log(response);
                })
                .catch((error) => {
                  const errorotp = new Error(error);
                  console.log(error);
                  throw errorotp;
                });
            });
          }
        });
      })

      .catch((err) => {
        (err) => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          console.log(err);
          next(err);
        };
      });
  } catch (error) {
    console.log(error);
  }
};

exports.check = async (req, res) => {
  console.log(req.file);
  res.status(200).json({ message: "allgood" });
};

exports.signup = async (req, res) => {
  // const confirmPassword=req.body.confirmPassword;
  console.log(req.file);
  try {
    const {
      phone,
      name,
      email,
      password,
      gender,
      age,
      residence,
      community,
      education,
      occupation,
      district,
      mandal,
      village,
      pconst,
      aconst,
    } = req.body;
    let otp = null;
    // console.log(name, email, password);
    // let tokenGenerated=null;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed");
      error.statusCode = 422;
      error.data = errors.array();
      // console.log(error, error[0]);
      res.status(422).json({ message: errors.array() });
      throw error;
    }
    let url = null;
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `profile-${req.body.email.split("@")[0]}.jpg`,
      Body: req.file.buffer,
    };
    const upload = s3.upload(params).promise();
    upload
      .then(async (data) => {
        url = data.Location;
        const hashedPassword = await bcrypt.hash(password, 12);
        const Newuser = new User({
          email: email,
          password: hashedPassword,
          isverified: false,
          name,
          gender,
          age,
          residence,
          phone,
          community,
          education,
          occupation,
          district,
          mandal,
          village,
          pconst,
          aconst,
          profile: url,
          resetVerified: false,
        });
        await Newuser.save();
        console.log("details saved in the database");
        otp = Math.floor(100000 + Math.random() * 900000);
        const OTP = new Otp({
          otp: otp,
          email: email,
        });

        await OTP.save();
        console.log(otp);
        transporter.sendMail({
          to: email,
          from: "akhil@upgrate.in",
          subject: "OTP Verification",
          html: ` '<h1>Please Verify your account using this OTP: !</h1>
              <p>OTP:${otp}</p>'`,
        });
        res.status(200).json({
          message: "OTP has been sent to your Email",
          redirect: true,
          email: email,
          profile: data.Location,
        });
        console.log("mail sent");
      })
      .catch((error) => {
        throw error;
      });
  } catch (error) {
    console.log(error);
  }
};

exports.otpVerification = (req, res, next) => {
  try {
    const receivedOtp = req.body.otp;
    const email = req.body.email;

    // validation
    console.log(receivedOtp, email);

    Otp.findOne({ email: email })
      .then((user) => {
        if (!user) {
          const error = new Error(
            "Validation failed ,this user does not exist"
          ); // when user not found
          error.statusCode = 403;
          error.data = {
            value: receivedOtp,
            message: "Invalid email",
            param: "otp",
            location: "otpVerification",
          };
          res.status(422).json({ message: error.data });
          throw error;
        }

        if (user.otp != receivedOtp) {
          const error = new Error("Wrong Otp entered");
          error.statusCode = 401;
          res.status(401).json({ message: "wrong otp entered " });
          error.data = {
            value: receivedOtp,
            message: "Otp incorrect",
            param: "otp",
            location: "otp",
          };
          throw error;
        } else {
          //  correct OTP
          User.findOne({ email: email }).then((user) => {
            user.isverified = true;

            const access_token = jwt.sign(
              { email: email, userId: user._id },
              api_key.accessToken,
              {
                algorithm: "HS256",
                expiresIn: api_key.accessTokenLife,
              }
            );
            const referesh_token = jwt.sign(
              { email: email },
              api_key.refereshToken,
              {
                algorithm: "HS256",
                expiresIn: api_key.refereshTokenLife,
              }
            );

            user.save((result) => {
              res.status(200).json({
                message: "otp entered is correct, user successfully added",
                access_token: access_token,
                referesh_token: referesh_token,
                userId: user._id.toString(),
                username: user.name,
              });
            });
          });
        }
      })
      .catch((err) => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  } catch (error) {
    console.log(error);
  }
};

// to re send the otp to user
exports.resendOtp = (req, res, next) => {
  try {
    const email = req.body.email;
    const received_otp = req.body.otp;
    const phone = req.body.phone;
    console.log(phone);
    let otp = null;

    Otp.findOne({ email: email })
      .then((user) => {
        if (!user) {
          const error = new Error("Email doesnt exist"); // when token not found
          error.statusCode = 401;
          error.data = {
            value: received_otp,
            message: "Invalid email",
            param: "otp",
            location: "otpVerification",
          };
          res.status(401).json({ message: "Email doesn't exist" });
          throw error;
        }
        otp = Math.floor(100000 + Math.random() * 900000);

        user.otp = otp;
        user.save();
        console.log(otp);
        // res.status(201).json({ message: "OTP sent to your Email" });
      })
      .then(() => {
        transporter.sendMail({
          to: email,
          from: "akhil@upgrate.in",
          subject: "OTP Verification",
          html: ` '<h1>Please Verify your account using this OTP: !</h1>
                  <p>OTP:${otp}</p>'`,
        });
        res.status(200).json({
          message: "OTP has been sent to your Email",
          redirect: true,
          email: email,
        });
        console.log("mail sent");
      })

      .catch((err) => {
        (err) => {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        };
      });
  } catch (error) {
    console.log(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    // const email = req.body.email;
    const { identity, password, type } = req.body;
    // const password = req.body.password;
    // console.log(email, password);
    const errors = validationResult(req);
    let otp = null;
    // if (!errors.isEmpty()) {
    //   const error = new Error("Validation failed");
    //   error.statusCode = 422;
    //   error.data = errors.array();
    //   console.log(error, error[0]);
    //   res.status(422).json({ message: "User with this email doesnt exists" });
    //   throw error;
    // }
    console.log(identity, password, type);
    const founduser =
      (await type) === "email"
        ? User.findOne({ email: identity })
        : User.findOne({ phone: identity });
    // User.findOne({ email: email }).then((user) => {
    console.log(founduser);
    const { email, phone } = founduser
      ? founduser
      : res.status(400).json({ message: "No user found" });
    founduser.then((user) => {
      console.log(user);
      if (!user) {
        return res.status(400).json({ message: "No user found" });
      } else if (user.isverified == false) {
        console.log("user isn't verified");
        otp = Math.floor(100000 + Math.random() * 900000);
        console.log("otp =", otp);
        Otp.findOne({ email: email }).then((user) => {
          // if the otp record is deleted
          if (!user) {
            const OTP = new Otp({
              otp: otp,
              email: email,
            });

            OTP.save().then(() => {
              transporter.sendMail({
                to: email,
                from: "akhil@upgrate.in",
                subject: "OTP Verification",
                html: ` '<h1>Please Verify your account using this OTP: !</h1>
                        <p>OTP:${otp}</p>'`,
              });
              res.status(200).json({
                message: "OTP has been sent to your Email",
                redirect: true,
                email: email,
              });
            });
          } else {
            user.otp = otp;
            user.save().then(() => {
              transporter.sendMail({
                to: email,
                from: "akhil@upgrate.in",
                subject: "OTP Verification",
                html: ` '<h1>Please Verify your account using this OTP: !</h1>
                        <p>OTP:${otp}</p>'`,
              });
              res.status(200).json({
                message: "OTP has been sent to your Email",
                redirect: true,
                email: email,
              });
            });
          }
        });
      } else {
        bcrypt
          .compare(password, user.password)
          .then((matchPass) => {
            if (matchPass) {
              const access_token = jwt.sign(
                { email: email },
                api_key.accessToken,
                {
                  algorithm: "HS256",
                  expiresIn: api_key.accessTokenLife,
                }
              );

              const referesh_token = jwt.sign(
                { email: email },
                api_key.refereshToken,
                {
                  algorithm: "HS256",
                  expiresIn: api_key.refereshTokenLife,
                }
              );

              return res.status(201).json({
                message: "User logged in!",
                access_token: access_token,
                referesh_token: referesh_token,
                username: user.name,
                userId: user._id,
                profile: user.profile,
              });
            } else {
              return res.status(400).json({ message: "password don't match" });
            }
          })

          .catch((err) => {
            (err) => {
              if (!err.statusCode) {
                err.statusCode = 500;
              }
              next(err);
            };
          });
      }
    });
  } catch (error) {
    console.log(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  const email = req.body.email;
  console.log(email);
  let otp = Math.floor(100000 + Math.random() * 900000);

  const found = await User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        const error = new Error("Validation Failed");
        error.statusCode = 401;
        error.data = {
          value: email,
          message: " otp is incorrect",
        };
        res.status(422).json({ message: " User doesn't exists" });
        throw error;
      } else {
        const new_otp = new Otp({
          otp: otp,
          email: email,
        });
        new_otp.save();
        transporter.sendMail({
          to: email,
          from: "akhil@upgrate.in",
          subject: "OTP Verification",
          html: ` '<h1>Please Verify your account using this OTP: !</h1>
                  <p>OTP:${otp}</p>'`,
        });
        res.status(200).json({
          message: "OTP has been sent to your Email",
          redirect: true,
          email: email,
        });
      }
    })

    // .then((result) => {
    //   console.log(found)
    //   const { email } = found;
    //   // transporter.sendMail({
    //   //   to: email,
    //   //   from: "akhil@upgrate.in",
    //   //   subject: "Reset Password for shelp",
    //   //   html: ` '<h1>this is your otp to reset your password: ${otp}</h1>'`,
    //   // });
    //   // console.log("mail sent  ", otp);
    //   // res.status(201).json({ message: "otp sent to reset password" });
    // })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.resetOtpVerification = (req, res, next) => {
  const email = req.body.email;
  const otp = req.body.otp;
  console.log("reset::", otp);

  Otp.findOne({ email: email })
    .then((user) => {
      if (!user) {
        const error = new Error("Validation Failed");
        error.statusCode = 401;
        res.status(401).json({ message: "Otp is incorrect" });
        error.data = {
          value: email,
          message: " otp is incorrect",
        };
        res.status(422).json({ message: " otp is incorrect or otp expired!" });
        throw error;
      }

      if (user.otp == otp) {
        User.findOne({ email: email }).then((matched) => {
          matched.resetVerified = true;
          matched.save();
        });
        res
          .status(201)
          .json({ message: "Email verified successfully", email: email });
      } else
        res.status(402).json({ message: "Wrong Otp entered", email: email });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.newPassword = (req, res, next) => {
  const email = req.body.email;
  const newPassword = req.body.newPassword;
  const confirmPassword = req.body.confirmPassword;
  let resetUser;

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        const error = new Error("user with this email doesnt exists");
        error.statusCode = 401;
        res.status(401).json({ message: "user with this email doesnt exists" });
        error.data = {
          value: email,
          message: "user with this email doesnt exists",
        };
        res.status(422).json({
          message: " User doesn't exists",
        });
        throw error;
      }
      if (user.resetVerified) {
        resetUser = user;
        resetUser.resetVerified = false;
        return bcrypt
          .hash(newPassword, 12)
          .then((hashedPassword) => {
            resetUser.password = hashedPassword;
            return resetUser.save();
          })

          .then((result) => {
            console.log("result", result);
            res.status(201).json({ message: "password changed successfully" });
          });
      } // end of if condition
      else {
        console.log("Please,verify your email first");
        res.status(401).json({ message: "Please,verify your email first " });
      }
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getUser = async (req, res, next) => {
  const userId = req.body.userId;
  const user = await User.findById(userId);
  if (!user) {
    res.status(400).json({ message: "user not found" });
  }
  res.status(200).json({ user });
};
