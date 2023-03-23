interface GaugeReading {
  label: string;
  value: number;
  quality: number;
}

interface CurrentValues {
  timestamp: Date;
  readings: GaugeReading[];
  "ADAMS.AF2295LQT"?: number;
  "FOURCHE.FC2295LQT"?: number;
  "ADAMS.CAB2295LQT"?: number;
  "ADAMS.AS1941CAT"?: number;
  "ADAMS.CR1941LQT"?: number;
  "ADAMS.CV1942CAT"?: number;
  "ADAMS.HR1942CAT"?: number;
  "ADAMS.JR1941CAT"?: number;
  "MAUMELLE.LM1941CAT"?: number;
  "ADAMS.RR1942CAT"?: number;
  "ADAMS.LF1941CAT"?: number;
  "ADAMS.OC1941CAT"?: number;
  "ADAMS.PF2295LQT"?: number;
  "ADAMS.TS1941CAT"?: number;
  "ADAMS.CM1942CAT"?: number;
  "ADAMS.SW1942CAT"?: number;
  "ADAMS.SD1942CAT"?: number;
  "ADAMS.CP1942CAT"?: number;
}
