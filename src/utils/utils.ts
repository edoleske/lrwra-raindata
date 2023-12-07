import { format, isToday, sub } from "date-fns";

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

// Utility function to add timezone offset to date (Knex adjusts it automatically)
export const adjustDateTimezone = (d: Date) => {
  const userTimezoneOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() + userTimezoneOffset);
};

// Utility function to convert gauge tag to label
export const getRainGaugeLabel = (
  tag: string,
  RainGaugeData: RainGaugeInfo[] | undefined
) => {
  if (!RainGaugeData) return "";
  const gauge = RainGaugeData.find((rg) => rg.tag === tag);
  if (gauge) {
    return gauge.label;
  } else {
    return tag;
  }
};

// Utility function to convert gauge tag to short label
export const getRainGaugeLabelShort = (
  tag: string,
  RainGaugeData: RainGaugeInfo[] | undefined,
  stripSpace = false
) => {
  if (!RainGaugeData) return "";
  const gauge = RainGaugeData.find((rg) => rg.tag === tag);
  if (gauge) {
    return stripSpace
      ? gauge.label_short.replace(/\s/g, "")
      : gauge.label_short;
  } else {
    return tag;
  }
};

// Either get datetime as second before midnight, or current time (- 1min) if date is today
// Formats the datetime to be used in iHistorian query
export const iHistFormatDT = (date: Date) =>
  isToday(date)
    ? `${format(sub(new Date(), { minutes: 1 }), "MM/dd/yyyy HH:mm")}:00`
    : `${format(date, "MM/dd/yyyy")} 23:59:00`;

// This function parses response from IHistorian with a value for every gauge
export const parseDatabaseValues = (
  dbValues: IHistValues,
  RainGaugeData: RainGaugeInfo[]
): AllGaugeValues => {
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

export const parseDatabaseCurrentValue = (
  dbHistory: IHistValues[],
  gauge: string
): SingleGaugeReading => {
  const valueKey = `${gauge}.F_CV.Value`;
  const qualityKey = `${gauge}.F_CV.Quality`;

  const reading = dbHistory[0];
  if (!reading) {
    throw Error(
      `parseDatabaseCurrentValue called with empty dbHistory parameter for gauge ${gauge}`
    );
  }

  return {
    label: gauge,
    reading: {
      timestamp: new Date(reading.timestamp),
      value: reading[valueKey] as number,
      quality: reading[qualityKey] as string,
    },
  };
};
