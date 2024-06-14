import User from "./models/userModel";
import cron from "node-cron";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "dancohmmojah@gmail.com",
    pass: "your-email-password", // Ensure you use environment variables for sensitive data
  },
});

const sendCompletionEmail = (email) => {
  const mailOptions = {
    from: "dancohmmojah@gmail.com",
    to: email,
    subject: "Attachment Period Completed",
    text: "You have completed your attachment period. Thank you!",
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};

// Schedule a cron job to run every day and check for completed attachments
cron.schedule("0 0 * * *", async () => {
  // Runs every day at midnight
  const today = new Date().toISOString().split("T")[0];

  try {
    // Find all attaches whose endDate is today or earlier
    const users = await User.find({ endDate: { $lte: today } });

    users.forEach((user) => {
      sendCompletionEmail(user.email);
    });
    console.log(
      `Cron job executed successfully. Processed ${users.length} users.`
    );
  } catch (error) {
    console.error("Error fetching users:", error);
  }
});
