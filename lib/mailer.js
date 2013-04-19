var nodemailer = require('nodemailer'),
    fs   = require('fs'),
    path = require('path'),
    emailTemplates = require('swig-email-templates'),
    templateOptions = null;

exports.init = function initMailer(compound) {

    templateOptions = {
        root: path.join(compound.app.root, "app", "views"),
        // any other swig options allowed here
    };
    var customFilter = path.join(compound.app.root, "app", "swig", "filters")
    if( fs.existsSync( customFilter+".js" ) || fs.existsSync( customFilter+".coffee" ) ){
        templateOptions.filters = require(customFilter);
    }

    var mailer = new JuiceMailer(compound);
    compound.controllerExtensions.sendEmail = mailer.send;

    compound.__defineGetter__('mailer', function () {
        return mailer;
    });
};

function JuiceMailer (cp) {
    this.compound = cp;
    var app = this.compound.app;
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
    this.settings = settings;

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
    case 'test':
        nodemailer = nodemailer.createTransport("Stub");
        break;
    }

    this.send = this.send.bind(this);
}

JuiceMailer.prototype.send = function(template, data, options, callback) {
    var compound = this.compound;
    var settings = this.settings;
    options = options || {};
    data = data || {};
    data.url = settings.url;
    data.pathTo = data.path_to = compound.map.pathTo;
    
    var log = compound.logger;
    
    emailTemplates(templateOptions, function(err, render, generateDummy) {
        render(getTemplate(template, options.locale), data, function(err, html) {
            // send html email
            if ( err ) {
                log.write('Email template error: ' + err);
            } else {
                nodemailer.sendMail({
                    sender:  options.from || settings.from,
                    to:      options.email,
                    subject: options.subject,
                    html:    html
                }, function (err, success) {
                    if(callback){
                        callback(err, success);
                    } else if (success) {
                        log.write('=== Email was sent to: ' + options.email);
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
