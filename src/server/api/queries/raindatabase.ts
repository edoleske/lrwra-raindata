import {
  addDays,
  addMonths,
  format,
  isThisMonth,
  isWithinInterval,
  startOfMonth,
  subMinutes,
} from "date-fns";
import { rainDataDB } from "../../knex";
import { adjustDateTimezone, today } from "~/utils/utils";
import {
  getCurrentValues,
  getCurrentValuesAll,
  getTodayValues,
  getTodayValuesAll,
} from "./ihistorian";

export const getRainGauges = async () => {
  const result: RainGaugeInfo[] = await rainDataDB("gauges")
    .orderBy("unique_id")
    .select(
      "tag",
      "label",
      "label_short",
      "label_long",
      "address",
      "coordinates"
    );
  return result;
};

// Get full day total
export const getDateTotalAll = async (date: Date) => {
  const totals: RawDailyTotal[] = await rainDataDB("daily_totals")
    .where("date", format(date, "yyyy-MM-dd"))
    .select("tag", "value", "date");

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

  const totals: GaugeTotal[] = await rainDataDB("daily_totals")
    .where("date", ">=", format(startOfCurrent, "yyyy-MM-dd"))
    .where("date", "<", format(startOfNext, "yyyy-MM-dd"))
    .select("tag as label")
    .sum("value as value")
    .groupBy("tag");

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
    result.readings.forEach((total) => {
      const currentValue = currentValues.readings.find(
        (reading) => reading.label === total.label
      );
      if (currentValue) {
        total.value += currentValue.value;
      }
    });

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
  end: Date,
  frequency = 1
): Promise<SingleGaugeHistory> => {
  const startString = format(start, "yyyy-MM-dd");
  const endString = format(end, "yyyy-MM-dd");

  const dbReadings: TimestampedReading[] = await rainDataDB("readings")
    .where("tag", gauge)
    .where("timestamp", ">=", startString)
    .where("timestamp", "<", endString)
    .select("timestamp", "value", "quality")
    .modify((builder) => {
      if (frequency > 1 && frequency < 60) {
        void builder.where(
          rainDataDB.raw(`DATEPART(mi, timestamp) % ${frequency} = 0`)
        );
      } else if (frequency !== 1) {
        void builder.where(rainDataDB.raw("DATEPART(mi, timestamp) = 0"));
      }
    });

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

export const getRawDataAll = async (start: Date, end: Date, frequency = 1) => {
  const startString = format(start, "yyyy-MM-dd");
  const endString = format(end, "yyyy-MM-dd");

  const rawReadings: RawReading[] = await rainDataDB("readings")
    .where("timestamp", ">=", startString)
    .where("timestamp", "<", endString)
    .orderBy("timestamp", "tag")
    .select("tag", "timestamp", "value", "quality")
    .modify((builder) => {
      if (frequency > 1 && frequency < 60) {
        void builder.where(
          rainDataDB.raw(`DATEPART(mi, timestamp) % ${frequency} = 0`)
        );
      } else if (frequency !== 1) {
        void builder.where(rainDataDB.raw("DATEPART(mi, timestamp) = 0"));
      }
    });

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

  if (result.length <= 0 && todayReadings.length <= 0) {
    throw new Error(
      `No data found for date range: ${startString}-${endString}`
    );
  }

  return result.concat(todayReadings);
};

export const getDailyTotalHistory = async (
  gauge: string,
  start: Date,
  end: Date
): Promise<SingleGaugeHistory> => {
  const dailyTotals: TimestampedReading[] = await rainDataDB("daily_totals")
    .where("date", ">=", format(start, "yyyy-MM-dd"))
    .where("date", "<", format(end, "yyyy-MM-dd"))
    .where("tag", gauge)
    .select("value", "date as timestamp", rainDataDB.raw("100 as quality"));

  const result: SingleGaugeHistory = { label: gauge, readings: dailyTotals };

  // Knex adjusts DB datetimes as if they are UTC (They're not)
  result.readings.forEach(
    (reading) => (reading.timestamp = adjustDateTimezone(reading.timestamp))
  );

  // Database doesn't have current gauge values, so we add them in if today is included
  if (isWithinInterval(today(), { start, end })) {
    const todayReadings = await getCurrentValues(gauge);
    result.readings.push({ ...todayReadings.reading });
  }

  return result;
};

export const getDailyTotalHistoryAll = async (
  start: Date,
  end: Date
): Promise<AllGaugeValues[]> => {
  const dailyTotals: RawDailyTotal[] = await rainDataDB("daily_totals")
    .where("date", ">=", format(start, "yyyy-MM-dd"))
    .where("date", "<", format(end, "yyyy-MM-dd"))
    .orderBy("date", "tag")
    .select("tag", "value", "date");

  // Knex adjusts DB datetimes as if they are UTC (They're not)
  dailyTotals.forEach(
    (reading) => (reading.date = adjustDateTimezone(reading.date))
  );

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
