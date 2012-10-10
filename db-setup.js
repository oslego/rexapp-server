var pg = require('pg').native,
    connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/rexdev',
    client,
    query;

client = new pg.Client(connectionString);
client.connect();
query = client.query('CREATE TABLE rates (updated_on date, data text)');
query.on('end', function() { client.end(); });