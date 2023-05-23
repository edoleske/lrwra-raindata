import { TRPCError } from "@trpc/server";

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

// This function transforms the values in the raw data to be more normalized
// The rain gauges aggregate the rain values per day and reset at midnight
// This transforms the values so the measure is the rain that occurred since the last interval
export const normalizeValues = (readings: TimestampedReading[]) =>
  readings.map((reading, index, array) => {
    const lastValue = array[index - 1]?.value;
    const newValue = lastValue ? reading.value - lastValue : reading.value;
    return {
      ...reading,
      value: newValue < 0 ? 0 : newValue,
    };
  });
