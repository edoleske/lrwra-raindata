import { TRPCError } from "@trpc/server";
import { add, format } from "date-fns";
import { z } from "zod";
import { connection } from "~/server/db";
import {
  assertHistorianValuesSingle,
  assertHistorianValuesAll,
} from "~/server/typeValidation";
import {
  parseDatabaseHistory,
  parseDatabaseValues,
  today,
} from "~/utils/utils";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { RainGauges } from "~/utils/constants";

const handleError = (error: unknown) => {
  // String(err) works for all errors except for database errors
  // JSON.stringify gives more info on why iHistorian's OLEDB provider errored
  const parsedJSON = JSON.stringify(error);
  const message = parsedJSON === "{}" ? String(error) : parsedJSON;

  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: message,
    cause: error,
  });
};

export const rainDataRouter = createTRPCRouter({
  // This endpoint is for testing queries
  testIHist: publicProcedure.query(async () => {
    const sqlString = `
      SELECT
        timestamp,
        ADAMS.AF2295LQT.F_CV.VALUE, ADAMS.AF2295LQT.F_CV.QUALITY,
        ADAMS.AF2295LQY.F_CV.VALUE, ADAMS.AF2295LQY.F_CV.QUALITY
      FROM IHTREND
      WHERE samplingmode = rawbytime AND timestamp = '04/03/2023 01:00:00'
      ORDER BY TIMESTAMP
    `;
    try {
      const adoresult = await connection.query(sqlString);
      console.log(JSON.stringify(adoresult, null, 2));
      return { result: adoresult };
    } catch (err) {
      handleError(err);
    }
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
      assertHistorianValuesAll(result);

      const dbValues = result[0];
      if (dbValues === undefined) {
        throw new Error("No data returned from database!");
      }

      const values = parseDatabaseValues(dbValues);
      return { values };
    } catch (err) {
      handleError(err);
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
        assertHistorianValuesAll(result);

        const dbValues = result[0];
        if (dbValues === undefined) {
          throw new Error("No data returned from database!");
        }

        const values = parseDatabaseValues(dbValues);
        return { values };
      } catch (err) {
        handleError(err);
      }
    }),
  interpolatedSamples: publicProcedure
    .input(
      z.object({
        gauge: z.string(),
        startDate: z.date(),
        endDate: z.date(),
        samples: z.number().int().positive(),
      })
    )
    .query(async ({ input }) => {
      if (!RainGauges.includes(input.gauge)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `${input.gauge} is not a recognized rain gauge.`,
        });
      }

      const queryString = `
        SELECT
          timestamp, ${input.gauge}.F_CV.VALUE, ${input.gauge}.F_CV.QUALITY,
        FROM IHTREND
        WHERE samplingmode = interpolated AND 
          numberofsamples = ${Math.min(input.samples, 1000)} AND 
          timestamp >= '${format(input.startDate, "MM/dd/yyyy")}' AND 
          timestamp <= '${format(input.endDate, "MM/dd/yyyy")}'
        ORDER BY TIMESTAMP
      `;
      try {
        const result = await connection.query(queryString);
        assertHistorianValuesSingle(result, input.gauge);

        const history = parseDatabaseHistory(result, input.gauge);
        return history;
      } catch (err) {
        handleError(err);
      }
    }),
});
