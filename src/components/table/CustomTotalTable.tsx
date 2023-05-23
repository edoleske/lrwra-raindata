import { format, parse, sub } from "date-fns";
import { useState } from "react";
import { api } from "~/utils/api";
import { today } from "~/utils/utils";

const CustomTotalTable = () => {
  const [startDate, setStartDate] = useState(sub(today(), { days: 1 }));
  const [endDate, setEndDate] = useState(today());

  const historyValues = api.raindata.valueTotal.useQuery({
    startDate: startDate,
    endDate: endDate,
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
          {historyValues.data.readings.map((reading) => (
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
          Rain Totals by Date
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
        <div className="alert alert-warning mx-auto mt-8 max-w-md shadow-lg">
          <div>
            <span>Warning! This view is inaccurate beyond a few days!</span>
          </div>
        </div>
      </div>
      {DataTable()}
    </div>
  );
};

export default CustomTotalTable;
