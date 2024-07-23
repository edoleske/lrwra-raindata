import * as adodb from "node-adodb";
import * as mssql from "mssql/msnodesqlv8";
import { env } from "~/env.mjs";

/*
 * If this connection fails, ensure there is a .env file in the root directory with the following variables:
 *   IHIST_DB_USER
 *   IHIST_DB_PASSWORD
 *   IHIST_DB_SOURCE
 */
export const iHistorianDb = adodb.open(
	`Provider=IhOLEDB.iHistorian.1;User ID=${env.IHIST_DB_USER};Password=${env.IHIST_DB_PASSWORD};Persist Security Info=false;Data Source=${env.IHIST_DB_SOURCE};Mode=Read`,
);

const sqlConnectionPool = new mssql.ConnectionPool({
	server: env.DB_HOST,
	database: "RainData",
	options: {
		instanceName: "SQL19",
		trustedConnection: true,
		trustServerCertificate: true,
		useUTC: false,
	},
	driver: "msnodesqlv8",
});

export const rainDataDb = await sqlConnectionPool.connect();
