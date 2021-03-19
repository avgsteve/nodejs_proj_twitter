
const nodemailer = require('nodemailer'); //ref:  https://nodemailer.com/usage/
const pug = require('pug');
const htmlToText = require('html-to-text');
const path = require('path');
let sgTransport = require('nodemailer-sendgrid-transport');


module.exports = class MailSender {

  constructor(userData, urlInEmail) {

    let sender_dev = 'steve.leng.dev@gmail.com';
    let send_production = 'steve.leng@gmail.com';

    this.to = userData.email;
    this.firstName = userData.firstName;
    this.url = urlInEmail;
    this.hostName = urlInEmail.split('/')[2];

    this.from = `'Steve Leng' <${process.env.NODE_ENV.toString().trim() === 'development' ? sender_dev : send_production}>`;
    this.mode = 'development';

    console.log(`
    New instance of EmailWithNodeMailer has been created!.
    Current instance:`, this);
    console.log(`
    Current hostName is:`, this.hostName);

  }

  createNewTransporter() {

    if (this.mode.match(/development/g)) {
      console.log('\nUsing sendGrid to send mail to user now...');
      let options = {
        auth: {
          api_key: process.env.EMAIL_SendGrid_Api
        }
      };

      return nodemailer.createTransport(sgTransport(options));
    }

    // if NOT in production environment, 
    // use setup for using mailtrap smtp service(at localhost as http://127.0.0.1:3000/  )
    console.log('Using mailtrap to send mail to user now...');

    return nodemailer.createTransport({
      host: process.env.EMAIL_MailTrap_Host,
      port: process.env.EMAIL_MailTrap_Port,
      auth: {
        //https://mailtrap.io/inboxes/1039612/settings for settings
        user: process.env.EMAIL_MailTrap_userName,
        pass: process.env.EMAIL_MailTrap_password,
      }

      /* 
      1)
      Note: Check mail on mailtrap@ https://mailtrap.io/inboxes/955214/messages
      Setting:  https://mailtrap.io/inboxes/1039612/settings
      To change set up for mailtrap, go to .env

      2)
      ref: https://nodemailer.com/smtp/#1-single-connection
      */
    });
  }


  // Send the actual mail in HTML format with 'pug'
  async send(pugTemplate, emailSubject, accountActivationCode) {

    console.log(`\nSending mail with NodeMailer now...`);

    // 1) Render HTML based on a pug template received as parameter "pugTemplate". Will be used in mail_OptionsAndContent obj as the argument in sendMail() method)

    // path.join(__dirname, `/views/email/${pugTemplate}.pug`);
    // const pugFilePath = `${__dirname}/views/email/${pugTemplate}.pug`;
    const pugFilePath = path.join(__dirname, `./../../views/email/${pugTemplate}.pug`);

    console.log('path and file for pug: ', pugFilePath);

    const htmlByPug = pug.renderFile(
      // => ref:  https://pugjs./api/reference.html#pugrenderfilepath-optioorgns-callback

      //first argument: The path to the Pug file to render
      pugFilePath,

      //Second argument: An options object, also used as the locals object (the variable can be accessed by pug template)
      {
        firstName: this.firstName,
        url: this.url,
        subject: emailSubject,
        activationCode: accountActivationCode || '', // Optional. For activation email only
        hostName: this.hostName
      },
      //third arguments: (optional) callback function
    );

    if (htmlByPug)
      console.log('Html content from Pug has been rendered for sending email');


    // 2) Define email content (for the sendMail() method below)
    const mail_OptionsAndContent = {
      // ref:  https://nodemailer.com/message/#common-fields

      //key and value as properties (mail options)
      from: this.from, //'Steve Leng <steve.leng@test.com>',
      to: this.to,
      subject: emailSubject,
      html: htmlByPug, // when reading email in HTML format
      text: htmlToText.fromString(htmlByPug), // Use "htmlToText" from package "html-to-text" to convert html file to text for reading email in pure text format.

      // ref:  https://nodemailer.com/message/#common-fields
    };

    // 3) Note:
    /* this.send() will call this.createNewTransporter() to get returned Object as "transporter"
      (which is nodemailer obj with SMTP set up) and then the object's method .sendMail() with argument ojb "mail_OptionsAndContent" to send out email
     */
    await this.createNewTransporter().sendMail(mail_OptionsAndContent);
    //which is actually like this : transporter.sendMail(obj with properties for email)
    //ref: https://nodemailer.com/about/#example

  }


  async sendPasswordResetRequest() {
    await this.send(
      'passwordReset', // argument#1:  views/email/passwordReset.pug
      'Your password reset token (valid for only 10 minutes)' // argument#2:  string as email subject
    );
  }

  async sendAccountActivation(activationCode) {
    await this.send(
      'accountActivation', // argument#1:  views/email/passwordReset.pug
      'Your account activation code (valid for only 30 minutes)', // argument#2:  string as email subject
      activationCode
    );
  }

};