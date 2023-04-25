import { type RefObject, useEffect, useRef } from "react";
import * as d3 from "d3";
import { multiTimeFormat } from "~/utils/constants";

interface LineChartProps {
  data: ChartDataPoint[] | undefined;
  dimensions: ChartDimensions;
}

const drawGraph = (
  svgRef: RefObject<SVGSVGElement>,
  data: ChartDataPoint[],
  dimensions: ChartDimensions
) => {
  const svg = d3
    .select(svgRef.current)
    .attr("width", dimensions.width)
    .attr("height", dimensions.height);

  const boundedWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right;
  const boundedHeight =
    dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

  const timeExtent = [
    Math.min(...data.map((d) => d.date.getTime())),
    Math.max(...data.map((d) => d.date.getTime())),
  ];

  const xScale = d3
    .scaleTime()
    .domain(timeExtent)
    .range([
      dimensions.margin.left,
      dimensions.width - dimensions.margin.right,
    ]);

  const valueExtent = [
    Math.min(...data.map((d) => d.value)),
    Math.max(...data.map((d) => d.value)),
  ];

  const yScale = d3
    .scaleLinear()
    .domain(valueExtent)
    .range([
      dimensions.height - dimensions.margin.bottom,
      dimensions.margin.top,
    ]);

  const group = svg
    .append("g")
    .attr("width", boundedWidth)
    .attr("height", boundedHeight);

  // X Axis, ticks take up about 30 pixels in width
  group
    .append("g")
    .attr(
      "transform",
      `translate(0, ${dimensions.height - dimensions.margin.bottom})`
    )
    .call(
      d3
        .axisBottom(xScale)
        .ticks(Math.floor(boundedWidth / 50))
        .tickFormat(multiTimeFormat)
    )
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("transform", "rotate(-30)");

  // Y axis, simple cause linear scale
  group
    .append("g")
    .attr("transform", `translate(${dimensions.margin.left}, 0)`)
    .call(d3.axisLeft(yScale));

  group
    .append("path")
    .datum(data)
    .attr("width", 20)
    .style("fill", "none")
    .attr("class", "stroke-secondary")
    .style("stroke-width", 1.5)
    .attr(
      "d",
      d3
        .line<ChartDataPoint>()
        .x((d) => xScale(d.date.getTime()))
        .y((d) => yScale(d.value))
        .curve(d3.curveMonotoneX)
    );
};

const clearGraph = (svgRef: RefObject<SVGSVGElement>) => {
  const svg = d3.select(svgRef.current);
  svg.selectAll("*").remove();
};

const LineChart = ({ data, dimensions }: LineChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (data) {
      drawGraph(svgRef, data, dimensions);
    }

    return () => {
      clearGraph(svgRef);
    };
  }, [svgRef, data, dimensions]);

  if (!data) {
    return (
      <div className="h-full w-full text-center">
        <div className="spinner spinner-xl spinner-primary"></div>
      </div>
    );
  }

  return (
    <div className="">
      <svg ref={svgRef} className="m-auto bg-base-100 text-white"></svg>
    </div>
  );
};

export default LineChart;
