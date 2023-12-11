import { add, compareAsc, format, isSameDay, parse, sub } from "date-fns";
import { useState } from "react";
import { api } from "~/utils/api";

interface LineGraphParametersProps {
  queryInput: LineGraphQueryInput;
  setQueryInput: React.Dispatch<React.SetStateAction<LineGraphQueryInput>>;
}

const LineGraphParameters = ({
  queryInput,
  setQueryInput,
}: LineGraphParametersProps) => {
  const [selectedGauge, setSelectedGauge] = useState(queryInput.gauge);
  const [startDate, setStartDate] = useState(queryInput.startDate);
  const [endDate, setEndDate] = useState(queryInput.endDate);

  const rainGauges = api.raindata.rainGauges.useQuery();

  const updateQueryInput = () => {
    setQueryInput({
      gauge: selectedGauge,
      startDate: startDate,
      endDate: endDate,
    });
  };

  const parametersModified = () => {
    return (
      queryInput.gauge !== selectedGauge ||
      !isSameDay(queryInput.startDate, startDate) ||
      !isSameDay(queryInput.endDate, endDate)
    );
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

  return (
    <div className="flex flex-col items-center gap-4 bg-base-200 p-8 md:flex-row">
      <div className="w-full max-w-xs">
        <label className="label">
          <span className="label-text">Rain Gauge</span>
        </label>
        <select
          className="select-bordered select w-full"
          value={selectedGauge}
          onChange={(e) => setSelectedGauge(e.target.value)}
        >
          {rainGauges.data?.map((gauge, index) => (
            <option key={index} value={gauge.tag}>
              {gauge.label}
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
      <div className="mx-2 self-end">
        <div
          className={`btn-primary btn ${
            parametersModified() ? "" : "btn-disabled"
          }`}
          onClick={updateQueryInput}
        >
          Update
        </div>
      </div>
    </div>
  );
};

export default LineGraphParameters;
