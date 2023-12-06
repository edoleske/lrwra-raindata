import { format } from "date-fns";
import { rainDataDB } from "../../knex";

export const getRainGauges = async () => {
  const result: RainGaugeInfo[] = await rainDataDB("gauges").select(
    "tag",
    "label",
    "label_short",
    "label_long",
    "address",
    "coordinates"
  );
  return result;
};

export const getDateValues = async (date: Date) => {
  const dateString = format(date, "yyyy-MM-dd 23:59:00");

  const result: LabeledReading[] = await rainDataDB("readings")
    .where("timestamp", dateString)
    .select("tag as label", "value", "quality");

  return {
    timestamp: date,
    readings: result,
  };
};
