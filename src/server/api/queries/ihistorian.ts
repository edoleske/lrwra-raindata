import { add, addDays, compareAsc, format, isBefore } from "date-fns";
import { connection } from "../../db";
import {
  assertHistorianValuesAll,
  assertHistorianValuesSingle,
} from "../../typeValidation";
import {
  iHistFormatDT,
  parseDatabaseCurrentValue,
  parseDatabaseHistory,
  parseDatabaseValues,
  today,
} from "~/utils/utils";
import { collectAllGaugeValuesIntoTotals } from "../utils";
import { getRainGauges } from "./raindatabase";

// Gets current rain gauge values from iHistorian (SCADA System)
export const getCurrentValues = async (gauge: string) => {
  const queryString = `
    SELECT
      timestamp, ${gauge}.F_CV.VALUE, ${gauge}.F_CV.QUALITY
    FROM IHTREND
    WHERE samplingmode = CurrentValue
  `;

  const result = await connection.query(queryString);
  assertHistorianValuesSingle(result, gauge);
  return parseDatabaseCurrentValue(result, gauge);
};

export const getCurrentValuesAll = async (gauges: RainGaugeInfo[]) => {
  const queryString = `
    SELECT TOP 1
    ${gauges
      .map((gauge) => `${gauge.tag}.F_CV.VALUE, ${gauge.tag}.F_CV.QUALITY, `)
      .join("")} timestamp
    FROM IHTREND
    WHERE samplingmode = CurrentValue
  `;

  const result = await connection.query(queryString);
  assertHistorianValuesAll(result, gauges);

  const firstValue = result[0];
  if (firstValue === undefined) {
    throw Error(`getCurrentValuesAll return no data!`);
  }

  return parseDatabaseValues(firstValue, gauges);
};

// These functions get raw data from iHistorian between two dates
export const getRawData = async (
  gauge: string,
  start: Date,
  end: Date,
  frequency = 1
) => {
  let result: IHistValues[] = [];

  for (let d = start; d.getTime() < end.getTime(); d = add(d, { days: 2 })) {
    // If we're at the last iteration, filter the timestamp to the input end date instead of adding two days
    const endPlusTwo = add(d, { days: 2 });
    const correctEnd = compareAsc(end, endPlusTwo) === 1 ? endPlusTwo : end;

    const queryString = `
      SELECT
        timestamp, ${gauge}.F_CV.VALUE, ${gauge}.F_CV.QUALITY,
      FROM IHTREND
      WHERE samplingmode = interpolated AND 
        intervalmilliseconds = ${60000 * frequency} AND 
        timestamp >= '${format(d, "MM/dd/yyyy HH:mm:00")}' AND 
        timestamp <= '${format(correctEnd, "MM/dd/yyyy HH:mm:00")}'
      ORDER BY TIMESTAMP
    `;

    const queryResult = await connection.query(queryString);
    assertHistorianValuesSingle(queryResult, gauge);
    result = result.concat(queryResult);
  }

  return result;
};

export const getRawDataAll = async (
  gauges: RainGaugeInfo[],
  start: Date,
  end: Date,
  frequency = 1
) => {
  let result: IHistValues[] = [];

  for (let d = start; d.getTime() < end.getTime(); d = add(d, { days: 2 })) {
    // If we're at the last iteration, filter the timestamp to the input end date instead of adding two days
    const endPlusTwo = add(d, { days: 2 });
    const correctEnd = compareAsc(end, endPlusTwo) === 1 ? endPlusTwo : end;

    const queryString = `
      SELECT
        ${gauges
          .map(
            (gauge) => `${gauge.tag}.F_CV.VALUE, ${gauge.tag}.F_CV.QUALITY, `
          )
          .join("")} timestamp
      FROM IHTREND
      WHERE samplingmode = interpolated AND 
        intervalmilliseconds = ${60000 * frequency} AND 
        timestamp >= '${format(d, "MM/dd/yyyy HH:mm:00")}' AND 
        timestamp <= '${format(correctEnd, "MM/dd/yyyy HH:mm:00")}'
      ORDER BY TIMESTAMP
    `;

    const queryResult = await connection.query(queryString);
    assertHistorianValuesAll(queryResult, gauges);
    result = result.concat(queryResult);
  }

  return result;
};

// Gets gauge history for the current day from iHistorian (SCADA system)
export const getTodayValues = async (gauge: string) => {
  const result = await getRawData(gauge, today(), addDays(today(), 1));
  return parseDatabaseHistory(result, gauge);
};

