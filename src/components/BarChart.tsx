import { type RefObject, useEffect, useRef } from "react";
import * as d3 from "d3";
import { multiTimeFormat } from "~/utils/constants";
import { format, subDays, subHours } from "date-fns";

interface BarChartProps {
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

  const timeDomain = data.map((d) => d.date.getTime());
  const minTime = Math.min(...timeDomain);
  const maxTime = Math.max(...timeDomain);
  // Subtract one time tick so bars don't intersect y axis
  const timeExtent = [
    maxTime - minTime > 86400001
      ? subDays(new Date(minTime), 1)
      : subHours(new Date(minTime), 1),
    new Date(maxTime),
  ];
  timeExtent.forEach((d) => d.getTime());

  const xScale = d3
    .scaleTime()
    .domain(timeExtent)
    .range([
      dimensions.margin.left,
      dimensions.width - dimensions.margin.right,
    ]);

  const xBand = d3
    .scaleBand()
    .domain(data.map((d) => format(d.date, "yyyy-MM-dd HH:mm")))
    .range([dimensions.margin.left, dimensions.width - dimensions.margin.right])
    .padding(0.4);

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
    .append("g")
    .selectAll("rect")
    .data(data)
    .join("rect")
    .attr("class", "fill-secondary")
    .attr("x", (d) => xScale(d.date) - xBand.bandwidth() / 2)
    .attr("y", (d) => yScale(d.value))
    .attr("width", xBand.bandwidth())
    .attr("height", (d) => yScale(0) - yScale(d.value));
};

const clearGraph = (svgRef: RefObject<SVGSVGElement>) => {
  const svg = d3.select(svgRef.current);
  svg.selectAll("*").remove();
};

const BarChart = ({ data, dimensions }: BarChartProps) => {
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
      <div className="p-4 text-center">
        <div>No data!</div>
      </div>
    );
  }

  return (
    <div className="">
      <svg ref={svgRef} className="m-auto bg-base-100 text-base-content"></svg>
    </div>
  );
};

export default BarChart;
