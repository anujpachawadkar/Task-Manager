const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'anujpachawadkar123@gmail.com',
        subject: 'Welcome to the Task App!',
        text: `Welcome ${name} to the Task App. Let me know about your journey with us!`
    });
}

const accountClosingEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'anujpachawadkar123@gmail.com',
        subject: 'Account Closure',
        text: `Hi ${name}, It was wonderful to have you as our customer. Please let us know what could we have done to keep you onboarded.`
    })
}


module.exports = {
    sendWelcomeEmail,
    accountClosingEmail
}