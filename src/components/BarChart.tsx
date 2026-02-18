import { type RefObject, useEffect, useRef } from "react";
import * as d3 from "d3";
import { multiTimeFormat } from "~/utils/constants";
import { format, subDays, subHours } from "date-fns";

interface BarChartProps {
	data: ChartDataPoint[] | undefined;
	dimensions: ChartDimensions;
}

const drawGraph = (
	svgRef: RefObject<SVGSVGElement | null>,
	tooltipRef: RefObject<HTMLDivElement | null>,
	data: ChartDataPoint[],
	dimensions: ChartDimensions,
) => {
  if (svgRef.current === null) return;
  
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
	const adjMinTime =
		maxTime - minTime > 86400001
			? subDays(new Date(minTime), 1)
			: subHours(new Date(minTime), 1);
	const timeExtent = [adjMinTime.getTime(), new Date(maxTime).getTime()];

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
		Math.ceil(Math.max(...data.map((d) => d.value), 0.1) * 10) / 10,
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
			`translate(0, ${dimensions.height - dimensions.margin.bottom})`,
		)
		.call(
			d3
				.axisBottom(xScale)
				.ticks(Math.floor(boundedWidth / 50))
				.tickFormat(multiTimeFormat),
		)
		.selectAll("text")
		.style("text-anchor", "end")
		.attr("transform", "rotate(-30)");

	// Y axis, simple cause linear scale
	group
		.append("g")
		.attr("transform", `translate(${dimensions.margin.left}, 0)`)
		.call(d3.axisLeft(yScale).tickSize(-boundedWidth)).selectAll("line").attr("opacity", 0.2);

  // Right border
  group
		.append("g")
		.attr("transform", `translate(${boundedWidth + dimensions.margin.right}, 0)`)
		.call(
      d3
      .axisRight(yScale)
      .tickSize(0)
    )
    .selectAll("text")
    .remove();

	group
		.append("g")
		.selectAll("rect")
		.data(data)
		.join("rect")
		.attr("class", "fill-secondary")
		.attr("x", (d) => xScale(d.date) - xBand.bandwidth() / 2)
		.attr("y", (d) => yScale(d.value))
		.attr("width", xBand.bandwidth())
		.attr(
			"height",
			(d) => dimensions.height - dimensions.margin.bottom - yScale(d.value),
		);

	const tooltip = d3
		.select(tooltipRef.current)
		.style("display", "none")
		.html("<p></p><p></p>");

	group
		.selectAll("rect")
		.on("mouseover", () => {
			tooltip.style("display", "block");
		})
		.on("mousemove", (mouse: MouseEvent) => {
			const [x] = d3.pointer(mouse);

			tooltip
				.style("top", `${mouse.pageY - 30}px`)
				.style(
					"left",
					`${mouse.pageX - (maxTime - minTime > 86400001 ? 164 : 136)}px`,
				);

			// We must find the closest date point to the pointer, via the date key
			// To tie the dates with the mouse position on the chart, we take the normalized mouse position and compare it to the normalized dates in the domain
			const ratio = (x - dimensions.margin.left) / boundedWidth;
			const dataKeyRatios = data.map(
				(d) =>
					(d.date.getTime() - adjMinTime.getTime()) /
					(maxTime - adjMinTime.getTime()),
			);
			const dataKeyRatioDeltas = dataKeyRatios.map((dr) =>
				Math.abs(dr - ratio),
			);
			const dataIndex = dataKeyRatioDeltas.indexOf(
				Math.min(...dataKeyRatioDeltas),
			);
			const closestDataPoint = data[dataIndex];

			if (closestDataPoint) {
				tooltip.html(
					`<p>${format(
						closestDataPoint.date,
						maxTime - minTime > 86400001 ? "PP" : "p",
					)}</p><p>${closestDataPoint.value.toFixed(2)}"</p>`,
				);
			} else {
				tooltip.html("<p>Loading...</p>");
			}
		})
		.on("mouseout", () => {
			tooltip.style("display", "none");
		});
};

const clearGraph = (svgRef: RefObject<SVGSVGElement | null>) => {
	const svg = d3.select(svgRef.current);
	svg.selectAll("*").remove();
};

const BarChart = ({ data, dimensions }: BarChartProps) => {
	const svgRef = useRef<SVGSVGElement>(null);
	const tooltipRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (data) {
			drawGraph(svgRef, tooltipRef, data, dimensions);
		}

		return () => {
			clearGraph(svgRef);
		};
	}, [data, dimensions]);

	if (!data) {
		return (
			<div className="p-4 text-center">
				<div>No data!</div>
			</div>
		);
	}

	return (
		<div className="">
			<svg ref={svgRef} className="m-auto bg-base-100 text-base-content" />
			<div
				ref={tooltipRef}
				className="absolute rounded border border-base-content bg-base-200 px-8 py-4 text-center"
			/>
		</div>
	);
};

export default BarChart;
