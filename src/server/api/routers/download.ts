import { TRPCError } from "@trpc/server";
import { addDays, format } from "date-fns";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getRainGaugeLabel, pureDate } from "~/utils/utils";
import {
	handleError,
	normalizeValues,
	validateDates,
} from "~/server/api/utils";
import {
	getDailyTotalHistory,
	getDailyTotalHistoryAll,
	getRainGauges,
	getRawData,
	getRawDataAll,
} from "~/server/api/queries/raindatabase";

export const downloadRouter = createTRPCRouter({
	downloadCSV: publicProcedure
		.input(
			z.object({
				gauge: z.string(),
				startDate: z.date(),
				endDate: z.date(),
				frequency: z.number().positive().lte(60).default(1),
				normalize: z.boolean().default(false),
			}),
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
					const history = await getRawDataAll(start, end, input.frequency);

					// Get gauges that we have data for in history
					const lastRow = history.at(-1);
					if (!lastRow) throw Error("No data found for date range.");
					const lastRowLabels = lastRow.readings.map(
						(reading) => reading.label,
					);
					const gaugesIncluded = RainGaugeData.filter((rgd) =>
						lastRowLabels.includes(rgd.tag),
					);

					// Generate CSV file as string
					csvfile = `"Timestamp",${gaugesIncluded
						.map((rg) => `"${rg.label} Value (in)","${rg.label} Status %"`)
						.join(",")}\r\n`;
					for (const row of history) {
						csvfile += `"${format(
							row.timestamp,
							"yyyy-MM-dd HH:mm:ss",
						)}",${gaugesIncluded
							.map((rg) => {
								const reading = row.readings.find((r) => r.label === rg.tag);
								if (!reading) {
									return '"",""';
								}
								return `"${reading.value}","${reading.quality}"`;
							})
							.join(",")}\r\n`;
					}
				} else {
					const history = await getRawData(
						input.gauge,
						start,
						end,
						input.frequency,
					);

					if (input.normalize) {
						history.readings = normalizeValues(history.readings);
					}

					// Generate CSV file as string
					csvfile = '"Rain Gauge","Timestamp","Value","Quality"\r\n';
					for (const reading of history.readings) {
						csvfile += `"${getRainGaugeLabel(
							history.label,
							RainGaugeData,
						)}","${format(reading.timestamp, "yyyy-MM-dd HH:mm:ss")}","${
							reading.value
						}","${reading.quality}"\r\n`;
					}
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
			}),
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
					const history = await getDailyTotalHistoryAll(start, end);

					// Get gauges that we have data for in history
					const lastRow = history.at(-1);
					if (!lastRow) throw Error("No data found for date range.");
					const lastRowLabels = lastRow.readings.map(
						(reading) => reading.label,
					);
					const gaugesIncluded = RainGaugeData.filter((rgd) =>
						lastRowLabels.includes(rgd.tag),
					);

					// Generate CSV file as string
					csvfile = `"Timestamp",${gaugesIncluded
						.map((rg) => `"${rg.label} Value (in)","${rg.label} Status %"`)
						.join(",")}\r\n`;
					for (const row of history) {
						csvfile += `"${format(
							row.timestamp,
							"yyyy-MM-dd",
						)}",${gaugesIncluded
							.map((rg) => {
								const reading = row.readings.find((r) => r.label === rg.tag);
								if (!reading) {
									return '"",""';
								}
								return `"${reading.value}","${reading.quality}"`;
							})
							.join(",")}\r\n`;
					}
				} else {
					// Get single gauge history
					const history = await getDailyTotalHistory(input.gauge, start, end);

					// Generate CSV file as string
					csvfile = '"Rain Gauge","Timestamp","Value","Quality"\r\n';
					for (const reading of history.readings) {
						csvfile += `"${getRainGaugeLabel(
							history.label,
							RainGaugeData,
						)}","${format(reading.timestamp, "yyyy-MM-dd")}","${
							reading.value
						}","${reading.quality}"\r\n`;
					}
				}
				return csvfile;
			} catch (err) {
				handleError(err);
			}
		}),
});
