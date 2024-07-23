import { add, addDays, compareAsc, format } from "date-fns";
import { iHistorianDb } from "../../db";
import {
	assertHistorianValuesAll,
	assertHistorianValuesSingle,
} from "../../typeValidation";
import {
	parseDatabaseCurrentValue,
	parseDatabaseHistory,
	parseDatabaseValues,
	today,
} from "~/utils/utils";

// Gets current rain gauge values from iHistorian (SCADA System)
export const getCurrentValues = async (gauge: string) => {
	const queryString = `
    SELECT
      timestamp, ${gauge}.F_CV.VALUE, ${gauge}.F_CV.QUALITY
    FROM IHTREND
    WHERE samplingmode = CurrentValue
  `;

	const result = await iHistorianDb.query(queryString);
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

	const result = await iHistorianDb.query(queryString);
	assertHistorianValuesAll(result, gauges);

	const firstValue = result[0];
	if (firstValue === undefined) {
		throw Error("getCurrentValuesAll return no data!");
	}

	return parseDatabaseValues(firstValue, gauges);
};

// These functions get raw data from iHistorian between two dates
export const getRawData = async (
	gauge: string,
	start: Date,
	end: Date,
	frequency = 1,
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

		const queryResult = await iHistorianDb.query(queryString);
		assertHistorianValuesSingle(queryResult, gauge);
		result = result.concat(queryResult);
	}

	return result;
};

export const getRawDataAll = async (
	gauges: RainGaugeInfo[],
	start: Date,
	end: Date,
	frequency = 1,
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
						(gauge) => `${gauge.tag}.F_CV.VALUE, ${gauge.tag}.F_CV.QUALITY, `,
					)
					.join("")} timestamp
      FROM IHTREND
      WHERE samplingmode = interpolated AND 
        intervalmilliseconds = ${60000 * frequency} AND 
        timestamp >= '${format(d, "MM/dd/yyyy HH:mm:00")}' AND 
        timestamp <= '${format(correctEnd, "MM/dd/yyyy HH:mm:00")}'
      ORDER BY TIMESTAMP
    `;

		const queryResult = await iHistorianDb.query(queryString);
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
