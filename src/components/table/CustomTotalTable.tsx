import { format, parse, sub } from "date-fns";
import { useState } from "react";
import { api } from "~/utils/api";
import { getRainGaugeLabel, today } from "~/utils/utils";
import QueryErrorAlert from "~/components/QueryErrorAlert";
import { MdDownload, MdWarning } from "react-icons/md";
import { saveAs } from "file-saver";

const CustomTotalTable = () => {
  const [startDate, setStartDate] = useState(sub(new Date(), { days: 2 }));
  const [endDate, setEndDate] = useState(new Date());

  const [queryStartDate, setQueryStartDate] = useState(
    sub(today(), { days: 2 })
  );
  const [queryEndDate, setQueryEndDate] = useState(today());

  const updateQuery = () => {
    setQueryStartDate(startDate);
    setQueryEndDate(endDate);
  };

  const historyValues = api.raindata.valueTotal.useQuery({
    startDate: queryStartDate,
    endDate: queryEndDate,
  });

  const downloadQueryResult = () => {
    if (historyValues.data) {
      let csvfile = '"Rain Gauge","Value (Inches)"\r\n';
      historyValues.data.readings.forEach((reading) => {
        csvfile += `"${getRainGaugeLabel(reading.label)}","${
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

  const isDateCloseToMidnight = () =>
    (startDate.getHours() === 0 && startDate.getMinutes() < 6) ||
    (endDate.getHours() === 0 && endDate.getMinutes() < 6);

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
          {historyValues.data.readings.map((reading) => (
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
          Rain Totals by Range
        </h1>
        <div className="m-auto max-w-xs">
          <label className="label">
            <span className="label-text">Start Date</span>
          </label>
          <input
            type="datetime-local"
            className="input-bordered input w-full"
            value={format(startDate, "yyyy-MM-dd'T'HH:mm")}
            onChange={(event) =>
              setStartDate(
                parse(event.target.value, "yyyy-MM-dd'T'HH:mm", new Date())
              )
            }
          />
        </div>
        <div className="m-auto max-w-xs">
          <label className="label">
            <span className="label-text">End Date</span>
          </label>
          <input
            type="datetime-local"
            className="input-bordered input w-full"
            value={format(endDate, "yyyy-MM-dd'T'HH:mm")}
            onChange={(event) =>
              setEndDate(
                parse(event.target.value, "yyyy-MM-dd'T'HH:mm", new Date())
              )
            }
          />
        </div>
        {isDateCloseToMidnight() && (
          <div className="alert alert-warning mt-8">
            <MdWarning size={28} className="h-6 w-6 shrink-0" />
            <span>
              Due to limitations with our rain gauges, using a time between
              12:00 AM and 12:05 AM can lead to inaccurate results.
            </span>
          </div>
        )}
        <div className="p-4"></div>
        <div className="flex w-full justify-center">
          <div
            className={`btn-primary btn ${
              startDate === queryStartDate && endDate === queryEndDate
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
