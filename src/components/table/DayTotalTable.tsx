import { format, parse } from "date-fns";
import { saveAs } from "file-saver";
import { useContext, useState } from "react";
import { api } from "~/utils/api";
import { getRainGaugeLabel, today } from "~/utils/utils";
import QueryErrorAlert from "../QueryErrorAlert";
import { MdDownload } from "react-icons/md";
import { GlobalAlertContext } from "../globalAlerts/GlobalAlertProvider";

const DayTotalTable = () => {
  const addAlert = useContext(GlobalAlertContext);

  const [date, setDate] = useState(format(today(), "yyyy-MM-dd"));
  const [queryDate, setQueryDate] = useState(today());

  const updateQuery = () => {
    try {
      const newDate = parse(date, "yyyy-MM-dd", new Date());
      setQueryDate(newDate);
    } catch (error) {
      addAlert(String(error), "error");
      console.error(error);
    }
  };

  const historyValues = api.raindata.dateValues.useQuery({
    date: queryDate,
  });

  const downloadQueryResult = () => {
    if (historyValues.data) {
      let csvfile = '"Rain Gauge","Value (Inches)"\r\n';
      historyValues.data.values.readings.forEach((reading) => {
        csvfile += `"${getRainGaugeLabel(reading.label)}","${
          reading.value
        }"\r\n`;
      });

      const filename =
        "LRWRA_RainGaugeTotals_" + format(queryDate, "yyyyMMdd") + ".csv";
      const blob = new Blob([csvfile], { type: "text/csv;charset=utf-8;" });

      // Uses file-saver library to use best practive file download on most browsers
      saveAs(blob, filename);
    }
  };

  const DataTable = () => {
    if (historyValues.isError) {
      return <QueryErrorAlert message={historyValues.error.message} />;
    }

    if (!historyValues.data) {
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
          {historyValues.data.values.readings.map((reading) => (
            <tr key={reading.label}>
              <td>{getRainGaugeLabel(reading.label)}</td>
              <td>
                {reading.value === 0 ? 0 : reading.value.toFixed(2)}&quot;
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
          Rain Totals by Date
        </h1>
        <div className="m-auto max-w-xs">
          <label className="label">
            <span className="label-text">Date</span>
          </label>
          <input
            type="date"
            className="input-bordered input w-full"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </div>
        <div className="p-4"></div>
        <div className="flex w-full justify-center">
          <div
            className={`btn-primary btn ${
              parse(date, "yyyy-MM-dd", new Date()) === queryDate
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

export default DayTotalTable;
