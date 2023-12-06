import { format, isWithinInterval, subMinutes } from "date-fns";
import { rainDataDB } from "../../knex";
import { today } from "~/utils/utils";
import { getCurrentValuesAll } from "./ihistorian";

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
