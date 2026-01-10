import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';

const ScatterPlot = ({ 
    data, 
    metricX = 'salary', 
    metricY = 'estimated_monthly_cost_single',
    labelX = 'Average Monthly Net Salary (USD)',
    labelY = 'Estimated Monthly Costs (USD)'
}) => {
    const svgRef = useRef();
    const containerRef = useRef();
    const [tooltip, setTooltip] = useState(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 500 });

    // Handle Resize
    useEffect(() => {
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver(entries => {
            if (!entries || entries.length === 0) return;
            const { width } = entries[0].contentRect;
            if (width > 0) {
                setDimensions(d => ({ ...d, width }));
            }
        });

        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => {
        if (!data || data.length === 0 || dimensions.width === 0) return;

        // Filter valid data
        const validData = data.filter(d => 
            d[metricX] > 0 && d[metricY] > 0
        );

        const { width, height } = dimensions;
        const margin = { top: 40, right: 100, bottom: 60, left: 80 };

        // Clear previous
        d3.select(svgRef.current).selectAll('*').remove();

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', [0, 0, width, height])
            .style('background', 'transparent')
            .style('border-radius', '8px');

        // Statistics
        const medianX = d3.median(validData, d => d[metricX]);
        const medianY = d3.median(validData, d => d[metricY]);

        // Scales
        const xScale = d3.scaleLinear()
            .domain([0, d3.max(validData, d => d[metricX]) * 1.05])
            .range([margin.left, width - margin.right]);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(validData, d => d[metricY]) * 1.05])
            .range([height - margin.bottom, margin.top]);

        // Color Scale (Ratio based)
        // Ratio = X / Y (e.g. Salary / Cost). Higher is better.
        const colorScale = d3.scaleSequential(d3.interpolateRdYlBu)
            .domain([0.5, 3]); 

        // Zoom Behavior
        const zoom = d3.zoom()
            .scaleExtent([0.5, 5])
            .extent([[margin.left, 0], [width - margin.right, height]])
            .on("zoom", zoomed);

        svg.call(zoom);

        // Unique unique clip ID to avoid conflicts
        const clipId = 'scatter-clip-' + Math.random().toString(36).substr(2, 9);

        svg.append("defs").append("clipPath")
            .attr("id", clipId)
            .append("rect")
            .attr("x", margin.left)
            .attr("y", margin.top)
            .attr("width", width - margin.left - margin.right)
            .attr("height", height - margin.top - margin.bottom);

        const mainG = svg.append("g").attr("clip-path", `url(#${clipId})`);
        const xAxisG = svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`);
        const yAxisG = svg.append("g").attr("transform", `translate(${margin.left},0)`);

        const overlayG = svg.append("g").style("pointer-events", "none");

        function zoomed(event) {
            const newX = event.transform.rescaleX(xScale);
            const newY = event.transform.rescaleY(yScale);

            xAxisG.call(d3.axisBottom(newX).ticks(10, "$.0f"));
            yAxisG.call(d3.axisLeft(newY).ticks(10, "$.0f"));
            
            // Style Axes Text
            svg.selectAll('.tick text').attr('fill', '#94a3b8');
            svg.selectAll('.domain, .tick line').attr('stroke', '#475569');

            mainG.selectAll('.ref-line-x')
                .attr('x1', newX(medianX))
                .attr('x2', newX(medianX));
                
            mainG.selectAll('.ref-line-y')
                .attr('y1', newY(medianY))
                .attr('y2', newY(medianY));

            mainG.selectAll("circle")
                .attr("cx", d => newX(d[metricX]))
                .attr("cy", d => newY(d[metricY]));
        }

        // Reference Lines
        mainG.append('line')
            .attr('class', 'ref-line-x')
            .attr('x1', xScale(medianX))
            .attr('x2', xScale(medianX))
            .attr('y1', margin.top)
            .attr('y2', height - margin.bottom)
            .attr('stroke', '#475569')
            .attr('stroke-dasharray', '4')
            .attr('stroke-width', 2);

        mainG.append('line')
            .attr('class', 'ref-line-y')
            .attr('x1', margin.left)
            .attr('x2', width - margin.right)
            .attr('y1', yScale(medianY))
            .attr('y2', yScale(medianY))
            .attr('stroke', '#475569')
            .attr('stroke-dasharray', '4')
            .attr('stroke-width', 2);

        // Circles
        mainG.selectAll("circle")
            .data(validData)
            .join("circle")
            .attr("cx", d => xScale(d[metricX]))
            .attr("cy", d => yScale(d[metricY]))
            .attr("r", 6) // Larger default size
            .attr("fill", d => colorScale(d[metricX] / d[metricY]))
            .attr("stroke", "#0f172a")
            .attr("stroke-width", 1)
            .attr("opacity", 0.9)
            .on("mouseenter", (event, d) => {
                const ratio = (d[metricX] / d[metricY]).toFixed(2);
                const circle = d3.select(event.target);
                circle.raise(); // Bring to front
                
                circle.transition().duration(200)
                    .attr("r", 12)
                    .attr("stroke", "#fff")
                    .attr("stroke-width", 2);
                
                // Calculate position based on current transform
                const transform = d3.zoomTransform(svg.node());
                const cx = transform.rescaleX(xScale)(d[metricX]);
                const cy = transform.rescaleY(yScale)(d[metricY]);
                
                overlayG.append('text')
                    .attr('class', 'hover-label')
                    .attr('x', cx)
                    .attr('y', cy - 15)
                    .attr('text-anchor', 'middle')
                    .style('font-weight', 'bold')
                    .style('fill', '#fff')
                    .style('font-size', '13px')
                    .style('text-shadow', '0px 2px 4px rgba(0,0,0,0.8)')
                    .text(d.city);

                const [xPos, yPos] = d3.pointer(event, containerRef.current);
                setTooltip({ x: xPos, y: yPos, data: d, ratio });
            })
            .on("mouseleave", (event) => {
                d3.select(event.target)
                    .transition().duration(200)
                    .attr("r", 6)
                    .attr("stroke", "#0f172a")
                    .attr("stroke-width", 1);
                
                overlayG.selectAll('.hover-label').remove();
                setTooltip(null);
            });

        // Initial Axes
        xAxisG.call(d3.axisBottom(xScale).ticks(10, "$.0f"));
        yAxisG.call(d3.axisLeft(yScale).ticks(10, "$.0f"));
        
        // Initial Style
        svg.selectAll('.tick text').attr('fill', '#94a3b8');
        svg.selectAll('.domain, .tick line').attr('stroke', '#475569');

        // Labels
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height - 15)
            .attr("text-anchor", "middle")
            .style("fill", "#94a3b8")
            .style("font-size", "14px")
            .text(labelX);

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .style("fill", "#94a3b8")
            .style("font-size", "14px")
            .text(labelY);

        // Annotations
        svg.append("text")
            .attr("x", width - margin.right - 10)
            .attr("y", margin.top + 20)
            .attr("text-anchor", "end")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .style("fill", "#10b981")
            .text("Best Value");

        svg.append("text")
            .attr("x", margin.left + 10)
            .attr("y", height - margin.bottom - 10)
            .attr("text-anchor", "start")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .style("fill", "#ef4444")
            .text("Worst Value");

    }, [data, dimensions, metricX, metricY, labelX, labelY]);

    return (
        <div ref={containerRef} className="chart-container" style={{height: 500, position: 'relative', width: '100%'}}>
            <svg ref={svgRef}></svg>
            {tooltip && (
                <div className="chart-tooltip" 
                     style={{ 
                        left: tooltip.x > dimensions.width - 220 ? tooltip.x - 220 : tooltip.x + 15, 
                        top: tooltip.y > 300 ? tooltip.y - 120 : tooltip.y + 15,
                        opacity: 1, 
                        zIndex: 1000 
                     }}>
                    <div className="tooltip-title" style={{fontSize: '1.1rem'}}>{tooltip.data.city}, {tooltip.data.country}</div>
                    <div className="tooltip-row">
                        <span>{labelX}:</span>
                        <span className="tooltip-value">${tooltip.data[metricX].toLocaleString()}</span>
                    </div>
                    <div className="tooltip-row">
                        <span>{labelY}:</span>
                        <span className="tooltip-value">${tooltip.data[metricY].toFixed(0)}</span>
                    </div>
                    <div className="tooltip-row" style={{marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #e2e8f0'}}>
                        <span>Ratio:</span>
                        <span className="tooltip-value" style={{
                            color: tooltip.ratio > 1.5 ? '#10b981' : tooltip.ratio < 1.0 ? '#ef4444' : '#f59e0b'
                        }}>
                            {tooltip.ratio}x
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

ScatterPlot.propTypes = {
    data: PropTypes.array.isRequired,
    metricX: PropTypes.string,
    metricY: PropTypes.string,
    labelX: PropTypes.string,
    labelY: PropTypes.string
};

export default ScatterPlot;
