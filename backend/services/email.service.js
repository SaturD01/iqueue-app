/**
 * @file email.service.js
 * @description Nodemailer email service — sends booking confirmation
 *              and It's Your Turn notification emails via Gmail SMTP
 * @author M1 — WDD Wickramaratne (22UG3-0550)
 * @created 2026-04-14
 */

const nodemailer = require('nodemailer');

// Create Gmail SMTP transporter using credentials from .env
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

/**
 * sendBookingConfirmation
 * Sends a booking confirmation email to the customer after
 * they successfully book a queue token.
 *
 * @param {Object} params
 * @param {string} params.to - Customer email address
 * @param {string} params.customerName - Customer full name
 * @param {string} params.tokenNumber - Token number e.g. CF-007
 * @param {string} params.branchName - Branch name
 * @param {string} params.serviceName - Service type
 * @param {string} params.arrivalTime - Arrival time (optional)
 */
const sendBookingConfirmation = async ({
  to,
  customerName,
  tokenNumber,
  branchName,
  serviceName,
  arrivalTime,
}) => {
  try {
    const arrivalMessage = arrivalTime
      ? `Your token is safely held until your arrival time: <strong>${arrivalTime}</strong>. You will not be marked no-show while you are on your way.`
      : `Your token is active and you are in the queue now.`;

    const mailOptions = {
      from: `"iQueue System" <${process.env.GMAIL_USER}>`,
      to,
      subject: 'iQueue — Your token is confirmed',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #002244; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">iQueue</h1>
            <p style="color: #aabbcc; margin: 5px 0;">Smart Bank Queue Management</p>
          </div>
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #002244;">Your token is confirmed!</h2>
            <p>Hi <strong>${customerName}</strong>,</p>
            <p>Your queue token has been successfully booked.</p>
            <div style="background-color: white; border: 1px solid #ddd; 
                        border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p><strong>Token Number:</strong> 
                <span style="font-size: 24px; color: #002244; 
                             font-weight: bold;">${tokenNumber}</span></p>
              <p><strong>Branch:</strong> ${branchName}</p>
              <p><strong>Service:</strong> ${serviceName}</p>
            </div>
            <p>${arrivalMessage}</p>
            <p>Track your live queue position at: 
              <a href="${process.env.FRONTEND_URL}/tracker">
                ${process.env.FRONTEND_URL}/tracker
              </a>
            </p>
          </div>
          <div style="background-color: #002244; padding: 15px; 
                      text-align: center;">
            <p style="color: #aabbcc; margin: 0; font-size: 12px;">
              iQueue — CIT310 Group 19 — SLTC Research University 2026
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Booking confirmation sent to ${to}`);
  } catch (error) {
    console.error(`Failed to send booking confirmation to ${to}:`, error.message);
  }
};

/**
 * sendItsYourTurn
 * Sends an urgent notification email when staff calls the
 * customer's token. Customer has 5 minutes to appear.
 *
 * @param {Object} params
 * @param {string} params.to - Customer email address
 * @param {string} params.customerName - Customer full name
 * @param {string} params.tokenNumber - Token number e.g. CF-007
 */
const sendItsYourTurn = async ({
  to,
  customerName,
  tokenNumber,
}) => {
  try {
    const mailOptions = {
      from: `"iQueue System" <${process.env.GMAIL_USER}>`,
      to,
      subject: 'iQueue — It is your turn now!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #002244; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">iQueue</h1>
          </div>
          <div style="padding: 30px; background-color: #f9f9f9; text-align: center;">
            <h2 style="color: #cc0000;">It is your turn!</h2>
            <p>Hi <strong>${customerName}</strong>,</p>
            <p>Your token has been called. Please go to the counter now.</p>
            <div style="background-color: #002244; border-radius: 8px; 
                        padding: 20px; margin: 20px 0;">
              <p style="color: white; font-size: 48px; 
                         font-weight: bold; margin: 0;">${tokenNumber}</p>
              <p style="color: #aabbcc; margin: 5px 0;">Your token number</p>
            </div>
            <div style="background-color: #fff3cd; border: 1px solid #ffc107;
                        border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="color: #856404; margin: 0;">
                <strong>You have 5 minutes to reach the counter.</strong>
                If you do not appear within 5 minutes, you will be 
                automatically marked as no-show.
              </p>
            </div>
          </div>
          <div style="background-color: #002244; padding: 15px; text-align: center;">
            <p style="color: #aabbcc; margin: 0; font-size: 12px;">
              iQueue — CIT310 Group 19 — SLTC Research University 2026
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Its your turn email sent to ${to}`);
  } catch (error) {
    console.error(`Failed to send its your turn email to ${to}:`, error.message);
  }
};

module.exports = { sendBookingConfirmation, sendItsYourTurn };