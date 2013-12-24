var nodemailer = require('nodemailer'),
    fs   = require('fs'),
    path = require('path'),
    util = require('util'),
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
            this.transport = nodemailer.createTransport("SMTP", settings);
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
    var transport = this.transport;
    options = util._extend(settings, options);
    data = data || {};
    //data.url = settings.url;
    data.pathTo = data.path_to = compound.map.pathTo;

    var log = compound.logger;
    emailTemplates(templateOptions, function(err, render, generateDummy) {
        render(template + '.html', data, function(err, html) {
            // send html email
            if ( err ) {
                log.write('Email template error: ' + err);
            } else {
                options.html = html;
                transport.sendMail(options, function (err, success) {
                    if(callback){
                        callback(err, success);
                    } else if (success) {
                        log.write('=== Email was sent to: ' + options.to);
                    } else {
                        log.write('Nodemailer error: ' + err);
                    }
                });
            };
        });
    });
};
