import { format, parse, sub } from "date-fns";
import { useState } from "react";
import { api } from "~/utils/api";
import { today } from "~/utils/utils";
import QueryErrorAlert from "~/components/QueryErrorAlert";

const CustomTotalTable = () => {
  const [startDate, setStartDate] = useState(sub(today(), { days: 2 }));
  const [endDate, setEndDate] = useState(today());

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
        <h1 className="mt-4 mb-6 text-center text-4xl font-bold">
          Rain Totals Between Dates
        </h1>
        <div className="m-auto max-w-xs">
          <label className="label">
            <span className="label-text">Start Date</span>
          </label>
          <input
            type="date"
            className="input-bordered input w-full"
            value={format(startDate, "yyyy-MM-dd")}
            onChange={(event) =>
              setStartDate(parse(event.target.value, "yyyy-MM-dd", new Date()))
            }
          />
        </div>
        <div className="m-auto max-w-xs">
          <label className="label">
            <span className="label-text">End Date</span>
          </label>
          <input
            type="date"
            className="input-bordered input w-full"
            value={format(endDate, "yyyy-MM-dd")}
            onChange={(event) =>
              setEndDate(parse(event.target.value, "yyyy-MM-dd", new Date()))
            }
          />
        </div>
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
