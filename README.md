About
-----

It is simple mailer for compoundjs.org project.
It based on [nademailer](https://github.com/andris9/Nodemailer) and [swig-email-templates](https://github.com/superjoe30/swig-email-templates) npms.

Installation
------------

Put the following dependence to your package.json file

    "railway-mailer":     "git://github.com/bioform/railway-mailer.git"
    
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

    mailer = require( 'railway-mailer' );

    mailer.sendEmail( 'relative_path/templatename', {name: 'my var for template context'},
        {subject: 'Email subject', email: 'recipient@example.com', from: 'me@home'}


The following variables will be available in the email template context:

 - url - from your config file
 - pathTo - compoundjs helper to use named routes

Besides, default value for "from" option can be configured via "mailer.yml" file too.


License
-------

MIT

Contribution
------------

Contributors are welcome
