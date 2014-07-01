threebear
=========

Some kind of terraforming game

# Prerequisites

Install and run Postgresql 9.3.

Install Postgresql developerment packages

`sudo apt-get install postgresql-server-dev-9.3`

You might need to configure a postgres user

See https://help.ubuntu.com/community/PostgreSQL#Basic_Server_Setup

Have heroku tools installed or follow the guide at

https://devcenter.heroku.com/articles/getting-started-with-nodejs

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

Start the application.

`foreman start`

