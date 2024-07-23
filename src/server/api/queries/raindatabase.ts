import {
	addDays,
	addMonths,
	format,
	isThisMonth,
	isWithinInterval,
	startOfMonth,
	subMinutes,
} from "date-fns";
import { today } from "~/utils/utils";
import {
	getCurrentValues,
	getCurrentValuesAll,
	getTodayValues,
	getTodayValuesAll,
} from "./ihistorian";
import { rainDataDb } from "~/server/db";

export const getRainGauges = async () => {
	const queryResult =
		await rainDataDb.query`SELECT * FROM gauges ORDER BY unique_id`;
	const result: RainGaugeInfo[] = queryResult.recordset;
	return result;
};

// Get full day total
export const getDateTotalAll = async (date: Date) => {
	const queryResult =
		await rainDataDb.query`SELECT * FROM daily_totals WHERE date = ${format(date, "yyyy-MM-dd")}`;
	const totals: RawDailyTotal[] = queryResult.recordset;

	if (totals.length <= 0) {
		throw Error(`No data for date ${format(date, "yyyy-MM-dd")}`);
	}

	const result: AllGaugeTotals = {
		startDate: date,
		endDate: addDays(date, 1),
		readings: totals.map((total) => ({ label: total.tag, value: total.value })),
	};

	return result;
};

// Get full month total
export const getMonthTotalAll = async (month: Date) => {
	const startOfCurrent = startOfMonth(month);
	const startOfNext = addMonths(startOfCurrent, 1);

	const queryResult = await rainDataDb.query`SELECT tag AS label, SUM(VALUE) as value FROM daily_totals 
    WHERE date >= ${format(startOfCurrent, "yyyy-MM-dd")} AND date < ${format(startOfNext, "yyyy-MM-dd")} GROUP BY tag`;
	const totals: GaugeTotal[] = queryResult.recordset;

	if (totals.length <= 0 && !isThisMonth(month)) {
		throw Error(`No data for month ${format(month, "yyyy-MM")}`);
	}

	const result: AllGaugeTotals = {
		startDate: startOfCurrent,
		endDate: startOfNext,
		readings: totals,
	};

	// If current month, we have to add current values
	if (isThisMonth(month)) {
		const gauges = await getRainGauges();
		const currentValues = await getCurrentValuesAll(gauges);
		for (const total of result.readings) {
			const currentValue = currentValues.readings.find(
				(reading) => reading.label === total.label,
			);
			if (currentValue) {
				total.value += currentValue.value;
			}
		}

		// If this is run on the first of a month, nothing will be in the database
		if (result.readings.length <= 0) {
			result.readings = currentValues.readings;
		}
	}

	return result;
};

// This is the function used for getting readings between two datetimes
export const getTotalBetweenTwoDates = async (
	start: Date,
	end: Date,
): Promise<AllGaugeTotals> => {
	const startString = format(start, "yyyy-MM-dd HH:mm:ss");
	const endString = format(end, "yyyy-MM-dd HH:mm:ss");

	// Because we're subtracting the previous row, we need one extra row at the beginning that we throw away
	const minBeforeString = format(subMinutes(start, 1), "yyyy-MM-dd HH:mm:ss");

	const queryResult = await rainDataDb.query`SELECT tag as label, SUM(adj_value) as value FROM (
      SELECT 
        tag, timestamp, 
        -- This ugly line gets the value minus the previous row's value
        -- Using IIF to ignore negative values, which usually appear when the gauge resets at or after midnight 
        IIF(value - COALESCE(LAG(value) OVER (ORDER BY tag, timestamp), 0) < 0, 0, value - COALESCE(LAG(value) OVER (ORDER BY tag, timestamp), 0)) AS adj_value
      FROM readings
      -- Filter out rows where quality is not 100 (junk data)
      WHERE quality = 100 AND timestamp >= ${minBeforeString} AND timestamp < ${endString}
    ) sub WHERE timestamp >= ${startString} GROUP BY tag`;
	const totals: GaugeTotal[] = queryResult.recordset;

	// Database doesn't have current gauge values, so we add them in if today is included
	if (isWithinInterval(today(), { start, end })) {
		const gauges = await getRainGauges();
		const currentValues = await getCurrentValuesAll(gauges);
		for (const total of totals) {
			const currentValue = currentValues.readings.find(
				(reading) => reading.label === total.label,
			);
			if (currentValue) {
				total.value += currentValue.value;
			}
		}
	}

	return {
		startDate: start,
		endDate: end,
		readings: totals,
	};
};

