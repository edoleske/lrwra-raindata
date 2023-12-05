import { format, parse, sub } from "date-fns";
import { useContext, useState } from "react";
import { api } from "~/utils/api";
import { getRainGaugeLabel, today } from "~/utils/utils";
import QueryErrorAlert from "~/components/QueryErrorAlert";
import { MdDownload } from "react-icons/md";
import { saveAs } from "file-saver";
import { GlobalAlertContext } from "../globalAlerts/GlobalAlertProvider";

const CustomTotalTable = () => {
  const addAlert = useContext(GlobalAlertContext);

  const [startDate, setStartDate] = useState(
    format(sub(new Date(), { days: 2 }), "yyyy-MM-dd'T'HH:mm")
  );
  const [endDate, setEndDate] = useState(
    format(new Date(), "yyyy-MM-dd'T'HH:mm")
  );

  const [queryStartDate, setQueryStartDate] = useState(
    sub(today(), { days: 2 })
  );
  const [queryEndDate, setQueryEndDate] = useState(today());

  const updateQuery = () => {
    try {
      const start = parse(startDate, "yyyy-MM-dd'T'HH:mm", new Date());
      const end = parse(endDate, "yyyy-MM-dd'T'HH:mm", new Date());
      setQueryStartDate(start);
      setQueryEndDate(end);
    } catch (error) {
      addAlert(String(error), "error");
      console.error(error);
    }
  };

  const historyValues = api.raindata.valueTotal.useQuery({
    startDate: queryStartDate,
    endDate: queryEndDate,
  });
  const rainGauges = api.raindata.rainGauges.useQuery();

  const downloadQueryResult = () => {
    if (historyValues.data && rainGauges.data) {
      let csvfile = '"Rain Gauge","Value (Inches)"\r\n';
      historyValues.data.readings.forEach((reading) => {
        csvfile += `"${getRainGaugeLabel(reading.label, rainGauges.data)}","${
          reading.value
        }"\r\n`;
      });

      const dateString =
        format(queryStartDate, "yyyyMMdd") +
        "-" +
        format(queryEndDate, "yyyyMMdd");
      const filename = "LRWRA_RainGaugeTotals_" + dateString + ".csv";
      const blob = new Blob([csvfile], { type: "text/csv;charset=utf-8;" });

      // Uses file-saver library to use best practive file download on most browsers
      saveAs(blob, filename);
    }
  };

  const DataTable = () => {
    if (historyValues.isError) {
      return <QueryErrorAlert message={historyValues.error.message} />;
    }

    if (rainGauges.isError) {
      return <QueryErrorAlert message={rainGauges.error.message} />;
    }

    if (!historyValues.data || !rainGauges.data) {
      return (
        <div className="spinner spinner-primary spinner-xl m-auto mt-8"></div>
      );
    }

    return (
      <table className="table-zebra table-compact m-auto table w-full ">
        <thead>
          <tr>
            <th>Gauge</th>
            <th className="flex items-center justify-between">
              Value (inches)
              <span
                className="btn-xs btn-circle btn"
                onClick={downloadQueryResult}
              >
                <MdDownload size={14} />
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {historyValues.data?.readings.map((reading) => (
            <tr key={reading.label}>
              <td>{getRainGaugeLabel(reading.label, rainGauges.data)}</td>
              <td>
                {reading.value === 0 ? 0 : reading.value?.toFixed(2)}&quot;
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <div className="m-auto h-full w-full">
        <h1 className="mt-4 mb-6 text-center text-4xl font-bold">
          Rain Totals by Range
        </h1>
        <div className="m-auto max-w-xs">
          <label className="label">
            <span className="label-text">Start Date</span>
          </label>
          <input
            type="datetime-local"
            className="input-bordered input w-full"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </div>
        <div className="m-auto max-w-xs">
          <label className="label">
            <span className="label-text">End Date</span>
          </label>
          <input
            type="datetime-local"
            className="input-bordered input w-full"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </div>
        <div className="p-4"></div>
        <div className="flex w-full justify-center">
          <div
            className={`btn-primary btn ${
              parse(startDate, "yyyy-MM-dd'T'HH:mm", new Date()) ===
                queryStartDate &&
              parse(endDate, "yyyy-MM-dd'T'HH:mm", new Date()) === queryEndDate
                ? "btn-disabled"
                : ""
            }`}
            onClick={updateQuery}
          >
            Update
          </div>
        </div>
      </div>
      {DataTable()}
    </div>
  );
};

export default CustomTotalTable;
