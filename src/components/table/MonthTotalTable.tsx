import { format, parse } from "date-fns";
import { useState, useContext } from "react";
import { api } from "~/utils/api";
import { getRainGaugeLabel, today } from "~/utils/utils";
import QueryErrorAlert from "~/components/QueryErrorAlert";
import { MdDownload } from "react-icons/md";
import { saveAs } from "file-saver";
import { GlobalAlertContext } from "../globalAlerts/GlobalAlertProvider";

const MonthTotalTable = () => {
  const addAlert = useContext(GlobalAlertContext);

  const [month, setMonth] = useState(format(today(), "yyyy-MM-dd"));
  const [queryMonth, setQueryMonth] = useState(today());

  const historyValues = api.raindata.monthTotals.useQuery({
    month: queryMonth,
  });
  const rainGauges = api.raindata.rainGauges.useQuery();

  const updateQuery = () => {
    try {
      const newMonth = parse(month, "yyyy-MM-dd", new Date());
      setQueryMonth(newMonth);
    } catch (error) {
      addAlert(String(error), "error");
      console.error(error);
    }
  };

  const downloadQueryResult = () => {
    if (historyValues.data) {
      let csvfile = '"Rain Gauge","Value (Inches)"\r\n';
      historyValues.data.readings.forEach((reading) => {
        csvfile += `"${getRainGaugeLabel(reading.label, rainGauges.data)}","${
          reading.value
        }"\r\n`;
      });

      const filename =
        "LRWRA_RainGaugeTotals_" + format(queryMonth, "yyyyMM") + ".csv";
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
                {reading.value === 0 || isNaN(Number(reading.value))
                  ? Number(0).toFixed(2)
                  : Number(reading.value).toFixed(2)}
                &quot;
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
          Rain Totals by Month
        </h1>
        <div className="m-auto max-w-xs">
          <label className="label">
            <span className="label-text">Month</span>
          </label>
          <input
            type="date"
            className="input-bordered input w-full"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
          />
        </div>
        <div className="p-4"></div>
        <div className="flex w-full justify-center">
          <div
            className={`btn-primary btn ${
              parse(month, "yyyy-MM-dd", new Date()) === queryMonth
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

export default MonthTotalTable;
