import { add, addDays, format, isBefore } from "date-fns";
import { connection } from "../db";
import {
  assertHistorianValuesAll,
  assertHistorianValuesSingle,
} from "../typeValidation";
import { RainGaugeData } from "~/utils/constants";
import { iHistFormatDT, parseDatabaseValues } from "~/utils/utils";

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

export const getTotalBetweenTwoDates = async (start: Date, end: Date) => {
  let queryString = `
    SELECT 
    ${RainGaugeData.map(
      (gauge) => `${gauge.tag}.F_CV.VALUE, ${gauge.tag}.F_CV.QUALITY, `
    ).join("")} timestamp
    FROM IHTREND
    WHERE samplingmode = 'rawbytime' AND
  `;

  const timestampFilters: string[] = [];
  for (let i = start; isBefore(i, end); i = addDays(i, 1)) {
    timestampFilters.push(`(
      TIMESTAMP >= '${iHistFormatDT(i)}' AND 
      TIMESTAMP <= '${iHistFormatDT(i)}')`);
  }
  queryString += timestampFilters.join(" OR ");

  const result = await connection.query(queryString);
  assertHistorianValuesAll(result);
  const parsedResult = result.map((r) => parseDatabaseValues(r));

  const totals: AllGaugeTotals = {
    startDate: start,
    endDate: end,
    readings: [],
  };

  if (result.length <= 0) {
    throw new Error("No data returned from database!");
  }

  totals.readings = RainGaugeData.map((gauge) => ({
    label: gauge.tag,
    value: parsedResult.reduce(
      (previous, a) =>
        previous + (a.readings.find((r) => r.label === gauge.tag)?.value ?? 0),
      0
    ),
  }));

  return totals;
};
