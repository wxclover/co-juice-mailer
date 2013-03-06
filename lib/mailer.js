var nodemailer = require('nodemailer'),
    ejs  = require('./ejs'),
    fs   = require('fs'),
    path = require('path'),
    emailTemplates = require('swig-email-templates'),
    
    compound = null;

exports.sendEmail = sendEmail;
exports.init = initMailer;

function initMailer (cp) {
    compound = cp;
    var app = compound.app;
    try {
        var settings = require('yaml').eval(require('fs').readFileSync(app.root + '/config/mailer.yml').toString('utf8'))[app.settings.env];
    } catch (e) {
        console.log('Could not init mailer extension, env-specific settings not found in config/mailer.yml');
        console.log('Error:', e.message);
        return;
    }
    if (!settings) {
        return;
    }
    exports.settings = settings;

    switch (settings.mailer) {
    case 'sendmail':
        nodemailer.sendmail = true;
        break;
    case 'smtp':
        nodemailer.SMTP = {
            host: settings.host || "localhost",
            port: settings.port || 25,
            use_authentication: settings.use_authentication || false,
            user: settings.user || '',
            pass: settings.pass || ''
        };
        break;
    }
}

function sendEmail (template, data, options) {
    options = options || {};
    data = data || {};
    data.url = exports.settings.url;
    data.pathTo = data.path_to = compound.map.pathTo;
    
    var templateOptions = {
        root: path.join(compound.app.root, "app", "views"),
        // any other swig options allowed here
    };
    var log = compound.logger;
    
    emailTemplates(templateOptions, function(err, render, generateDummy) {
        render(getTemplate(template, options.locale), data, function(err, html) {
            // send html email
            if ( err ) {
                log.write('Email template error: ' + err);
            } else {
                nodemailer.send_mail({
                    sender:  options.from || exports.settings.from,
                    to:      options.email,
                    subject: options.subject,
                    html:    html
                }, function (err, success) {
                    if (success) {
                        log.write('=== Email sent (to: %s)', options.email);
                    } else {
                        log.write('Nodemailer error: ' + err);
                    }
                });
            };
        });
    });
};

function getTemplate (template, locale) {
    var fullName = [template, locale].join('.'), // register.jp.html
        defaultLocale = [template, 'en'].join('.');
    // TODO add locale support
    return template;
}
