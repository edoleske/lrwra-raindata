import { type RefObject, useEffect, useRef } from "react";
import * as d3 from "d3";
import { api } from "~/utils/api";

interface DataType {
  date: Date;
  value: number;
}

const dummyData: DataType[] = [
  { date: new Date(2022, 0, 1), value: 3 },
  { date: new Date(2022, 0, 15), value: 2 },
  { date: new Date(2022, 1, 1), value: 5 },
  { date: new Date(2022, 1, 15), value: 4 },
];

const drawGraph = (svgRef: RefObject<SVGSVGElement>) => {
  const svg = d3
    .select(svgRef.current)
    .attr("width", 500)
    .attr("height", 500)
    .attr("style", "background-color: #F8F8F8");

  const timeExtent = [
    Math.min(...dummyData.map((d) => d.date.getTime())),
    Math.max(...dummyData.map((d) => d.date.getTime())),
  ];

  const xScale = d3.scaleTime().domain(timeExtent).range([0, 500]);
  const yScale = d3.scaleLinear().domain([0, 6]).range([0, 500]);

  const group = svg.append("g").attr("width", 500).attr("height", 500);

  group
    .append("g")
    .selectAll("dot")
    .data(dummyData)
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale(d.date.getTime()))
    .attr("cy", (d) => yScale(d.value))
    .attr("r", 2)
    .style("fill", "#CC0000");

  group
    .append("path")
    .datum(dummyData)
    .attr("width", 20)
    .style("fill", "none")
    .style("stroke", "#CC0000")
    .style("stroke-width", 1.5)
    .attr(
      "d",
      d3
        .line<DataType>()
        .x((d) => xScale(d.date.getTime()))
        .y((d) => yScale(d.value))
        .curve(d3.curveMonotoneX)
    );
};

const clearGraph = (svgRef: RefObject<SVGSVGElement>) => {
  const svg = d3.select(svgRef.current);
  svg.selectAll("*").remove();
};

const GraphPage = () => {
  const historyQuery = api.raindata.interpolatedSamples.useQuery({
    gauge: "ADAMS.AF2295LQT",
    startDate: new Date(2023, 0, 1),
    endDate: new Date(2023, 3, 1),
    samples: 1000,
  });

  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    drawGraph(svgRef);

    return () => {
      clearGraph(svgRef);
    };
  }, [svgRef]);

  return (
    <div>
      <svg ref={svgRef}></svg>
      <p>Test: {historyQuery.data?.readings.length}</p>
    </div>
  );
};

export default GraphPage;
