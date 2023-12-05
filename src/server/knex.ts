import { type Knex, knex } from "knex";

const configRainData: Knex.Config = {
  client: "mssql",
  connection: {
    server: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: "RainData",
    options: {
      instanceName: "SQL19",
    },
  },
};

export const rainDataDB = knex(configRainData);
