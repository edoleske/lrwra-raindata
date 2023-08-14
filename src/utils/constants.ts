import * as d3 from "d3";

export const RainGaugeData = [
  { tag: "ADAMS.AF2295LQT", label: "Adams Field WRF", short: "Adams" },
  { tag: "FOURCHE.FC2295LQT", label: "Fourche Creek WRF", short: "Fourche" },
  { tag: "ADAMS.CAB2295LQT", label: "Clearwater Admin", short: "CAB" },
  { tag: "ADAMS.AS1941CAT", label: "Arch Street PS", short: "Arch" },
  { tag: "ADAMS.CR1941LQT", label: "Cantrell Rd PS", short: "Cantrell" },
  { tag: "ADAMS.CV1942CAT", label: "Chenal PS", short: "Chenal" },
  { tag: "ADAMS.HR1942CAT", label: "Heinke Rd PS", short: "Heinke" },
  { tag: "ADAMS.JR1941CAT", label: "Jamison Rd PS", short: "Jamison" },
  { tag: "MAUMELLE.LM1941CAT", label: "Maumelle PS", short: "Maumelle" },
  { tag: "ADAMS.RR1942CAT", label: "River Ridge PS", short: "River Ridge" },
  { tag: "ADAMS.LF1941CAT", label: "Longfellow PS", short: "Longfellow" },
  { tag: "ADAMS.OC1941CAT", label: "Otter Creek PS", short: "Otter Creek" },
  { tag: "ADAMS.PF2295LQT", label: "Peak Flow PS", short: "Peak Flow" },
  {
    tag: "ADAMS.TS1941CAT",
    label: "36th St Diversion Structure",
    short: "36th St",
  },
  { tag: "ADAMS.CM1942CAT", label: "Chalamont PS", short: "Chalamont" },
  {
    tag: "ADAMS.SW1942CAT",
    label: "Slackwater Harbor PS",
    short: "Slackwater",
  },
  {
    tag: "ADAMS.SD1942CAT",
    label: "Springer Diversion Gate",
    short: "Springer",
  },
  { tag: "ADAMS.CP1942CAT", label: "Copper Run PS", short: "Copper Run" },
  { tag: "ADAMS.WH1942CAT", label: "Walton Heights", short: "Walton Heights" },
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
