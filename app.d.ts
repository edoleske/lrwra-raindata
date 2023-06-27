type AlertSeverity = "info" | "success" | "error" | "warning";

type GlobalAlert = {
  message: string;
  severity: AlertSeverity;
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

interface GraphQueryInput {
  gauge: string;
  samples: number;
  startDate: Date;
  endDate: Date;
}
