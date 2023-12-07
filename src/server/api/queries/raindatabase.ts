import { addDays, format, isWithinInterval, subMinutes } from "date-fns";
import { rainDataDB } from "../../knex";
import { adjustDateTimezone, today } from "~/utils/utils";
import {
  getCurrentValuesAll,
  getTodayValues,
  getTodayValuesAll,
} from "./ihistorian";

export const getRainGauges = async () => {
  const result: RainGaugeInfo[] = await rainDataDB("gauges").select(
    "tag",
    "label",
    "label_short",
    "label_long",
    "address",
    "coordinates"
  );
  return result;
};

// This is the function used for getting readings between two datetimes
export const getTotalBetweenTwoDates = async (
  start: Date,
  end: Date
): Promise<AllGaugeTotals> => {
  const startString = format(start, "yyyy-MM-dd HH:mm:ss");
  const endString = format(end, "yyyy-MM-dd HH:mm:ss");

  // Because we're subtracting the previous row, we need one extra row at the beginning that we throw away
  const minBeforeString = format(subMinutes(start, 1), "yyyy-MM-dd HH:mm:ss");

  const adjustedSubQuery = rainDataDB("readings")
    .where("timestamp", ">=", minBeforeString)
    .where("timestamp", "<", endString)
    // Data is usually zero when quality is not 100, so we have to filter those out with this approach
    .where("quality", 100)
    .select(
      "tag",
      "timestamp",
      // This ugly line gets the value minus the previous row's value
      // Using IIF to ignore negative values, which usually appear when the gauge resets at or after midnight
      rainDataDB.raw(
        "IIF(value - COALESCE(LAG(value) OVER (ORDER BY tag, timestamp), 0) < 0, 0, value - COALESCE(LAG(value) OVER (ORDER BY tag, timestamp), 0)) AS adj_value"
      )
    )
    .as("sub");

  const totals: GaugeTotal[] = await rainDataDB
    .select("tag as label")
    .sum("adj_value as value")
    .from(adjustedSubQuery)
    .where("timestamp", ">=", startString)
    .groupBy("tag");

  // Database doesn't have current gauge values, so we add them in if today is included
  if (isWithinInterval(today(), { start, end })) {
    const gauges = await getRainGauges();
    const currentValues = await getCurrentValuesAll(gauges);
    totals.forEach((total) => {
      const currentValue = currentValues.readings.find(
        (reading) => reading.label === total.label
      );
      if (currentValue) {
        total.value += currentValue.value;
      }
    });
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
  end: Date
): Promise<SingleGaugeHistory> => {
  const startString = format(start, "yyyy-MM-dd");
  const endString = format(end, "yyyy-MM-dd");

  const dbReadings: TimestampedReading[] = await rainDataDB("readings")
    .where("tag", gauge)
    .where("timestamp", ">=", startString)
    .where("timestamp", "<", endString)
    .select("timestamp", "value", "quality");

  const result = {
    label: gauge,
    readings: dbReadings,
  };

  // Knex adjusts DB datetimes as if they are UTC (They're not)
  result.readings.forEach(
    (reading) => (reading.timestamp = adjustDateTimezone(reading.timestamp))
  );

  // Database doesn't have current gauge values, so we add them in if today is included
  if (isWithinInterval(today(), { start, end })) {
    const todayReadings = await getTodayValues(gauge);
    result.readings = result.readings.concat(
      todayReadings.readings.filter(
        (reading) =>
          reading.timestamp.getTime() >= start.getTime() &&
          reading.timestamp.getTime() <= end.getTime()
      )
    );
  }

  return result;
};

export const getRawDataAll = async (start: Date, end: Date) => {
  const startString = format(start, "yyyy-MM-dd");
  const endString = format(end, "yyyy-MM-dd");

  const rawReadings: RawReading[] = await rainDataDB("readings")
    .where("timestamp", ">=", startString)
    .where("timestamp", "<", endString)
    .orderBy("timestamp", "tag")
    .select("tag", "timestamp", "value", "quality");

  if (rawReadings.length <= 0) {
    throw new Error(
      `No data found for date range: ${startString}-${endString}`
    );
  }

  // Knex adjusts DB datetimes as if they are UTC (They're not)
  rawReadings.forEach(
    (reading) => (reading.timestamp = adjustDateTimezone(reading.timestamp))
  );

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
      quality: reading.quality,
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
        reading.timestamp.getTime() <= end.getTime()
    );
  }

  return result.concat(todayReadings);
};

export const getDailyTotalHistory = async (
  start: Date,
  end: Date,
  gauge = "all"
) => {
  const queries = [];

  for (let d = start; d.getTime() < end.getTime(); d = addDays(d, 1)) {
    const startString = format(d, "yyyy-MM-dd HH:mm:ss");
    const endString = format(addDays(d, 1), "yyyy-MM-dd HH:mm:ss");

    // Because we're subtracting the previous row, we need one extra row at the beginning that we throw away
    const minBeforeString = format(subMinutes(d, 1), "yyyy-MM-dd HH:mm:ss");

    const adjustedSubQuery = rainDataDB("readings")
      .where("timestamp", ">=", minBeforeString)
      .where("timestamp", "<", endString)
      // Data is usually zero when quality is not 100, so we have to filter those out with this approach
      .where("quality", 100)
      .select(
        "tag",
        "timestamp",
        // This ugly line gets the value minus the previous row's value
        // Using IIF to ignore negative values, which usually appear when the gauge resets at or after midnight
        rainDataDB.raw(
          "IIF(value - COALESCE(LAG(value) OVER (ORDER BY tag, timestamp), 0) < 0, 0, value - COALESCE(LAG(value) OVER (ORDER BY tag, timestamp), 0)) AS adj_value"
        )
      )
      .as("sub");

    queries.push(
      rainDataDB
        .select("tag as label")
        .sum("adj_value as value")
        .from(adjustedSubQuery)
        .where("timestamp", ">=", startString)
        .groupBy("tag")
    );
  }

  const totalHistory = await rainDataDB.union(queries);
  console.log(totalHistory);
};
