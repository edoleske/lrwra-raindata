import { sub } from "date-fns";
import React, { useRef, useState } from "react";
import LineChart from "~/components/LineChart";
import GraphParameters from "~/components/graph/GraphParameters";
import useWindowDimensions from "~/hooks/useWindowDimensions";
import { api } from "~/utils/api";

const GraphPage = () => {
  const divRef = useRef<HTMLDivElement>(null);
  const { height: wHeight } = useWindowDimensions();

  const [queryInput, setQueryInput] = useState({
    gauge: "ADAMS.AF2295LQT",
    samples: 200,
    startDate: sub(new Date(), { months: 1 }),
    endDate: new Date(),
  });

  const historyQuery = api.raindata.interpolatedSamples.useQuery(queryInput);

  const getChartDimensions = () => ({
    width: Math.max(300, (divRef.current?.clientWidth ?? 0) - 64),
    height: Math.max(200, wHeight * 0.6),
    margin: { top: 50, right: 50, bottom: 50, left: 50 },
  });

  return (
    <>
      <GraphParameters queryInput={queryInput} setQueryInput={setQueryInput} />

      <div className="min-w-sm" ref={divRef}>
        <LineChart
          data={historyQuery.data?.readings.map((r) => ({
            date: r.timestamp,
            value: r.value,
          }))}
          dimensions={getChartDimensions()}
        />
      </div>
    </>
  );
};

export default GraphPage;
