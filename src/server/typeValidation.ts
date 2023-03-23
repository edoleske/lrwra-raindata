// When we get query results via node-adodb, we need to parse the results into known types for validation

export function assertHistorianValues(
  input: unknown
): asserts input is IHistValues[] {
  if (!Array.isArray(input)) throw new Error("Input is not an array!");

  input.forEach((element) => {
    if (
      !("timestamp" in element) ||
      !("ADAMS.AF2295LQT.F_CV.Value" in element) ||
      !("ADAMS.AF2295LQT.F_CV.Quality" in element) ||
      !("FOURCHE.FC2295LQT.F_CV.Value" in element) ||
      !("FOURCHE.FC2295LQT.F_CV.Quality" in element) ||
      !("ADAMS.CAB2295LQT.F_CV.Value" in element) ||
      !("ADAMS.CAB2295LQT.F_CV.Quality" in element) ||
      !("ADAMS.AS1941CAT.F_CV.Value" in element) ||
      !("ADAMS.AS1941CAT.F_CV.Quality" in element) ||
      !("ADAMS.CR1941LQT.F_CV.Value" in element) ||
      !("ADAMS.CR1941LQT.F_CV.Quality" in element) ||
      !("ADAMS.CV1942CAT.F_CV.Value" in element) ||
      !("ADAMS.CV1942CAT.F_CV.Quality" in element) ||
      !("ADAMS.HR1942CAT.F_CV.Value" in element) ||
      !("ADAMS.HR1942CAT.F_CV.Quality" in element) ||
      !("ADAMS.JR1941CAT.F_CV.Value" in element) ||
      !("ADAMS.JR1941CAT.F_CV.Quality" in element) ||
      !("MAUMELLE.LM1941CAT.F_CV.Value" in element) ||
      !("MAUMELLE.LM1941CAT.F_CV.Quality" in element) ||
      !("ADAMS.RR1942CAT.F_CV.Value" in element) ||
      !("ADAMS.RR1942CAT.F_CV.Quality" in element) ||
      !("ADAMS.LF1941CAT.F_CV.Value" in element) ||
      !("ADAMS.LF1941CAT.F_CV.Quality" in element) ||
      !("ADAMS.OC1941CAT.F_CV.Value" in element) ||
      !("ADAMS.OC1941CAT.F_CV.Quality" in element) ||
      !("ADAMS.PF2295LQT.F_CV.Value" in element) ||
      !("ADAMS.PF2295LQT.F_CV.Quality" in element) ||
      !("ADAMS.TS1941CAT.F_CV.Value" in element) ||
      !("ADAMS.TS1941CAT.F_CV.Quality" in element) ||
      !("ADAMS.CM1942CAT.F_CV.Value" in element) ||
      !("ADAMS.CM1942CAT.F_CV.Quality" in element) ||
      !("ADAMS.SW1942CAT.F_CV.Value" in element) ||
      !("ADAMS.SW1942CAT.F_CV.Quality" in element) ||
      !("ADAMS.SD1942CAT.F_CV.Value" in element) ||
      !("ADAMS.SD1942CAT.F_CV.Quality" in element) ||
      !("ADAMS.CP1942CAT.F_CV.Value" in element) ||
      !("ADAMS.CP1942CAT.F_CV.Quality" in element)
    ) {
      throw new Error(
        "Input is missing property from CurrentValues interface!"
      );
    }
  });
}
