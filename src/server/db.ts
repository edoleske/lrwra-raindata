import * as adodb from "node-adodb";
import * as mssql from "mssql";
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
	server: env.RAINDATA_DB_HOST,
	database: env.RAINDATA_DB_DATABASE,
	user: env.RAINDATA_DB_USER,
	password: env.RAINDATA_DB_PASS,
	options: {
		instanceName: env.RAINDATA_DB_INSTANCE ?? undefined,
		trustServerCertificate: true,
		useUTC: false,
	},
	driver: "tedious",
});

export const rainDataDb = await sqlConnectionPool.connect();
