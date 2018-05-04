const Mailgun = require('mailgun-js');
const sendgrid = require('@sendgrid/mail');
const http = require('https');
const querystring = require('querystring');
const config = require('../config');

module.exports = function(app) {

    // Mailgun API key
    const api_key_mailgun = config.api_key_mailgun;

    // Default From email address
    const from_mail = config.from_mail;

    // Sendgrid API key
    const api_key_sendgrid = config.api_key_sendgrid;

    // Domain name for Mailgun
    const domain = config.domain;

    // Get base URL for mailgun from config file
    const mail_gun_url = config.mail_gun_url;

    // Get base URL for sendgrid from config file
    const send_grid_url = config.send_grid_url;

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
            console.log(result);
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
        // Data to pass as the request body.
        const postData = querystring.stringify(data);

        // HTTP options
        const options = {
            hostname: mail_gun_url,
            path: '/v3/' + domain + '/messages',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            },
            auth: 'api:' + api_key_mailgun
        };

        // HTTP request
        const req = http.request(options, (res) => {
            console.log(`STATUS: ${res.statusCode}`);
            res.setEncoding('utf8');
            let body = '';
            // If the response is large, it receives as multiple chunks.
            res.on('data', (chunk) => {
                body += chunk;
            });
            // After receiving all the chunks, invoke success call back or error callback according to the status code.
            res.on('end', () => {
                res.statusCode === 200 ? successcallback(body) : errorcallback(body);
            });
        });

        // Handle request errors.
        req.on('error', (e) => {
            console.error(`problem with request: ${e.message}`);
            errorcallback(e);
        });

        // write data to request body
        req.write(postData);
        req.end(); // End request
    }

    /*
    * Function used to send the email with Sendgrid.
    * Parameters are data(message) object and callback function.
    * */
    function sendWithSendgrid(data, successcallback, errorcallback) {
        // Data to send as request body.
        let postData = {
            personalizations: [
                {
                    to: [
                        {
                            email: data.to
                        }
                    ],
                    subject: data.subject
                }
            ],
            from: {
                email: data.from
            },
            content: [{
                type: 'text/plain',
                value: data.html
            }]
        };
        // Assign CC email addresses if present
        if(data.cc) {
            let splitCc = data.cc.split(',');
            let cc = splitCc.map(obj => {
                var rObj = {};
                rObj['email'] = obj.trim();
                return rObj;
            });
            postData['personalizations'][0]['cc'] = cc;
        }
        // Assign BCC email addresses if present
        if(data.bcc) {
            let splitCc = data.bcc.split(',');
            let bcc = splitCc.map(obj => {
                var rObj = {};
                rObj['email'] = obj;
                return rObj;
            });
            postData['personalizations'][0]['bcc'] = bcc;
        }

        // HTTP options
        const options = {
            hostname: send_grid_url,
            path: '/v3/mail/send',
            port: null,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + api_key_sendgrid
            }
        };

        // Send HTTP request
        const req = http.request(options, (res) => {
            console.log(`STATUS: ${res.statusCode}`);
            res.setEncoding('utf8');
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });

            // After receiving all the chunks, invoke success call back or error callback according to the status code.
            res.on('end', () => {
                res.statusCode <= 202 ? successcallback(body) : errorcallback(body);
            });
        });

        // Handle request errors.
        req.on('error', (e) => {
            console.error(`problem with request: ${e.message}`);
            errorcallback(e);
        });

        // write data to request body
        req.write(JSON.stringify(postData));
        req.end(); // End request
    }

};
