import { RainGauges } from "./constants";

// Utility function to get new Date object with time zeroed out
export const today = () => {
  const result = new Date();
  result.setHours(0);
  result.setMinutes(0);
  result.setSeconds(0);
  result.setMilliseconds(0);
  return result;
};

// Helper function transform parsed fields from database to more useful object
export const parseDatabaseValues = (dbValues: IHistValues): AllGaugeValues => {
  return {
    timestamp: new Date(dbValues.timestamp),
    readings: RainGauges.map((gauge) => {
      const valueKey = `${gauge}.F_CV.Value`;
      const qualityKey = `${gauge}.F_CV.Quality`;

      return {
        label: gauge,
        value: dbValues[valueKey] as number,
        quality: dbValues[qualityKey] as string,
      };
    }),
  };
};

export const parseDatabaseHistory = (
  dbHistory: IHistValues[],
  gauge: string
): SingleGaugeHistory => {
  const valueKey = `${gauge}.F_CV.Value`;
  const qualityKey = `${gauge}.F_CV.Quality`;

  return {
    label: gauge,
    readings: dbHistory.map((reading) => {
      // The as number is safe because the type validation occurs in typeValidation.ts
      const value = reading[valueKey] as number;
      const quality = reading[qualityKey] as string;

      return {
        timestamp: new Date(reading.timestamp),
        value: quality === "100" ? value : 0,
      };
    }),
  };
};
