import { add, compareAsc, format, parse, sub } from "date-fns";
import { saveAs } from "file-saver";
import { useContext, useState } from "react";
import { GlobalAlertContext } from "~/components/globalAlerts/GlobalAlertProvider";
import { api } from "~/utils/api";
import { RainGauges } from "~/utils/constants";

const DownloadPage = () => {
  const addAlert = useContext(GlobalAlertContext);

  const [selectedGauge, setSelectedGauge] = useState("ADAMS.AF2295LQT");
  const [startDate, setStartDate] = useState(sub(new Date(), { days: 2 }));
  const [endDate, setEndDate] = useState(new Date());
  const fileMutation = api.raindata.downloadCSV.useMutation();

  const onClick = async () => {
    const result = await fileMutation.mutateAsync(
      {
        gauge: selectedGauge,
        startDate: startDate,
        endDate: endDate,
      },
      { onError: (error) => addAlert(error.message, "error") }
    );

    if (result) {
      const filename =
        "LRWRA_RainDataExport_" +
        format(startDate, "yyyyMMdd") +
        "-" +
        format(endDate, "yyyyMMdd") +
        ".csv";
      const blob = new Blob([result], { type: "text/csv;charset=utf-8;" });

      // Uses file-saver library to use best practive file download on most browsers
      saveAs(blob, filename);
    }
  };

  const onStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parse(event.target.value, "yyyy-MM-dd", new Date());

    // If new date is before end date
    if (compareAsc(value, endDate) === -1) {
      setStartDate(value);
    } else {
      setStartDate(sub(endDate, { days: 1 }));
    }
  };

  const onEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parse(event.target.value, "yyyy-MM-dd", new Date());

    // If new date is after end date
    if (compareAsc(value, startDate) === 1) {
      if (compareAsc(value, new Date()) === 1) {
        setEndDate(new Date());
      } else {
        setEndDate(value);
      }
    } else {
      setEndDate(add(startDate, { days: 1 }));
    }
  };

  const Form = () => (
    <div className="m-auto">
      <div className="w-full max-w-xs">
        <label className="label">
          <span className="label-text">Rain Gauge</span>
        </label>
        <select
          className="select-bordered select w-full"
          value={selectedGauge}
          onChange={(e) => setSelectedGauge(e.target.value)}
        >
          {RainGauges.map((gauge, index) => (
            <option key={index} value={gauge}>
              {gauge}
            </option>
          ))}
        </select>
      </div>
      <div className="w-full max-w-xs">
        <label className="label">
          <span className="label-text">Start Date</span>
        </label>
        <input
          type="date"
          className="input-bordered input w-full"
          value={format(startDate, "yyyy-MM-dd")}
          onChange={onStartDateChange}
        />
      </div>
      <div className="w-full max-w-xs">
        <label className="label">
          <span className="label-text">End Date</span>
        </label>
        <input
          type="date"
          className="input-bordered input w-full"
          value={format(endDate, "yyyy-MM-dd")}
          onChange={onEndDateChange}
        />
      </div>
    </div>
  );

  if (fileMutation.isLoading) {
    return (
      <div className="w-full p-8 text-center">
        <h1 className="mb-8 text-4xl font-bold">Download Data</h1>
        <div className="spinner spinner-xl spinner-primary m-auto"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-8 p-8 text-center lg:px-16">
      <h1 className="text-4xl font-bold">Download Data</h1>
      <p>
        Download a CSV (Comma-separate values) file with raw data from one of
        our rain gauges.
      </p>
      <p>
        Our gauges report a single floating-point value every second
        representing the amount of rain measured that day in inches. The value
        is reset at the beginning of everyday.
      </p>
      {Form()}
      <div className="btn-primary btn" onClick={onClick}>
        Download
      </div>
    </div>
  );
};

export default DownloadPage;
