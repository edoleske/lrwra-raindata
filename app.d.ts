type AlertSeverity = "info" | "success" | "error" | "warning";

type GlobalAlert = {
  message: string;
  severity: AlertSeverity;
};

type RainGaugeInfo = {
  tag: string;
  label: string;
  label_short: string;
  label_long: string;
  address: string;
  coordinates: string;
};

interface LabeledReading {
  label: string;
  value: number;
  quality: string;
}

interface AllGaugeValues {
  timestamp: Date;
  readings: LabeledReading[];
}

interface GaugeTotal {
  label: string;
  value: number;
}

interface AllGaugeTotals {
  startDate: Date;
  endDate: Date;
  readings: GaugeTotal[];
}

interface TimestampedReading {
  timestamp: Date;
  value: number;
  quality: string;
}

interface SingleGaugeReading {
  label: string;
  reading: TimestampedReading;
}

interface SingleGaugeHistory {
  label: string;
  readings: TimestampedReading[];
}

interface ChartDataPoint {
  date: Date;
  value: number;
}

interface ChartDimensions {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
}

interface LineGraphQueryInput {
  gauge: string;
  samples: number;
  startDate: Date;
  endDate: Date;
}

interface BarGraphQueryInput {
  gauge: string;
  monthData: boolean;
  date: Date;
}

interface RawReading {
  tag: string;
  timestamp: Date;
  value: number;
  quality: string;
}

interface RawDailyTotal {
  tag: string;
  value: number;
  date: Date;
}