export const getRawData = async (
	gauge: string,
	start: Date,
	end: Date,
	frequency = 1,
): Promise<SingleGaugeHistory> => {
	const startString = format(start, "yyyy-MM-dd");
	const endString = format(end, "yyyy-MM-dd");

	const queryResult = await rainDataDb.query`SELECT * FROM readings 
    WHERE tag = ${gauge} AND timestamp >= ${startString} AND timestamp < ${endString} AND 
      DATEPART(mi, timestamp) % ${frequency < 60 ? frequency : 60} = 0 ORDER BY timestamp`;
	const dbReadings: TimestampedReading[] = queryResult.recordset;

	const result = {
		label: gauge,
		readings: dbReadings,
	};

	// Database doesn't have current gauge values, so we add them in if today is included
	if (isWithinInterval(today(), { start, end })) {
		const todayReadings = await getTodayValues(gauge);
		result.readings = result.readings.concat(
			todayReadings.readings.filter(
				(reading) =>
					reading.timestamp.getTime() >= start.getTime() &&
					reading.timestamp.getTime() <= end.getTime(),
			),
		);
	}

	return result;
};

export const getRawDataAll = async (start: Date, end: Date, frequency = 1) => {
	const startString = format(start, "yyyy-MM-dd");
	const endString = format(end, "yyyy-MM-dd");

	const queryResult = await rainDataDb.query`SELECT * FROM readings 
    WHERE timestamp >= ${startString} AND timestamp < ${endString} AND DATEPART(mi, timestamp) % ${frequency < 60 ? frequency : 60} = 0 
    ORDER BY timestamp, tag`;
	const rawReadings: RawReading[] = queryResult.recordset;

	const result: AllGaugeValues[] = [];
	let valueIteration: AllGaugeValues | null = null;

	for (const reading of rawReadings) {
		if (!valueIteration) {
			valueIteration = { timestamp: new Date(reading.timestamp), readings: [] };
		} else if (
			valueIteration.timestamp.getTime() < new Date(reading.timestamp).getTime()
		) {
			result.push(valueIteration);
			valueIteration = { timestamp: new Date(reading.timestamp), readings: [] };
		}

		valueIteration.readings.push({
			label: reading.tag,
			value: reading.value,
			quality: reading.quality ?? "",
		});
	}
	if (valueIteration) result.push(valueIteration);

	// Database doesn't have current gauge values, so we add them in if today is included
	let todayReadings: AllGaugeValues[] = [];
	if (isWithinInterval(today(), { start, end })) {
		const gauges = await getRainGauges();
		todayReadings = await getTodayValuesAll(gauges);
		todayReadings = todayReadings.filter(
			(reading) =>
				reading.timestamp.getTime() >= start.getTime() &&
				reading.timestamp.getTime() <= end.getTime(),
		);
	}

	if (result.length <= 0 && todayReadings.length <= 0) {
		throw new Error(
			`No data found for date range: ${startString}-${endString}`,
		);
	}

	return result.concat(todayReadings);
};

export const getDailyTotalHistory = async (
	gauge: string,
	start: Date,
	end: Date,
): Promise<SingleGaugeHistory> => {
	const queryResult = await rainDataDb.query`SELECT value, date AS timestamp, 100 AS quality FROM daily_totals 
      WHERE tag = ${gauge} AND date >= ${format(start, "yyyy-MM-dd")} AND date < ${format(end, "yyyy-MM-dd")}`;
	const dailyTotals: TimestampedReading[] = queryResult.recordset;

	const result: SingleGaugeHistory = { label: gauge, readings: dailyTotals };

	// Database doesn't have current gauge values, so we add them in if today is included
	if (isWithinInterval(today(), { start, end })) {
		const todayReadings = await getCurrentValues(gauge);
		result.readings.push({ ...todayReadings.reading });
	}

	return result;
};

export const getDailyTotalHistoryAll = async (
	start: Date,
	end: Date,
): Promise<AllGaugeValues[]> => {
	const queryResult = await rainDataDb.query`SELECT * FROM daily_totals 
    WHERE date >= ${format(start, "yyyy-MM-dd")} AND date < ${format(end, "yyyy-MM-dd")} ORDER BY date, tag`;
	const dailyTotals: RawDailyTotal[] = queryResult.recordset;

	const result: AllGaugeValues[] = [];
	let valueIteration: AllGaugeValues | null = null;

	for (const total of dailyTotals) {
		if (!valueIteration) {
			valueIteration = { timestamp: new Date(total.date), readings: [] };
		} else if (
			valueIteration.timestamp.getTime() < new Date(total.date).getTime()
		) {
			result.push(valueIteration);
			valueIteration = { timestamp: new Date(total.date), readings: [] };
		}

		valueIteration.readings.push({
			label: total.tag,
			value: total.value,
			quality: "100",
		});
	}
	if (valueIteration) result.push(valueIteration);

	// Database doesn't have current gauge values, so we add them in if today is included
	if (isWithinInterval(today(), { start, end })) {
		const gauges = await getRainGauges();
		const todayReadings: AllGaugeValues = await getCurrentValuesAll(gauges);
		result.push(todayReadings);
	}

	return result;
};
