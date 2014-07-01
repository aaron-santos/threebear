Threebear
=========

Some kind of terraforming game

# Prerequisites

Install and run Postgresql 9.3.

Install Postgresql developerment packages.

`sudo apt-get install postgresql-server-dev-9.3`

You might need to configure a postgres user.

See https://help.ubuntu.com/community/PostgreSQL#Basic_Server_Setup

If you want to use foreman, have heroku tools installed or follow the guide at

https://devcenter.heroku.com/articles/getting-started-with-nodejs

Create a Google Developer project so that you can use the HTML sign-in button.

Follow the steps here

https://developers.google.com/+/web/signin/add-button#add_the_html_sign-in_button

# Running
Clone the repo into `.`

`cd threebear`

Create a threebear database.

`sudo -u postgres createdb threebear`

Import the schema.

`sudo -u postgres psql -d threebear < db/schema.sql`

Setup your environment to to indicate the location of the database.
Edit YOURUSER:YOURPASSWORD to match those that you configured earlier.

`export DATABASE_URL=postgres://YOURUSER:YOURPASSWORD@localhost/threebear`

Export your Google Developer project information

`export CLIENT_ID=...`

Start the application

`node src/web.js`

Or use Heroku's foreman to start it

`foreman start`

