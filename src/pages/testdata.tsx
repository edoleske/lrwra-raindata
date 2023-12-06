import { format, parse, sub } from "date-fns";
import { useState } from "react";
import { api } from "~/utils/api";

const TestDataPage = () => {
  const [date, setDate] = useState(sub(new Date(), { days: 1 }));

  const values = api.raindata.currentValues.useQuery();
  const historyValues = api.raindata.dateValues.useQuery({
    date: date,
  });

  if (values.isError || historyValues.isError) {
    return (
      <div>
        <h1>Test Data</h1>
        <p>Encountered an error!</p>
      </div>
    );
  }

  if (!values.data || !historyValues.data) {
    return (
      <div>
        <h1>Test Data</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <main>
      <div className="p-16">
        <h1 className="mb-8 text-center text-5xl font-bold">Test Data</h1>
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="m-auto w-fit">
            <h2 className="text-xl font-bold">Current Values</h2>
            <p className="mt-4 mb-6">
              Last updated {format(values.data.timestamp, "MM/dd/yyyy HH:mm")}
            </p>
            <table className="my-4 table">
              <thead>
                <tr>
                  <th>Gauge</th>
                  <th>Value (inches)</th>
                </tr>
              </thead>
              <tbody>
                {values.data.readings.map((reading) => (
                  <tr key={reading.label}>
                    <td>{reading.label}</td>
                    <td>{reading.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="m-auto w-fit">
            <h2 className="text-xl font-bold">Total of Date</h2>
            <input
              type="date"
              value={format(date, "yyyy-MM-dd")}
              onChange={(e) =>
                setDate(parse(e.target.value, "yyyy-MM-dd", new Date()))
              }
              className="input w-full max-w-xs"
            />
            <table className="my-4 table">
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
                    <td>{reading.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
};

export default TestDataPage;
