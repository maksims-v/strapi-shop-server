const { parse } = require("pg-connection-string");

module.exports = ({ env }) => {
  const { host, port, database, user, password, ssl } = parse(
    env("DATABASE_URL")
  );
  return {
    connection: {
      client: "postgres",
      connection: {
        host,
        port,
        database,
        user,
        password,
        ssl: {
          rejectUnauthorized: false, // или true, в зависимости от требований
        },
      },
      debug: false,
    },
  };
};
