import { add, compareAsc, format, parse, sub } from "date-fns";
import React, { useState } from "react";
import LineChart from "~/components/LineChart";
import useWindowDimensions from "~/hooks/useWindowDimensions";
import { api } from "~/utils/api";
import { RainGauges } from "~/utils/constants";

const GraphPage = () => {
  const { width: wWidth, height: wHeight } = useWindowDimensions();

  const [selectedGauge, setSelectedGauge] = useState("ADAMS.AF2295LQT");
  const [samples, setSamples] = useState(500);
  const [startDate, setStartDate] = useState(sub(new Date(), { months: 1 }));
  const [endDate, setEndDate] = useState(new Date());

  const historyQuery = api.raindata.interpolatedSamples.useQuery({
    gauge: selectedGauge,
    startDate: startDate,
    endDate: endDate,
    samples: samples,
  });

  const getChartDimensions = () => ({
    width: Math.max(300, wWidth - 64),
    height: Math.max(200, wHeight * 0.6),
    margin: { top: 50, right: 50, bottom: 50, left: 50 },
  });

  const onSamplesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value
      .replace(/[^0-9.]/g, "")
      .replace(/(\..*)\./g, "$1");

    if (isNaN(+value) || +value < 0) {
      value = "0";
    }

    if (+value > 1000) {
      value = "1000";
    }

    setSamples(+value);
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
    <div>
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
            {RainGauges.map((gauge, index) => (
              <option key={index} value={gauge}>
                {gauge}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full max-w-xs">
          <label className="label">
            <span className="label-text">Samples</span>
          </label>
          <input
            type="text"
            className="input-bordered input w-full"
            value={samples}
            onChange={onSamplesChange}
            onFocus={(e) => e.target.select()}
          />
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
      <div className="min-w-sm md:mt-16">
        <LineChart
          data={historyQuery.data?.readings.map((r) => ({
            date: r.timestamp,
            value: r.value,
          }))}
          dimensions={getChartDimensions()}
        />
      </div>
    </div>
  );
};

export default GraphPage;
