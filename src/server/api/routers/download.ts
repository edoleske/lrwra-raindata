import { TRPCError } from "@trpc/server";
import { addDays, compareAsc, differenceInDays, format } from "date-fns";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  getRainGaugeLabel,
  parseDatabaseHistory,
  parseDatabaseValues,
  pureDate,
} from "~/utils/utils";
import {
  getDayTotalHistory,
  getDayTotalHistoryAll,
  getRainGauges,
  getRawData,
  getRawDataAll,
} from "../queries";
import { handleError } from "../utils";

const validateDates = (start: Date, end: Date) => {
  if (
    compareAsc(new Date(), start) !== 1 &&
    compareAsc(new Date(), end) !== 1
  ) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `No data available for the future.`,
    });
  }

  if (compareAsc(end, start) !== 1) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `End date ${format(
        end,
        "yyyy-mm-DD"
      )} is before start date ${format(start, "yyyy-mm-DD")}`,
    });
  }

  if (Math.abs(differenceInDays(start, end)) > 31) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Cannot retrieve more than 31 days of data at once.",
    });
  }
};

export const downloadRouter = createTRPCRouter({
  downloadCSV: publicProcedure
    .input(
      z.object({
        gauge: z.string(),
        startDate: z.date(),
        endDate: z.date(),
        frequency: z.number().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const RainGaugeData = await getRainGauges();
        if (
          !RainGaugeData.find((rg) => rg.tag.trim() === input.gauge.trim()) &&
          input.gauge !== "all"
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Unknown rain gauge ${input.gauge}`,
          });
        }

        const start = pureDate(input.startDate);
        const end = addDays(pureDate(input.endDate), 1);

        validateDates(start, end);

        let csvfile = "";
        if (input.gauge === "all") {
          const result = await getRawDataAll(
            start,
            end,
            input.frequency ? input.frequency : 1
          );
          const history = result.map((r) =>
            parseDatabaseValues(r, RainGaugeData)
          );

          // Generate CSV file as string
          csvfile = `"Timestamp",${RainGaugeData.map(
            (rg) => `"${rg.label} Value (in)","${rg.label} Status %"`
          ).join(",")}\r\n`;
          history.forEach((row) => {
            csvfile += `"${format(
              row.timestamp,
              "yyyy-MM-dd HH:mm:ss"
            )}",${RainGaugeData.map((rg) => {
              const reading = row.readings.find((r) => r.label === rg.tag);
              if (!reading) {
                return '"",""';
              }
              return `"${reading.value}","${reading.quality}"`;
            }).join(",")}\r\n`;
          });
        } else {
          const result = await getRawData(
            input.gauge,
            start,
            end,
            input.frequency ? input.frequency : 1
          );
          const history = parseDatabaseHistory(result, input.gauge);

          // Generate CSV file as string
          csvfile = '"Rain Gauge","Timestamp","Value","Quality"\r\n';
          history.readings.forEach((reading) => {
            csvfile += `"${getRainGaugeLabel(
              history.label,
              RainGaugeData
            )}","${format(reading.timestamp, "yyyy-MM-dd HH:mm:ss")}","${
              reading.value
            }","${reading.quality}"\r\n`;
          });
        }
        return csvfile;
      } catch (err) {
        handleError(err);
      }
    }),
  downloadDailyCSV: publicProcedure
    .input(
      z.object({
        gauge: z.string(),
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const RainGaugeData = await getRainGauges();
        if (
          !RainGaugeData.find((rg) => rg.tag.trim() === input.gauge.trim()) &&
          input.gauge !== "all"
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Unknown rain gauge ${input.gauge}`,
          });
        }

        const start = pureDate(input.startDate);
        const end = addDays(pureDate(input.endDate), 1);

        validateDates(start, end);
        let csvfile = "";
        if (input.gauge === "all") {
          // Get all gauge history
          const history = await getDayTotalHistoryAll(start, end);

          // Generate CSV file as string
          csvfile = `"Timestamp",${RainGaugeData.map(
            (rg) => `"${rg.label} Value (in)","${rg.label} Status %"`
          ).join(",")}\r\n`;
          history.forEach((row) => {
            csvfile += `"${format(
              row.timestamp,
              "yyyy-MM-dd HH:mm:ss"
            )}",${RainGaugeData.map((rg) => {
              const reading = row.readings.find((r) => r.label === rg.tag);
              if (!reading) {
                return '"",""';
              }
              return `"${reading.value}","${reading.quality}"`;
            }).join(",")}\r\n`;
          });
        } else {
          // Get single gauge history
          const history = await getDayTotalHistory(input.gauge, start, end);

          // Generate CSV file as string
          csvfile = '"Rain Gauge","Timestamp","Value","Quality"\r\n';
          history.readings.forEach((reading) => {
            csvfile += `"${getRainGaugeLabel(
              history.label,
              RainGaugeData
            )}","${format(reading.timestamp, "yyyy-MM-dd HH:mm:ss")}","${
              reading.value
            }","${reading.quality}"\r\n`;
          });
        }
        return csvfile;
      } catch (err) {
        handleError(err);
      }
    }),
});
