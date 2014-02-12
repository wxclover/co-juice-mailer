Change
------
fork [co-juice-mailer](https://github.com/bioform/co-juice-mailer) project.
update nodemailer to latest and modify api call.

About
-----

It is simple mailer for [compound.js](https://github.com/1602/compound) project.
It based on [nodemailer](https://github.com/andris9/Nodemailer) and [swig-email-templates](https://github.com/superjoe30/swig-email-templates) npms.

Features
--------

 * Uses [swig](https://github.com/paularmstrong/swig/), which supports
   [Django-inspired template inheritance](https://docs.djangoproject.com/en/dev/topics/templates/#template-inheritance).
 * Uses [juice](https://github.com/LearnBoost/juice), which takes an HTML
   file and inlines all the `<link rel="stylesheet">`s and the `<style>`s.
 * Uses [swig-dummy-context](https://github.com/superjoe30/swig-dummy-context)
   which gives you the ability to generate dummy context from a template to
   aid in an email preview tool.
 * URL rewrite support - you can provide a `urlRewriteFn` argument to rewrite
   your links.

Installation
------------

Put the following dependence to your package.json file

    "co-juice-mailer":     "latest"

Add this package to "/config/autoload.js" file
    
And run:
    
    npm install -l
    
Place "mailer.yml" to your application "config" folder:

    development:
      mailer: smtp
      url: "http://localhost:8888"
      from: "no-reply@example.com"
      host: "smtp.gmail.com"
      port: 587
      use_authentication: true
      user: "no-reply@example.com"
      pass: "password"
    
    production:
      mailer: smtp
      url: "http://example.com"
      from: "no-reply@example.com"
      host: "smtp.gmail.com"
      port: 587
      use_authentication: true
      user: "no-reply@example.com"
      pass: "password"
    
    test:
      mailer: test
      url: "http://localhost:8888"
      from: "no-reply@example.com"
    


Usage
-----

Put you email views into the `app/views/` directory with following naming style:

    templatename.html

When you want to send email, just call

    callback = function(err, success){
        if( success ){
            console.log('email was sent')
        } else {
            console.log('Error: ' + err)
        }
    };
    compound.mailer.send( 'relative_path/templatename', {name: 'my var for template context'},
        {subject: 'Email subject', email: 'recipient@example.com', from: 'me@home'}, callback)

Controller have `sendEmail` method with the same signature.

The following variables will be available in the email template context:

 - url - from your config file
 - pathTo - compoundjs helper to use named routes

Besides, default value for "from" option can be configured via "mailer.yml" file too.

Swig filters
------------

If you want to use your own swig filters - put it to "/app/swig/filters.js" file (or "/app/swig/filters.coffee")

See [Swig Variable Filters](http://paularmstrong.github.io/swig/docs/#filters)

License
-------

MIT

Contribution
------------

Contributors are welcome
