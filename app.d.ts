interface GaugeReading {
  label: string;
  value: number;
  quality: number;
}

interface GaugeValues {
  timestamp: Date;
  readings: GaugeReading[];
}
