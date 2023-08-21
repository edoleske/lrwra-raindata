import { format, parse } from "date-fns";
import { useState } from "react";
import { api } from "~/utils/api";
import { getRainGaugeLabel, today } from "~/utils/utils";
import QueryErrorAlert from "~/components/QueryErrorAlert";
import { MdDownload } from "react-icons/md";
import { saveAs } from "file-saver";

const MonthTotalTable = () => {
  const [month, setMonth] = useState(today());
  const [queryMonth, setQueryMonth] = useState(today());

  const historyValues = api.raindata.monthValues.useQuery({
    month: queryMonth,
  });

  const onDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let newDate = parse(event.target.value, "yyyy-MM-dd", new Date());
    if (newDate >= new Date()) {
      newDate = new Date();
    }
    setMonth(newDate);
  };

  const downloadQueryResult = () => {
    if (historyValues.data) {
      let csvfile = '"Rain Gauge","Value (Inches)"\r\n';
      historyValues.data.totals.readings.forEach((reading) => {
        csvfile += `"${getRainGaugeLabel(reading.label)}","${
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
          {historyValues.data.totals.readings.map((reading) => (
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
          Rain Totals by Month
        </h1>
        <div className="m-auto max-w-xs">
          <label className="label">
            <span className="label-text">Month</span>
          </label>
          <input
            type="date"
            className="input-bordered input w-full"
            value={format(month, "yyyy-MM-dd")}
            onChange={onDateChange}
          />
        </div>
        <div className="p-4"></div>
        <div className="flex w-full justify-center">
          <div
            className={`btn-primary btn ${
              month === queryMonth ? "btn-disabled" : ""
            }`}
            onClick={() => setQueryMonth(month)}
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
