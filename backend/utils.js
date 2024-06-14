import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

export const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      course: user.course,
      regNo: user.regNo,
      department: user.department,
      isAdmin: user.isAdmin,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );
};

export const isAuth = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.slice(7); // Remove 'Bearer ' prefix
    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        res.status(401).send({ message: "Invalid Token" });
      } else {
        req.user = decode;
        next();
      }
    });
  } else {
    res.status(401).send({ message: "No Token" });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next(); // User is admin, continue to next middleware
  } else {
    res.status(403).send({ message: "Unauthorized" }); // User is not an admin
  }
};

// Generate a random OTP of specified length
const generateOTP = (length = 6) => {
  const digits = "0123456789";
  let otp = "";

  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }

  return otp;
};

export { generateOTP };

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Set to true if using a secure connection (e.g., TLS)
  auth: {
    user: "dancohmmojah@gmail.com",
    pass: "zezlcktljxcxhdwo",
  },
  tls: {
    rejectUnauthorized: false, // Add this to ignore certificate errors
  },
});

// Send OTP to the user's email
const sendOTP = async (email, otp) => {
  try {
    const mailOptions = {
      from: "dancohmmojah@gmail.com",
      to: email,
      subject: "OTP Verification",
      text: `Your OTP for verification is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);
    console.log("OTP sent successfully");
  } catch (error) {
    console.error("Error sending OTP:", error);
  }
};

export { sendOTP };
