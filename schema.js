var pg = require('pg').native
  , connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/rexdev'
  , client
  , query;

client = new pg.Client(connectionString);
client.connect();
query = client.query('CREATE TABLE rates (id varchar(10), currency char(3), buy real, sell real, date timestamp)');
query.on('end', function() { client.end(); });