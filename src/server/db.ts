import * as adodb from "node-adodb";
import { env } from "~/env.mjs";

const connectionString = `Provider=IhOLEDB.iHistorian.1;User ID=${env.IHIST_DB_USER};Password=${env.IHIST_DB_PASSWORD};Persist Security Info=false;Data Source=${env.IHIST_DB_SOURCE};Mode=Read`;

export const connection = adodb.open(connectionString);
