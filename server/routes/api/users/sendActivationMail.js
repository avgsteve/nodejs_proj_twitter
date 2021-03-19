const MailSender = require('./../../../functions/MailSender');
const httpProtocol =
  // process.env.NODE_ENV.toString().trim() === "development"
  process.env.NODE_ENV === "development" ? "http" : "https";

module.exports = function (userDoc, req) {

  if (!userDoc._id) throw Error('Need valid mongoose User document');
  if (!userDoc.activationCode) throw Error('Need to attach activation code to User document');
  if (!req) throw Error('Need valid express request obj');

  const urlForActivation =
    `${httpProtocol}://${req.get("host")}/activateAccount/`;

  // will return a Promise obj
  return new MailSender(userDoc, urlForActivation,)
    .sendAccountActivation(userDoc.activationCode);
};