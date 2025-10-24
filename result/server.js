const express = require('express'),
      async = require('async'),
      { Pool } = require('pg'),
      { parse } = require('pg-connection-string');
      path = require('path'),
      cookieParser = require('cookie-parser'),
      methodOverride = require('method-override'),
      lo = require('lodash'),
      { URL } = require('url'),
      { connect, JSONCodec } = require("nats");

// Define application
const app = express()
const server = require('http').createServer(app)

// Configure websocket (through socket.io usage)
const io = require('socket.io')(server, {
  transports: ['polling']
});

// Define application middlewares 
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  next();
});

server.listen(process.env.PORT || 5000, function () {
  var port = server.address().port;
  console.log('app running on port ' + port);
});

// Handle websocket client connections
io.sockets.on('connection', function (socket) {
  console.log("new socket.io connection")
  socket.emit('message', { text: 'Welcome!' });
  socket.on('subscribe', function (data) {
    socket.join(data.channel);
  });
});

// Helper function

function parseNatsUrl(natsUrl) {
  const url = new URL(natsUrl);
  
  const options = {
    servers: [`${url.protocol}//${url.host}`],
    user: url.username,
    pass: url.password
  };

  return options;
}

///// NATS related functions /////

const start = async function () {
  // Build options based on NATS_URL env var
  const options = parseNatsUrl(process.env.NATS_URL || "nats://nats:4222");

  // Connect to NATS
  const nc = await connect(options);

  // Init scores
  const votes = {};

  // create a codec
  const jc = JSONCodec();
  const sub = nc.subscribe("vote");
  (async () => {
    for await (const m of sub) {
      console.log(`[${sub.getProcessed()}]: ${jc.decode(m.data)}`);
      // Get data
      const data = jc.decode(m.data);
      const d = JSON.parse(data);

      // Make sure required params are provided
      if (d.vote === undefined || d.voter_id === undefined) {
        console.log("missing params");
      } else {
        // Add or modify vote with given voter_id
        votes[d.voter_id] = d.vote;

        // Send to client
        summary = lo.countBy(lo.values(votes));
        io.sockets.emit("scores", JSON.stringify(summary));
      }
    }
  })();
}

////// db related functions /////

// Retrieve votes every second and send update to socket.io clients
function getVotes(client) {
  client.query('SELECT vote, COUNT(id) AS count FROM votes GROUP BY vote', [], function (err, result) {
    if (err) {
      console.error("Error performing query: " + err);
    } else {
      var votes = collectVotesFromResult(result);
      io.sockets.emit("scores", JSON.stringify(votes));
    }

    setTimeout(function () { getVotes(client) }, 2000);
  });
}

// Change result format
function collectVotesFromResult(result) {
  var votes = { a: 0, b: 0 };

  result.rows.forEach(function (row) {
    votes[row.vote] = parseInt(row.count);
  });

  return votes;
}

// Use provided backend (among 'db' or 'nats')
// Note: default to 'db' backend
const backend = process.env.BACKEND || 'db';
console.error(`backend is ${backend}`);

if(backend === 'nats'){
  start();
} else if(backend === 'db'){
  // Handle Postgres connection using POSTGRES_URL if provided
  let connectionString = ""
  if (process.env.POSTGRES_URL){
    connectionString = process.env.POSTGRES_URL 
  } else {
    var PG_USER = process.env.POSTGRES_USER || 'postgres'
    var PG_PASSWORD = process.env.POSTGRES_PASSWORD || 'postgres'
    var PG_DATABASE = process.env.POSTGRES_DATABASE || 'postgres'
    connectionString= `postgres://${PG_USER}:${PG_PASSWORD}@db/${PG_DATABASE}`
  }

  // Parse connection string so "rejectUnauthorized: false" is taken into account
  const connectionConfig = parse(connectionString);

  // Do not verify db certificate (it's bad but it's just temporary)
  if(connectionConfig.sslmode && connectionConfig.sslmode == "require") {
    connectionConfig.ssl = {
      rejectUnauthorized: false
    };
  }

  const pool = new Pool(connectionConfig);

  // Connect to Postgres once its ready
  console.log(`connecting to db with connection string ${connectionString}`)
  console.log("connecting to db with connection config");
  console.log(connectionConfig)

  async.retry(
    { times: 1000, interval: 2000 },
    function (callback) {
      pool.connect(function (err, client, done) {
        if (err) {
          //console.log(err);
          console.error(`error connecting to db ${err}`);
        }
        callback(err, client);
      });
    },
    function (err, client) {
      if (err) {
        return console.error("Giving up");
      }
      console.log("Connected to db");
      getVotes(client);
    }
  );
} else {
  console.error("incorrect backend specified (must be db or nats)");
}


