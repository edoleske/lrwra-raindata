import * as d3 from "d3";

export const RainGaugeData = [
  {
    tag: "ADAMS.AF2295LQT",
    label: "Adams Field WRF",
    short: "Adams",
    long: "Adams Field Water Reclamation Facility",
    address: "1001 Temple St",
    coordinates: `34°44'04.0"N 92°12'51.0"W`,
  },
  {
    tag: "FOURCHE.FC2295LQT",
    label: "Fourche Creek WRF",
    short: "Fourche",
    long: "Fourche Creek Water Reclamation Facility",
    address: "9500 Birdwood Dr",
    coordinates: `34°41'50.0"N 92°09'48.0"W`,
  },
  {
    tag: "ADAMS.CAB2295LQT",
    label: "Clearwater Admin",
    short: "CAB",
    long: "Clearwater Administration Building",
    address: "11 Clearwater Dr",
    coordinates: `34°42'08.8"N 92°23'33.4"W`,
  },
  {
    tag: "ADAMS.AS1941CAT",
    label: "Arch St PS",
    short: "Arch",
    long: "Arch St Pump Station",
    address: "4000 Arch St",
    coordinates: `34°42'33.1"N 92°16'53.8"W`,
  },
  {
    tag: "ADAMS.CR1941LQT",
    label: "Cantrell Rd PS",
    short: "Cantrell",
    long: "Cantrell Rd Pump Station",
    address: "1901 Cantrell Rd",
    coordinates: `34°45'12.9"N 92°17'29.0"W`,
  },
  {
    tag: "ADAMS.CV1942CAT",
    label: "Chenal PS",
    short: "Chenal",
    long: "Chenal Pump Station",
    address: "18610 Denny Rd",
    coordinates: `34°45'51.0"N 92°28'27.0"W`,
  },
  {
    tag: "ADAMS.HR1942CAT",
    label: "Heinke Rd PS",
    short: "Heinke",
    long: "Heinke Rd Pump Station",
    address: "13300 Heinke Rd",
    coordinates: `34°37'44.1"N 92°22'54.8"W`,
  },
  {
    tag: "ADAMS.JR1941CAT",
    label: "Jamison Rd PS",
    short: "Jamison",
    long: "Jamison Rd Pump Station",
    address: "8001 Jamison Rd",
    coordinates: `34°40'31.4"N 92°18'41.1"W`,
  },
  {
    tag: "MAUMELLE.LM1941CAT",
    label: "Maumelle PS",
    short: "Maumelle",
    long: "Maumelle Pump Station",
    address: "6600 Pinnacle Valley Rd",
    coordinates: `34°48'45.5"N 92°26'43.2"W`,
  },
  {
    tag: "ADAMS.RR1942CAT",
    label: "River Ridge PS",
    short: "River Ridge",
    long: "River Ridge Pump Station",
    address: "224 River Ridge Pointe",
    coordinates: `34°47'33.8"N 92°23'11.9"W`,
  },
  {
    tag: "ADAMS.LF1941CAT",
    label: "Longfellow PS",
    short: "Longfellow",
    long: "Longfellow Pump Station",
    address: "4 Longfellow Cr",
    coordinates: `34°46'35.8"N 92°19'42.0"W`,
  },
  {
    tag: "ADAMS.OC1941CAT",
    label: "Otter Creek PS",
    short: "Otter Creek",
    long: "Otter Creek Pump Station",
    address: "11701 Interstate 30",
    coordinates: `34°39'27.3"N 92°24'23.5"W`,
  },
  {
    tag: "ADAMS.PF2295LQT",
    label: "Peak Flow AF",
    short: "Peak Flow",
    long: "Peak Flow Attenuation Facility",
    address: "5200 Scott Hamilton Dr",
    coordinates: `34°41'58.0"N 92°19'16.0"W`,
  },
  {
    tag: "ADAMS.TS1941CAT",
    label: "36th St Diversion Structure",
    short: "36th St",
    long: "36th St Diversion Structure",
    address: "7599 W 36th St",
    coordinates: `34°43'12.4"N 92°21'35.2"W`,
  },
  {
    tag: "ADAMS.CM1942CAT",
    label: "Chalamont PS",
    short: "Chalamont",
    long: "Chalamont Pump Station",
    address: "22001 Hwy 10",
    coordinates: `34°48'59.6"N 92°30'53.2"W`,
  },
  {
    tag: "ADAMS.SW1942CAT",
    label: "Slackwater Harbor PS",
    short: "Slackwater",
    long: "Slackwater Harbor Pump Station",
    address: "3850 Slackwater Dr",
    coordinates: `34°42'43.1"N 92°10'18.6"W`,
  },
  {
    tag: "ADAMS.SD1942CAT",
    label: "Springer Diversion Gate",
    short: "Springer",
    long: "Springer Diversion Gate",
    address: "3100 Springer Blvd",
    coordinates: `34°43'03.0"N 92°15'32.0"W`,
  },
  {
    tag: "ADAMS.CP1942CAT",
    label: "Copper Run PS",
    short: "Copper Run",
    long: "Copper Run Pump Station",
    address: "309 Copper Dr",
    coordinates: `34°44'47.7"N 92°27'26.4"W`,
  },
  {
    tag: "ADAMS.WH1942CAT",
    label: "Walton Heights",
    short: "Walton Hts",
    long: "Walton Heights",
    address: "4610 River Mountain Rd",
    coordinates: `34°47'50.7"N 92°22'56.2"W`,
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
