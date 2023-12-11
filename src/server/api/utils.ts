import { TRPCError } from "@trpc/server";
import {
  addMinutes,
  compareAsc,
  differenceInDays,
  format,
  isWithinInterval,
  max,
  min,
} from "date-fns";

export const handleError = (error: unknown) => {
  // String(err) works for all errors except for database errors
  // JSON.stringify gives more info on why iHistorian's OLEDB provider errored
  const parsedJSON = JSON.stringify(error);
  const message = parsedJSON === "{}" ? String(error) : parsedJSON;

  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: message,
    cause: error,
  });
};

// Validates dates (throws TRPCError with BAD_REQUEST) to follow the following rules:
// - Date range cannot be in the future
// - End date must be after start date
// - Date range must not exceed given maximum
export const validateDates = (start: Date, end: Date, maxDays = 31) => {
  if (
    compareAsc(new Date(), start) !== 1 &&
    compareAsc(new Date(), end) !== 1
  ) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `No data available for the future.`,
    });
  }

  if (compareAsc(end, start) !== 1) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `End date ${format(
        end,
        "yyyy-mm-DD"
      )} is before start date ${format(start, "yyyy-mm-DD")}`,
    });
  }

  if (Math.abs(differenceInDays(start, end)) > maxDays) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Cannot retrieve more than ${maxDays} days of data at once.`,
    });
  }
};

// Transforms the values in the raw data to be more normalized
// The rain gauges aggregate the rain values per day and reset at midnight
// This transforms the values so the measure is the rain that occurred since the last interval
// It filters out non-100 quality rows, because the value for those rows is usually 0, because the gauge is offline
export const normalizeValues = (readings: TimestampedReading[]) =>
  readings
    .filter((reading) => String(reading.quality) === "100")
    .map((reading, index, array) => {
      const lastValue = array[index - 1]?.value;
      const newValue = lastValue ? reading.value - lastValue : reading.value;
      return {
        ...reading,
        value: newValue < 0 ? 0 : newValue,
      };
    });

// Collects SingleGaugeHistory into larger time buckets for displaying in graph
export const collectTimeInterval = (
  history: SingleGaugeHistory,
  minutes = 10
): SingleGaugeHistory => {
  const readingCopy = history.readings.slice();
  const minDate = min(readingCopy.map((reading) => reading.timestamp));
  const maxDate = max(readingCopy.map((reading) => reading.timestamp));

  const timeSteps = [];
  let d = minDate;
  while (d <= maxDate) {
    timeSteps.push(d);
    d = addMinutes(d, minutes);
  }

  const results: TimestampedReading[] = timeSteps.map((timeStep) => ({
    timestamp: timeStep,
    quality: "100",
    value: 0,
  }));

  for (const reading of readingCopy) {
    for (const result of results) {
      if (
        isWithinInterval(reading.timestamp, {
          start: result.timestamp,
          end: addMinutes(result.timestamp, minutes - 1),
        })
      ) {
        result.value += reading.value;
        break;
      }
    }
  }

  return {
    label: history.label,
    readings: results,
  };
};

// Used to get the total rain calculated from list of DB values
// Uses AllGaugeValues so each gauge can be calculated at the same time
export const collectAllGaugeValuesIntoTotals = (
  values: AllGaugeValues[],
  gauges: RainGaugeInfo[],
  date: Date
) => {
  const returnValues: AllGaugeValues = {
    timestamp: date,
    readings: gauges.map((gauge) => ({
      label: gauge.tag,
      value: 0,
      quality: "100",
    })),
  };

  for (let i = values.length - 1; i > 0; i--) {
    for (const gauge of gauges) {
      const reading = values[i]?.readings.find((r) => r.label === gauge.tag);
      const lastReading = values[i - 1]?.readings.find(
        (r) => r.label === gauge.tag
      );
      const newReading = returnValues.readings.find(
        (r) => r.label === gauge.tag
      );

      if (reading && lastReading && newReading) {
        const amount = reading.value - lastReading.value;
        if (amount >= 0) {
          newReading.value += amount;
        }
      }
    }
  }

  return returnValues;
};
