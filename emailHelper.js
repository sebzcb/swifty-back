const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();
const userGmail = process.env.USER_GMAIL;
const passAppGmail = process.env.PASS_APP_GMAIL;

const emailHelper = async (to, subject, text) => {
  console.log("user gmail:", userGmail);
  console.log("pass app gmail:", passAppGmail);
  // Create a transporter
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: userGmail,
      pass: passAppGmail,
    },
  });

  // Set up email options
  let mailOptions = {
    from: userGmail,
    to: to,
    subject: subject,
    text: text,
  };

  // Send the email
  try {
    let info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = emailHelper;