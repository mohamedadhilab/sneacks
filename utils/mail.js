const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendOtpMail = async (email, otp) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Sneacks OTP Verification",
      html: `
        <h2>Your OTP is: ${otp}</h2>
        <p>This OTP will expire in 5 minutes.</p>
      `
    });

    console.log("MAIL SENT:", info.response);

  } catch (err) {
    console.error("MAIL ERROR:", err);
  }
};

module.exports = sendOtpMail;