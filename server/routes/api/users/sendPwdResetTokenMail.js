const MailSender = require('../../../functions/MailSender');
const httpProtocol =
  // process.env.NODE_ENV.toString().trim() === "development"
  process.env.NODE_ENV === "development" ? "http" : "https";

module.exports = function (resetTokenDoc, req) {

  if (!resetTokenDoc._id) throw Error('Need valid mongoose User document');
  if (!resetTokenDoc.resetToken) throw Error('Need to attach resetToken code to document');
  if (!req) throw Error('Need valid express request obj');

  const urlForToken =
    `${httpProtocol}://${req.get("host")}/resetPassword/`;

  // will return a Promise obj
  return new MailSender(resetTokenDoc, urlForToken,).sendPasswordResetRequest(resetTokenDoc.resetToken);

};