export const getTodayValuesAll = async (gauges: RainGaugeInfo[]) => {
  const result = await getRawDataAll(gauges, today(), addDays(today(), 1));
  return result.map((r) => parseDatabaseValues(r, gauges));
};

/*
 * iHistorian Queries Below
 * All Will Be Deprecated, Only getCurrentValues and getCurrentValuesAll will be kept
 */

export const getDayTotalHistory = async (
  gauge: string,
  start: Date,
  end: Date
) => {
  let queryString = `
    SELECT 
    ${gauge}.F_CV.VALUE, ${gauge}.F_CV.QUALITY, timestamp
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
  assertHistorianValuesSingle(result, gauge);
  return parseDatabaseHistory(result, gauge);
};

export const getDayTotalHistoryAll = async (start: Date, end: Date) => {
  const gauges = await getRainGauges();

  let queryString = `
    SELECT 
    ${gauges
      .map((gauge) => `${gauge.tag}.F_CV.VALUE, ${gauge.tag}.F_CV.QUALITY, `)
      .join("")} timestamp
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
  assertHistorianValuesAll(result, gauges);
  return result.map((r) => parseDatabaseValues(r, gauges));
};

export const getTotalBetweenTwoDatesOld = async (start: Date, end: Date) => {
  const gauges = await getRainGauges();

  let queryString = `
    SELECT 
    ${gauges
      .map((gauge) => `${gauge.tag}.F_CV.VALUE, ${gauge.tag}.F_CV.QUALITY, `)
      .join("")} timestamp
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
  assertHistorianValuesAll(result, gauges);
  const parsedResult = result.map((r) => parseDatabaseValues(r, gauges));

  const totals: AllGaugeTotals = {
    startDate: start,
    endDate: end,
    readings: [],
  };

  if (result.length <= 0) {
    throw new Error("No data returned from database!");
  }

  totals.readings = gauges.map((gauge) => ({
    label: gauge.tag,
    value: parsedResult.reduce(
      (previous, a) =>
        previous + (a.readings.find((r) => r.label === gauge.tag)?.value ?? 0),
      0
    ),
  }));

  return totals;
};

export const getDayTotalBeforeTime = async (date: Date) => {
  const gauges = await getRainGauges();

  const queryString = `
    SELECT 
    ${gauges
      .map((gauge) => `${gauge.tag}.F_CV.VALUE, ${gauge.tag}.F_CV.QUALITY, `)
      .join("")} timestamp
    FROM IHTREND
    WHERE samplingmode = interpolated AND
      intervalmilliseconds = 60000 AND
      TIMESTAMP >= '${format(
        date,
        "MM/dd/yyyy"
      )} 00:00:00' AND TIMESTAMP <= '${format(date, "MM/dd/yyyy HH:mm")}:00'
  `;

  const result = await connection.query(queryString);
  assertHistorianValuesAll(result, gauges);
  const parsedResults = result.map((r) => parseDatabaseValues(r, gauges));

  if (parsedResults.length === 0) {
    throw new Error(`No data found for date ${format(date, "yyyy-MM-dd")}`);
  }

  return collectAllGaugeValuesIntoTotals(parsedResults, gauges, date);
};

export const getDayTotalAfterTime = async (
  date: Date,
  end: Date | null = null
) => {
  const gauges = await getRainGauges();

  // If requested time is 11:59 PM, value will be zero
  if (format(date, "HH:mm") === "23:59") {
    return {
      timestamp: date,
      readings: gauges.map((gauge) => ({
        label: gauge.tag,
        value: 0,
        quality: "100",
      })),
    };
  }

  const queryString = `
    SELECT 
    ${gauges
      .map((gauge) => `${gauge.tag}.F_CV.VALUE, ${gauge.tag}.F_CV.QUALITY, `)
      .join("")} timestamp
    FROM IHTREND
    WHERE samplingmode = interpolated AND
      intervalmilliseconds = 60000 AND
      TIMESTAMP >= '${format(date, "MM/dd/yyyy HH:mm")}:00' AND
      ${
        end
          ? `TIMESTAMP <= '${format(end, "MM/dd/yyyy HH:mm")}:00'`
          : `TIMESTAMP <= '${format(date, "MM/dd/yyyy")} 23:59:00'`
      }
  `;

  const result = await connection.query(queryString);
  assertHistorianValuesAll(result, gauges);
  const parsedResults = result.map((r) => parseDatabaseValues(r, gauges));

  if (parsedResults.length === 0) {
    throw new Error(`No data found for date ${format(date, "yyyy-MM-dd")}`);
  }

  return collectAllGaugeValuesIntoTotals(parsedResults, gauges, date);
};
