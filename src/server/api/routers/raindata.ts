import { TRPCError } from "@trpc/server";
import { add, format } from "date-fns";
import { z } from "zod";
import { connection } from "~/server/db";
import { assertHistorianValues } from "~/server/typeValidation";
import { today } from "~/utils/utils";
import { createTRPCRouter, publicProcedure } from "../trpc";

// Helper function transform parsed fields from database to more useful object
const parseDatabaseValues = (dbValues: IHistValues): GaugeValues => {
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

export const rainDataRouter = createTRPCRouter({
  // This endpoint is for testing queries
  testIHist: publicProcedure.query(async () => {
    const sqlString = `
      SELECT TOP 1
        timestamp,
        ADAMS.AF2295LQT.F_CV.VALUE, ADAMS.AF2295LQT.F_CV.QUALITY,
        ADAMS.AF2295LQY.F_CV.VALUE, ADAMS.AF2295LQY.F_CV.QUALITY
      FROM IHTREND
      WHERE samplingmode = interpolated 
      ORDER BY TIMESTAMP DESC
    `;
    const adoresult = await connection.query(sqlString);
    console.log(JSON.stringify(adoresult, null, 2));
    return { result: adoresult };
  }),
  // Gets the most recent readings for each gauge
  currentValues: publicProcedure.query(async () => {
    const queryString = `
      SELECT TOP 1
        timestamp,
        ADAMS.AF2295LQT.F_CV.VALUE, ADAMS.AF2295LQT.F_CV.QUALITY,
        FOURCHE.FC2295LQT.F_CV.VALUE, FOURCHE.FC2295LQT.F_CV.QUALITY, 
        ADAMS.CAB2295LQT.F_CV.VALUE, ADAMS.CAB2295LQT.F_CV.QUALITY, 
        ADAMS.AS1941CAT.F_CV.VALUE, ADAMS.AS1941CAT.F_CV.QUALITY, 
        ADAMS.CR1941LQT.F_CV.VALUE, ADAMS.CR1941LQT.F_CV.QUALITY, 
        ADAMS.CV1942CAT.F_CV.VALUE, ADAMS.CV1942CAT.F_CV.QUALITY, 
        ADAMS.HR1942CAT.F_CV.VALUE, ADAMS.HR1942CAT.F_CV.QUALITY, 
        ADAMS.JR1941CAT.F_CV.VALUE, ADAMS.JR1941CAT.F_CV.QUALITY, 
        MAUMELLE.LM1941CAT.F_CV.VALUE, MAUMELLE.LM1941CAT.F_CV.QUALITY,
        ADAMS.RR1942CAT.F_CV.VALUE, ADAMS.RR1942CAT.F_CV.QUALITY, 
        ADAMS.LF1941CAT.F_CV.VALUE, ADAMS.LF1941CAT.F_CV.QUALITY, 
        ADAMS.OC1941CAT.F_CV.VALUE, ADAMS.OC1941CAT.F_CV.QUALITY, 
        ADAMS.PF2295LQT.F_CV.VALUE, ADAMS.PF2295LQT.F_CV.QUALITY, 
        ADAMS.TS1941CAT.F_CV.VALUE, ADAMS.TS1941CAT.F_CV.QUALITY, 
        ADAMS.CM1942CAT.F_CV.VALUE, ADAMS.CM1942CAT.F_CV.QUALITY, 
        ADAMS.SW1942CAT.F_CV.VALUE, ADAMS.SW1942CAT.F_CV.QUALITY, 
        ADAMS.SD1942CAT.F_CV.VALUE, ADAMS.SD1942CAT.F_CV.QUALITY, 
        ADAMS.CP1942CAT.F_CV.VALUE, ADAMS.CP1942CAT.F_CV.QUALITY 
      FROM IHTREND 
      WHERE samplingmode = interpolated 
      ORDER BY TIMESTAMP DESC
    `;

    try {
      const result = await connection.query(queryString);
      assertHistorianValues(result);

      const dbValues = result[0];
      if (dbValues === undefined) {
        throw new Error("No data returned from database!");
      }

      const values = parseDatabaseValues(dbValues);
      return { values };
    } catch (err) {
      // String(err) works for all errors except for database errors
      // JSON.stringify gives more info on why iHistorian's OLEDB provider errored
      const parsedJSON = JSON.stringify(err);
      const message = parsedJSON === "{}" ? String(err) : parsedJSON;

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: message,
        cause: err,
      });
    }
  }),
  // Gets the daily accured value for a given date, date must be before the current date
  dateValues: publicProcedure
    .input(z.object({ date: z.date() }))
    .query(async ({ input }) => {
      if (input.date >= today()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Input date must be before the current date.",
        });
      }

      const queryString = `
      SELECT TOP 1
        timestamp,
        ADAMS.AF2295LQT.F_CV.VALUE, ADAMS.AF2295LQT.F_CV.QUALITY,
        FOURCHE.FC2295LQT.F_CV.VALUE, FOURCHE.FC2295LQT.F_CV.QUALITY, 
        ADAMS.CAB2295LQT.F_CV.VALUE, ADAMS.CAB2295LQT.F_CV.QUALITY, 
        ADAMS.AS1941CAT.F_CV.VALUE, ADAMS.AS1941CAT.F_CV.QUALITY, 
        ADAMS.CR1941LQT.F_CV.VALUE, ADAMS.CR1941LQT.F_CV.QUALITY, 
        ADAMS.CV1942CAT.F_CV.VALUE, ADAMS.CV1942CAT.F_CV.QUALITY, 
        ADAMS.HR1942CAT.F_CV.VALUE, ADAMS.HR1942CAT.F_CV.QUALITY, 
        ADAMS.JR1941CAT.F_CV.VALUE, ADAMS.JR1941CAT.F_CV.QUALITY, 
        MAUMELLE.LM1941CAT.F_CV.VALUE, MAUMELLE.LM1941CAT.F_CV.QUALITY,
        ADAMS.RR1942CAT.F_CV.VALUE, ADAMS.RR1942CAT.F_CV.QUALITY, 
        ADAMS.LF1941CAT.F_CV.VALUE, ADAMS.LF1941CAT.F_CV.QUALITY, 
        ADAMS.OC1941CAT.F_CV.VALUE, ADAMS.OC1941CAT.F_CV.QUALITY, 
        ADAMS.PF2295LQT.F_CV.VALUE, ADAMS.PF2295LQT.F_CV.QUALITY, 
        ADAMS.TS1941CAT.F_CV.VALUE, ADAMS.TS1941CAT.F_CV.QUALITY, 
        ADAMS.CM1942CAT.F_CV.VALUE, ADAMS.CM1942CAT.F_CV.QUALITY, 
        ADAMS.SW1942CAT.F_CV.VALUE, ADAMS.SW1942CAT.F_CV.QUALITY, 
        ADAMS.SD1942CAT.F_CV.VALUE, ADAMS.SD1942CAT.F_CV.QUALITY, 
        ADAMS.CP1942CAT.F_CV.VALUE, ADAMS.CP1942CAT.F_CV.QUALITY 
      FROM IHTREND 
      WHERE TIMESTAMP >= '${format(
        add(input.date, { days: 1 }),
        "MM/dd/yyyy"
      )}' AND TIMESTAMP < ${format(
        add(input.date, { days: 2 }),
        "MM/dd/yyyy"
      )} AND samplingmode = interpolated 
      ORDER BY TIMESTAMP ASC
    `;
      try {
        const result = await connection.query(queryString);
        assertHistorianValues(result);

        const dbValues = result[0];
        if (dbValues === undefined) {
          throw new Error("No data returned from database!");
        }

        const values = parseDatabaseValues(dbValues);
        return { values };
      } catch (err) {
        // String(err) works for all errors except for database errors
        // JSON.stringify gives more info on why iHistorian's OLEDB provider errored
        const parsedJSON = JSON.stringify(err);
        const message = parsedJSON === "{}" ? String(err) : parsedJSON;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: message,
          cause: err,
        });
      }
    }),
});
