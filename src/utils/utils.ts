import { RainGaugeData } from "./constants";

// Utility function to get new Date object with time zeroed out
export const today = () => {
  const result = new Date();
  result.setHours(0);
  result.setMinutes(0);
  result.setSeconds(0);
  result.setMilliseconds(0);
  return result;
};

// Utility function to get new Date object with time zeroed out
export const pureDate = (d: Date) => {
  d.setHours(0);
  d.setMinutes(0);
  d.setSeconds(0);
  d.setMilliseconds(0);
  return d;
};

// Utility function to convert gauge tag to label
export const getRainGaugeLabel = (tag: string) => {
  const gauge = RainGaugeData.find((rg) => rg.tag === tag);
  if (gauge) {
    return gauge.label;
  } else {
    return tag;
  }
};

// This function parses response from IHistorian with a value for every gauge
export const parseDatabaseValues = (dbValues: IHistValues): AllGaugeValues => {
  return {
    timestamp: new Date(dbValues.timestamp),
    readings: RainGaugeData.map((gauge) => {
      const valueKey = `${gauge.tag}.F_CV.Value`;
      const qualityKey = `${gauge.tag}.F_CV.Quality`;

      // The "as [type]" is safe because the type validation occurs in typeValidation.ts
      return {
        label: gauge.tag,
        value: dbValues[valueKey] as number,
        quality: dbValues[qualityKey] as string,
      };
    }),
  };
};

// This function parses response from IHistorian with a value from one gauge only
export const parseDatabaseHistory = (
  dbHistory: IHistValues[],
  gauge: string
): SingleGaugeHistory => {
  const valueKey = `${gauge}.F_CV.Value`;
  const qualityKey = `${gauge}.F_CV.Quality`;

  return {
    label: gauge,
    readings: dbHistory.map((reading) => {
      // The "as [type]" is safe because the type validation occurs in typeValidation.ts
      const value = reading[valueKey] as number;
      const quality = reading[qualityKey] as string;

      return {
        timestamp: new Date(reading.timestamp),
        value: value,
        quality: quality,
      };
    }),
  };
};
