import { format, parse } from "date-fns";
import { useState } from "react";
import { api } from "~/utils/api";

const MonthTotalTable = () => {
  const [month, setMonth] = useState(
    parse("2023-05-11", "yyyy-MM-dd", new Date())
  );

  const historyValues = api.raindata.monthValues.useQuery({
    month: month,
  });

  if (historyValues.isError) {
    return (
      <div>
        <p>Encountered an error!</p>
      </div>
    );
  }

  const DataTable = () => {
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
            <th>Value (inches)</th>
          </tr>
        </thead>
        <tbody>
          {historyValues.data.totals.readings.map((reading) => (
            <tr key={reading.label}>
              <td>{reading.label}</td>
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
        <h1 className="mb-6 text-center text-4xl font-bold">
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
            onChange={(event) =>
              setMonth(parse(event.target.value, "yyyy-MM-dd", new Date()))
            }
          />
        </div>
      </div>
      {DataTable()}
    </div>
  );
};

export default MonthTotalTable;
