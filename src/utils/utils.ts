// Utility function to get new Date object with time zeroed out
export const today = () => {
  const result = new Date();
  result.setHours(0);
  result.setMinutes(0);
  result.setSeconds(0);
  result.setMilliseconds(0);
  return result;
};

// Helper function transform parsed fields from database to more useful object
export const parseDatabaseValues = (dbValues: IHistValues): GaugeValues => {
  return {
    timestamp: new Date(dbValues.timestamp),
    readings: [
      {
        label: "ADAMS.AF2295LQT",
        value: dbValues["ADAMS.AF2295LQT.F_CV.Value"],
        quality: dbValues["ADAMS.AF2295LQT.F_CV.Quality"],
      },
      {
        label: "FOURCHE.FC2295LQT",
        value: dbValues["FOURCHE.FC2295LQT.F_CV.Value"],
        quality: dbValues["FOURCHE.FC2295LQT.F_CV.Quality"],
      },
      {
        label: "ADAMS.CAB2295LQT",
        value: dbValues["ADAMS.CAB2295LQT.F_CV.Value"],
        quality: dbValues["ADAMS.CAB2295LQT.F_CV.Quality"],
      },
      {
        label: "ADAMS.AS1941CAT",
        value: dbValues["ADAMS.AS1941CAT.F_CV.Value"],
        quality: dbValues["ADAMS.AS1941CAT.F_CV.Quality"],
      },
      {
        label: "ADAMS.CR1941LQT",
        value: dbValues["ADAMS.CR1941LQT.F_CV.Value"],
        quality: dbValues["ADAMS.CR1941LQT.F_CV.Quality"],
      },
      {
        label: "ADAMS.CV1942CAT",
        value: dbValues["ADAMS.CV1942CAT.F_CV.Value"],
        quality: dbValues["ADAMS.CV1942CAT.F_CV.Quality"],
      },
      {
        label: "ADAMS.HR1942CAT",
        value: dbValues["ADAMS.HR1942CAT.F_CV.Value"],
        quality: dbValues["ADAMS.HR1942CAT.F_CV.Quality"],
      },
      {
        label: "ADAMS.JR1941CAT",
        value: dbValues["ADAMS.JR1941CAT.F_CV.Value"],
        quality: dbValues["ADAMS.JR1941CAT.F_CV.Quality"],
      },
      {
        label: "MAUMELLE.LM1941CAT",
        value: dbValues["MAUMELLE.LM1941CAT.F_CV.Value"],
        quality: dbValues["MAUMELLE.LM1941CAT.F_CV.Quality"],
      },
      {
        label: "ADAMS.RR1942CAT",
        value: dbValues["ADAMS.RR1942CAT.F_CV.Value"],
        quality: dbValues["ADAMS.RR1942CAT.F_CV.Quality"],
      },
      {
        label: "ADAMS.LF1941CAT",
        value: dbValues["ADAMS.LF1941CAT.F_CV.Value"],
        quality: dbValues["ADAMS.LF1941CAT.F_CV.Quality"],
      },
      {
        label: "ADAMS.OC1941CAT",
        value: dbValues["ADAMS.OC1941CAT.F_CV.Value"],
        quality: dbValues["ADAMS.OC1941CAT.F_CV.Quality"],
      },
      {
        label: "ADAMS.PF2295LQT",
        value: dbValues["ADAMS.PF2295LQT.F_CV.Value"],
        quality: dbValues["ADAMS.PF2295LQT.F_CV.Quality"],
      },
      {
        label: "ADAMS.TS1941CAT",
        value: dbValues["ADAMS.TS1941CAT.F_CV.Value"],
        quality: dbValues["ADAMS.TS1941CAT.F_CV.Quality"],
      },
      {
        label: "ADAMS.CM1942CAT",
        value: dbValues["ADAMS.CM1942CAT.F_CV.Value"],
        quality: dbValues["ADAMS.CM1942CAT.F_CV.Quality"],
      },
      {
        label: "ADAMS.SW1942CAT",
        value: dbValues["ADAMS.SW1942CAT.F_CV.Value"],
        quality: dbValues["ADAMS.SW1942CAT.F_CV.Quality"],
      },
      {
        label: "ADAMS.SD1942CAT",
        value: dbValues["ADAMS.SD1942CAT.F_CV.Value"],
        quality: dbValues["ADAMS.SD1942CAT.F_CV.Quality"],
      },
      {
        label: "ADAMS.CP1942CAT",
        value: dbValues["ADAMS.CP1942CAT.F_CV.Value"],
        quality: dbValues["ADAMS.CP1942CAT.F_CV.Quality"],
      },
    ],
  };
};
