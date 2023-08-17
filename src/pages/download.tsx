import { compareAsc, format, parse } from "date-fns";
import { saveAs } from "file-saver";
import { useContext, useState } from "react";
import { BsCalendarEvent, BsCalendarWeek } from "react-icons/bs";
import { GlobalAlertContext } from "~/components/globalAlerts/GlobalAlertProvider";
import { api } from "~/utils/api";
import { RainGaugeData } from "~/utils/constants";
import { getRainGaugeLabelShort } from "~/utils/utils";

const DownloadPage = () => {
  const addAlert = useContext(GlobalAlertContext);

  const [selectedGauge, setSelectedGauge] = useState("ADAMS.AF2295LQT");
  const [dateRange, setDateRange] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [frequency, setFrequency] = useState(1);
  const fileMutation = api.raindata.downloadCSV.useMutation();

  const onClick = async () => {
    const result = await fileMutation.mutateAsync(
      {
        gauge: selectedGauge,
        startDate: startDate,
        endDate: endDate,
        frequency: frequency,
      },
      { onError: (error) => addAlert(error.message, "error") }
    );

    if (result) {
      const gaugeString = getRainGaugeLabelShort(selectedGauge, true);
      let dateString = format(startDate, "yyyyMMdd");
      if (dateRange) {
        dateString += "-" + format(endDate, "yyyyMMdd");
      }
      const filename =
        "LRWRA_" + gaugeString + "RainData_" + dateString + ".csv";
      const blob = new Blob([result], { type: "text/csv;charset=utf-8;" });

      // Uses file-saver library to use best practive file download on most browsers
      saveAs(blob, filename);
    }
  };

  const toggleDateRange = () => {
    setDateRange((dr) => {
      if (dr) {
        setEndDate(startDate);
      }
      return !dr;
    });
  };

  const onDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parse(event.target.value, "yyyy-MM-dd", new Date());

    // If new date is after current date
    if (compareAsc(value, new Date()) === 1) {
      setStartDate(new Date());
      setEndDate(new Date());
    } else {
      setStartDate(value);
      setEndDate(value);
    }
  };

  const onStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parse(event.target.value, "yyyy-MM-dd", new Date());

    // If new date is before end date
    if (compareAsc(value, endDate) === -1) {
      setStartDate(value);
    } else {
      setStartDate(endDate);
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
      setEndDate(startDate);
    }
  };

  const DateForm = () => {
    if (dateRange) {
      return (
        <div className="flex flex-col gap-2 md:flex-row">
          <div className="flex items-end gap-2">
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
            <div className="tooltip" data-tip="Use Single Date">
              <div className="btn" onClick={toggleDateRange}>
                <BsCalendarEvent size={18} />
              </div>
            </div>
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
    } else {
      return (
        <div className="flex items-end gap-2">
          <div className="w-full max-w-xs">
            <label className="label">
              <span className="label-text">Date</span>
            </label>
            <input
              type="date"
              className="input-bordered input w-full"
              value={format(startDate, "yyyy-MM-dd")}
              onChange={onDateChange}
            />
          </div>
          <div className="tooltip" data-tip="Use Date Range">
            <div className="btn" onClick={toggleDateRange}>
              <BsCalendarWeek size={18} />
            </div>
          </div>
        </div>
      );
    }
  };

  const Form = () => (
    <div className="m-auto flex-col items-center justify-center">
      <div className="m-auto w-full max-w-xs md:ml-0">
        <label className="label">
          <span className="label-text">Rain Gauge</span>
        </label>
        <select
          className="select-bordered select w-full"
          value={selectedGauge}
          onChange={(e) => setSelectedGauge(e.target.value)}
        >
          {RainGaugeData.map((gauge, index) => (
            <option key={index} value={gauge.tag}>
              {gauge.label}
            </option>
          ))}
        </select>
      </div>
      {DateForm()}
      <div className="m-auto w-full max-w-xs md:ml-0">
        <label className="label">
          <span className="label-text">Sample Frequency</span>
        </label>
        <select
          className="select-bordered select w-full"
          value={frequency}
          onChange={(e) => setFrequency(+e.currentTarget.value)}
        >
          <option value={1}>Every minute</option>
          <option value={5}>Every 5 minutes</option>
          <option value={10}>Every 10 minutes</option>
          <option value={15}>Every 15 minutes</option>
          <option value={30}>Every 30 minutes</option>
          <option value={60}>Every hour</option>
        </select>
      </div>
    </div>
  );

  if (fileMutation.isLoading) {
    return (
      <div className="w-full p-8 text-center">
        <h1 className="mb-8 text-4xl font-bold">Download Data</h1>
        {dateRange && (
          <p className="mb-4">
            Loading your data! Please be patient as this can take up 30 seconds.
          </p>
        )}
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
        is reset at the beginning of every day.
      </p>
      {Form()}
      <div className="btn-primary btn" onClick={onClick}>
        Download
      </div>
    </div>
  );
};

export default DownloadPage;
