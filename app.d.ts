interface AllGaugeValues {
  timestamp: Date;
  readings: {
    label: string;
    value: number;
    quality: string;
  }[];
}

interface SingleGaugeHistory {
  label: string;
  readings: { timestamp: Date; value: number }[];
}
