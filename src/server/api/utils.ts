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

// This function is used to get the total rain calculated from list of DB values
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
