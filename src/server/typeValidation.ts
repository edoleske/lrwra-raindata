// When we get query results via node-adodb, we need to parse the results into known types for validation

import { RainGauges } from "~/utils/constants";

export function assertHistorianValuesAll(
  input: unknown
): asserts input is IHistValues[] {
  // Check if input is an array
  if (!Array.isArray(input)) throw new Error("Input is not an array!");

  // Check if each expected field is in each object in array
  // This does not check type of values, but this is already probably overkill
  input.forEach((element) => {
    const timestamp = (element as IHistValues)["timestamp"];
    if (timestamp === undefined) {
      throw new Error("IHistorian values object missing timestamp");
    }

    RainGauges.forEach((gauge) => {
      const valueKey = `${gauge}.F_CV.Value`;
      const qualityKey = `${gauge}.F_CV.Quality`;

      // All values are optional, so check if defined ones are ok
      const value = (element as IHistValues)[valueKey];
      const quality = (element as IHistValues)[qualityKey];

      if (value !== undefined) {
        if (quality === undefined) {
          throw new Error(
            `IHistorian missing quality but has value for gauge ${gauge}`
          );
        }

        if (isNaN(+value)) {
          throw new Error(
            `IHistorian values object value for gauge ${gauge} is NaN!`
          );
        }
      }

      if (quality !== undefined && value === undefined) {
        throw new Error(
          `IHistorian values object missing value but has quality for gauge ${gauge}`
        );
      }
    });
  });
}

export function assertHistorianValuesSingle(
  input: unknown,
  gauge: string
): asserts input is IHistValues[] {
  // Check if input is an array
  if (!Array.isArray(input)) throw new Error("Input is not an array!");

  const valueKey = `${gauge}.F_CV.Value`;
  const qualityKey = `${gauge}.F_CV.Quality`;

  input.forEach((element) => {
    const timestamp = (element as IHistValues)["timestamp"];
    const value = (element as IHistValues)[valueKey];
    const quality = (element as IHistValues)[qualityKey];

    if (timestamp === undefined)
      throw new Error("IHistorian history object missing timestamp");
    if (value === undefined)
      throw new Error("IHistorian history object missing value");
    if (quality === undefined)
      throw new Error("IHistorian history object missing quality");

    if (isNaN(+value)) {
      throw new Error("A value is not a number!");
    }
  });
}
