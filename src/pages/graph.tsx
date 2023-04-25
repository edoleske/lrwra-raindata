import { type RefObject, useEffect, useRef } from "react";
import * as d3 from "d3";
import { api } from "~/utils/api";

interface DataType {
  date: Date;
  value: number;
}

const drawGraph = (svgRef: RefObject<SVGSVGElement>, data: DataType[]) => {
  const svg = d3
    .select(svgRef.current)
    .attr("width", 500)
    .attr("height", 500)
    .attr("style", "background-color: #F8F8F8");

  const timeExtent = [
    Math.min(...data.map((d) => d.date.getTime())),
    Math.max(...data.map((d) => d.date.getTime())),
  ];

  const xScale = d3.scaleTime().domain(timeExtent).range([0, 500]);

  const valueExtent = [
    Math.min(...data.map((d) => d.value)),
    Math.max(...data.map((d) => d.value)),
  ];

  const yScale = d3.scaleLinear().domain(valueExtent).range([500, 0]);

  const group = svg.append("g").attr("width", 500).attr("height", 500);

  // group
  //   .append("g")
  //   .selectAll("dot")
  //   .data(data)
  //   .enter()
  //   .append("circle")
  //   .attr("cx", (d) => xScale(d.date.getTime()))
  //   .attr("cy", (d) => yScale(d.value))
  //   .attr("r", 2)
  //   .style("fill", "#CC0000");

  group
    .append("g")
    .attr("transform", "translate(0,450)")
    .call(d3.axisBottom(xScale));
  group
    .append("g")
    .attr("transform", "translate(50,0)")
    .call(d3.axisLeft(yScale).ticks(5));

  group
    .append("path")
    .datum(data)
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
    startDate: new Date(2023, 2, 1),
    endDate: new Date(2023, 3, 1),
    samples: 1000,
  });

  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (historyQuery.data) {
      drawGraph(
        svgRef,
        historyQuery.data.readings.map((reading) => ({
          date: reading.timestamp,
          value: reading.value,
        }))
      );
    }

    return () => {
      clearGraph(svgRef);
    };
  }, [svgRef, historyQuery.data]);

  return (
    <div>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default GraphPage;
