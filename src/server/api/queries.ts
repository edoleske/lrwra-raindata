import { add, format } from "date-fns";
import { connection } from "../db";
import { assertHistorianValuesSingle } from "../typeValidation";

export const getRawData = async (
  gauge: string,
  start: Date,
  end: Date,
  frequency = 1
) => {
  let result: IHistValues[] = [];

  for (let d = start; d.getTime() < end.getTime(); d = add(d, { days: 2 })) {
    const queryString = `
      SELECT
        timestamp, ${gauge}.F_CV.VALUE, ${gauge}.F_CV.QUALITY,
      FROM IHTREND
      WHERE samplingmode = interpolated AND 
        intervalmilliseconds = ${60000 * frequency} AND 
        timestamp >= '${format(d, "MM/dd/yyyy HH:mm:00")}' AND 
        timestamp <= '${format(add(d, { days: 2 }), "MM/dd/yyyy HH:mm:00")}'
      ORDER BY TIMESTAMP
    `;

    const queryResult = await connection.query(queryString);
    assertHistorianValuesSingle(queryResult, gauge);
    result = result.concat(queryResult);
  }

  return result;
};
