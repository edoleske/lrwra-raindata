import * as d3 from "d3";

// List of rain gauges for use on the frontend
export const RainGauges = [
  "ADAMS.AF2295LQT",
  "FOURCHE.FC2295LQT",
  "ADAMS.CAB2295LQT",
  "ADAMS.AS1941CAT",
  "ADAMS.CR1941LQT",
  "ADAMS.CV1942CAT",
  "ADAMS.HR1942CAT",
  "ADAMS.JR1941CAT",
  "MAUMELLE.LM1941CAT",
  "ADAMS.RR1942CAT",
  "ADAMS.LF1941CAT",
  "ADAMS.OC1941CAT",
  "ADAMS.PF2295LQT",
  "ADAMS.TS1941CAT",
  "ADAMS.CM1942CAT",
  "ADAMS.SW1942CAT",
  "ADAMS.SD1942CAT",
  "ADAMS.CP1942CAT",
];

// Utility function that allows customization of D3 time axis label formats
export const multiTimeFormat = (date: Date | d3.NumberValue) => {
  const parsedDate =
    date instanceof Date ? new Date(date) : new Date(date.valueOf());

  return (
    d3.timeSecond(parsedDate) < parsedDate
      ? d3.timeFormat(".%L")
      : d3.timeMinute(parsedDate) < parsedDate
      ? d3.timeFormat(":%S")
      : d3.timeHour(parsedDate) < parsedDate
      ? d3.timeFormat("%I:%M")
      : d3.timeDay(parsedDate) < parsedDate
      ? d3.timeFormat("%I %p")
      : d3.timeMonth(parsedDate) < parsedDate
      ? d3.timeWeek(parsedDate) < parsedDate
        ? d3.timeFormat("%b %d")
        : d3.timeFormat("%b %d")
      : d3.timeYear(parsedDate) < parsedDate
      ? d3.timeFormat("%B")
      : d3.timeFormat("%Y")
  )(parsedDate);
};
