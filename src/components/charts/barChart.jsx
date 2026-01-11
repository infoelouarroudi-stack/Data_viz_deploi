import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';

const BarChart = ({ data, metric, label }) => {
    const svgRef = useRef();

    useEffect(() => {
        if (!data || data.length === 0) return;

        // Clear previous chart
        d3.select(svgRef.current).selectAll('*').remove();

        // Dimensions
        const width = 600;
        const height = 400;
        const margin = { top: 20, right: 30, bottom: 40, left: 150 };

        const svg = d3.select(svgRef.current)
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('viewBox', `0 0 ${width} ${height}`)
            .style('background', 'transparent')
            .style('border-radius', '0.5rem')
            .style('overflow', 'visible');

        // Scales
        const x = d3.scaleLinear()
            .domain([0, d3.max(data, d => d[metric] || 0) * 1.1]) // Add some buffer
            .range([margin.left, width - margin.right]);

        const y = d3.scaleBand()
            .domain(data.map(d => d.city))
            .range([margin.top, height - margin.bottom])
            .padding(0.2);

        // Bars
        svg.selectAll('rect')
            .data(data)
            .join('rect')
            .attr('x', x(0))
            .attr('y', d => y(d.city))
            .attr('width', d => x(d[metric] || 0) - x(0))
            .attr('height', y.bandwidth())
            .attr('fill', 'var(--primary)') // Primary color
            .attr('rx', 4);

        // Labels (Value)
        svg.selectAll('.label')
            .data(data)
            .join('text')
            .attr('class', 'label')
            .attr('x', d => x(d[metric] || 0) + 5)
            .attr('y', d => y(d.city) + y.bandwidth() / 2)
            .attr('dy', '0.35em')
            .text(d => d[metric] ? `$${d[metric].toFixed(2)}` : 'N/A')
            .attr('font-size', '12px')
            .attr('fill', 'var(--text-muted)');

        // Axes
        const xAxis = svg.append('g')
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x).ticks(5).tickFormat(d => `$${d}`))
            .call(g => g.select('.domain').remove());
        
        xAxis.selectAll('text').attr('fill', 'var(--text-muted)');
        xAxis.selectAll('line').attr('stroke', 'var(--border)');

        const yAxis = svg.append('g')
            .attr('transform', `translate(${margin.left},0)`)
            .call(d3.axisLeft(y).tickSizeOuter(0));
            
        yAxis.selectAll('text')
            .style('font-size', '12px')
            .style('font-weight', '500')
            .style('fill', 'var(--text-main)'); 
        
        yAxis.selectAll('line').attr('stroke', 'var(--border)');
        yAxis.select('.domain').remove();

        // X-Axis Label
        svg.append('text')
            .attr('x', width / 2 + margin.left / 2)
            .attr('y', height - 5)
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .attr('fill', 'var(--text-muted)')
            .text(label);

    }, [data, metric, label]);

    return (
        <div className="chart-container">
            <svg ref={svgRef}></svg>
        </div>
    );
};

BarChart.propTypes = {
    data: PropTypes.array.isRequired,
    metric: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired
};

export default BarChart;
