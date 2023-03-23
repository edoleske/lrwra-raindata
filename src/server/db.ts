import * as adodb from "node-adodb";
import { env } from "~/env.mjs";

/*
 * If this connection fails, ensure there is a .env file in the root directory with the following variables:
 *   IHIST_DB_USER
 *   IHIST_DB_PASSWORD
 *   IHIST_DB_SOURCE
 */
const connectionString = `Provider=IhOLEDB.iHistorian.1;User ID=${env.IHIST_DB_USER};Password=${env.IHIST_DB_PASSWORD};Persist Security Info=false;Data Source=${env.IHIST_DB_SOURCE};Mode=Read`;

export const connection = adodb.open(connectionString);
