import * as d3 from "d3";

export const RainGaugeData = [
  {
    tag: "ADAMS.AF2295LQT",
    label: "Adams Field WRF",
    short: "Adams",
    address: "1001 Temple St",
  },
  {
    tag: "FOURCHE.FC2295LQT",
    label: "Fourche Creek WRF",
    short: "Fourche",
    address: "9500 Birdwood Dr",
  },
  {
    tag: "ADAMS.CAB2295LQT",
    label: "Clearwater Admin",
    short: "CAB",
    address: "11 Clearwater Dr",
  },
  {
    tag: "ADAMS.AS1941CAT",
    label: "Arch Street PS",
    short: "Arch",
    address: "4000 Arch St",
  },
  {
    tag: "ADAMS.CR1941LQT",
    label: "Cantrell Rd PS",
    short: "Cantrell",
    address: "1901 Cantrell Rd",
  },
  {
    tag: "ADAMS.CV1942CAT",
    label: "Chenal PS",
    short: "Chenal",
    address: "18610 Denny Rd",
  },
  {
    tag: "ADAMS.HR1942CAT",
    label: "Heinke Rd PS",
    short: "Heinke",
    address: "13300 Heinke Rd",
  },
  {
    tag: "ADAMS.JR1941CAT",
    label: "Jamison Rd PS",
    short: "Jamison",
    address: "8001 Jamison Rd",
  },
  {
    tag: "MAUMELLE.LM1941CAT",
    label: "Maumelle PS",
    short: "Maumelle",
    address: "6600 Pinnacle Valley Rd",
  },
  {
    tag: "ADAMS.RR1942CAT",
    label: "River Ridge PS",
    short: "River Ridge",
    address: "224 River Ridge Pointe",
  },
  {
    tag: "ADAMS.LF1941CAT",
    label: "Longfellow PS",
    short: "Longfellow",
    address: "4 Longfellow Cr",
  },
  {
    tag: "ADAMS.OC1941CAT",
    label: "Otter Creek PS",
    short: "Otter Creek",
    address: "11701 Interstate 30",
  },
  {
    tag: "ADAMS.PF2295LQT",
    label: "Peak Flow PS",
    short: "Peak Flow",
    address: "5200 Scott Hamilton Dr",
  },
  {
    tag: "ADAMS.TS1941CAT",
    label: "36th St Diversion Structure",
    short: "36th St",
    address: "7599 W 36th St",
  },
  {
    tag: "ADAMS.CM1942CAT",
    label: "Chalamont PS",
    short: "Chalamont",
    address: "22001 Hwy 10",
  },
  {
    tag: "ADAMS.SW1942CAT",
    label: "Slackwater Harbor PS",
    short: "Slackwater",
    address: "3850 Slackwater Dr",
  },
  {
    tag: "ADAMS.SD1942CAT",
    label: "Springer Diversion Gate",
    short: "Springer",
    address: "3100 Springer Blvd",
  },
  {
    tag: "ADAMS.CP1942CAT",
    label: "Copper Run PS",
    short: "Copper Run",
    address: "309 Copper Dr",
  },
  {
    tag: "ADAMS.WH1942CAT",
    label: "Walton Heights",
    short: "Walton Heights",
    address: "4610 River Mountain Rd",
  },
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
