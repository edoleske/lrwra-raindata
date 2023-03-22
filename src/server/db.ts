import * as adodb from "node-adodb";

const connectionString =
  "Provider=IhOLEDB.iHistorian.1;User ID=webrain;Password=R@inDr0ps;Persist Security Info=false;Data Source=ihist;Mode=Read";

export const connection = adodb.open(connectionString);
