var Mailgun = require('mailgun-js');
var sendgrid = require('@sendgrid/mail');

module.exports = function(app) {

    // Mailgun API key
    var api_key_mailgun = 'MAILGUN_API_KEY';

    // Default From email address
    var from_mail = 'DEFAULT_SENDER_EMAIL';

    // Set Sendgrid API key
    sendgrid.setApiKey('SENDGRID_API_KEY');

    // Domain name for Mailgun
    var domain = 'DOMAIN';

    /*
    * Handle POST '/send' requests from the client.
    * */
    app.post('/send', function(req, res) {
        var data = {
            // Specify from email. If the user specified from email, use it; else use default email.
            from: req.body.fromMail ? req.body.fromMail : from_mail,
            // To email
            to: req.body.tomail,
            // Email Subject
            subject: req.body.subject,
            // Email body
            html: req.body.body
        };
        // Assign CC email addresses if present
        if(req.body.cc) data['cc'] = req.body.cc;
        // Assign CC email addresses if present
        if(req.body.bcc) data['bcc'] = req.body.bcc;

        // First trying to send the mail with mailgun
        sendWithMailgun(data, function(result) {
            console.log('Successfully sent email!!!');
            // Send success message to the client.
            res.status(200).json({email: req.body.tomail});
        }, function (err) {
            console.log('Error occurred ', err);
            // If mailgun fails, then trying to send with sendgrid.
            sendWithSendgrid(data, function(result) {
                console.log('Successfully sent email!');
                // Send success message to the client
                res.status(200).json({email: req.body.tomail});
            }, function (err) {
                console.log('Error occurred while sending email',err);
                // If both services failed, send the error message to the client.
                res.status(500).json(err);
            });
        });
    });

    // Frontend routes
    app.get('*', function(req, res) {
        res.sendfile('./public/views/index.html');
    });

    /*
    * Function used to send the email with Mailgun.
    * Parameters are data(message) object and callback function.
    * */
    function sendWithMailgun(data, successcallback, errorcallback) {
        var mailgun = new Mailgun({apiKey: api_key_mailgun, domain: domain});

        // Send email with Mailgun's messages.send() function
        mailgun.messages().send(data, function (err, body) {
            if (err) {
                errorcallback(err);
            } else {
                successcallback();
            }
        });
    }

    /*
    * Function used to send the email with Sendgrid.
    * Parameters are data(message) object and callback function.
    * */
    function sendWithSendgrid(data, successcallback, errorcallback) {
        // Send email with Sendgrid's send() function
        sendgrid.send(data, (error, result) => {
            if (error) {
                errorcallback(error);
            } else {
                successcallback();
            }
        });
    }

};
