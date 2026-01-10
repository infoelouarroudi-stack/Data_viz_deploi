import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';

const RadarChart = ({ data, metrics, labels }) => {
    const svgRef = useRef();
    const containerRef = useRef();
    const [dimensions, setDimensions] = useState({ width: 0, height: 400 });

    useEffect(() => {
        if (!containerRef.current) return;
        const resizeObserver = new ResizeObserver(entries => {
            if (!entries.length) return;
            const { width } = entries[0].contentRect;
            if (width > 0) setDimensions(d => ({ ...d, width: width }));
        });
        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => {
        if (!data || data.length === 0 || !metrics || metrics.length === 0 || dimensions.width === 0) return;

        const { width, height } = dimensions;
        const padding = 60;
        const radius = Math.min(width, height) / 2 - padding;
        
        // Clear previous
        d3.select(svgRef.current).selectAll('*').remove();

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height)
            .style('overflow', 'visible');

        const g = svg.append('g')
            .attr('transform', `translate(${width / 2},${height / 2})`);

        // Scales
        const angleSlice = (Math.PI * 2) / metrics.length;
        
        // Calculate max for each metric to normalize
        const maxValues = {};
        metrics.forEach(m => {
            maxValues[m] = d3.max(data, d => d[m]) || 100;
        });

        const rScale = d3.scaleLinear().range([0, radius]).domain([0, 1]);

        // Draw Grid (Web)
        const levels = 5;
        const gridWrapper = g.append('g').attr('class', 'gridWrapper');

        for(let i = 0; i < levels; i++) {
            const levelFactor = radius * ((i + 1) / levels);
            
            gridWrapper.selectAll(`.level-${i}`)
                .data(metrics)
                .enter()
                .append('line')
                .attr('x1', (d, j) => levelFactor * Math.cos(angleSlice * j - Math.PI / 2))
                .attr('y1', (d, j) => levelFactor * Math.sin(angleSlice * j - Math.PI / 2))
                .attr('x2', (d, j) => levelFactor * Math.cos(angleSlice * (j + 1) - Math.PI / 2))
                .attr('y2', (d, j) => levelFactor * Math.sin(angleSlice * (j + 1) - Math.PI / 2))
                .attr('stroke', '#334155')
                .attr('stroke-width', '1px');
        }

        // Draw Axes
        const axes = g.selectAll('.axis')
            .data(metrics)
            .enter()
            .append('g')
            .attr('class', 'axis');

        axes.append('line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', (d, i) => rScale(1.1) * Math.cos(angleSlice * i - Math.PI / 2))
            .attr('y2', (d, i) => rScale(1.1) * Math.sin(angleSlice * i - Math.PI / 2))
            .attr('stroke', '#475569')
            .attr('stroke-width', '1px');

        axes.append('text')
            .attr('class', 'legend')
            .style('font-size', '11px')
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .attr('x', (d, i) => rScale(1.25) * Math.cos(angleSlice * i - Math.PI / 2))
            .attr('y', (d, i) => rScale(1.25) * Math.sin(angleSlice * i - Math.PI / 2))
            .text(d => labels[d] || d)
            .style('fill', '#94a3b8');

        // Draw Areas
        const radarLine = d3.lineRadial()
            .curve(d3.curveLinearClosed)
            .radius(d => rScale(d.value))
            .angle((d, i) => i * angleSlice);

        // Color scale
        const color = d3.scaleOrdinal()
            .range(['#6366f1', '#ec4899', '#14b8a6', '#f59e0b']);

        data.forEach((d, idx) => {
            const dataValues = metrics.map(m => ({
                metric: m,
                value: (d[m] || 0) / (maxValues[m] || 1) // Normalize 0-1
            }));

            // Area
            g.append('path')
                .datum(dataValues)
                .attr('d', radarLine)
                .style('stroke-width', 2)
                .style('stroke', color(idx))
                .style('fill', color(idx))
                .style('fill-opacity', 0.1)
                .on('mouseover', function() {
                    d3.select(this).style('fill-opacity', 0.5);
                })
                .on('mouseout', function() {
                    d3.select(this).style('fill-opacity', 0.1);
                });

            // Points
            g.selectAll(`.nodes-${idx}`)
               .data(dataValues)
               .enter()
               .append('circle')
               .attr('class', `radar-circle-${idx}`)
               .attr('cx', (p, i) => rScale(p.value) * Math.cos(angleSlice * i - Math.PI / 2))
               .attr('cy', (p, i) => rScale(p.value) * Math.sin(angleSlice * i - Math.PI / 2))
               .attr('r', 4)
               .style('fill', color(idx))
               .style('fill-opacity', 0.8)
               .append('title')
               .text(p => `${labels[p.metric] || p.metric}: $${(p.value * maxValues[p.metric]).toFixed(2)}`);
        });

    }, [data, metrics, labels, dimensions]);

    return (
        <div ref={containerRef} className="chart-container" style={{height: 400}}>
            <svg ref={svgRef}></svg>
            <div style={{display:'flex', justifyContent:'center', gap:'1rem', marginTop:'10px'}}>
                {data.map((d, i) => (
                    <div key={i} style={{display:'flex', alignItems:'center', gap:'0.25rem', fontSize:'0.9rem'}}>
                        <div style={{width: 12, height: 12, borderRadius: '50%', backgroundColor: ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b'][i % 4]}}></div>
                        <span style={{color: '#fff'}}>{d.city}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

RadarChart.propTypes = {
    data: PropTypes.array.isRequired,
    metrics: PropTypes.array.isRequired,
    labels: PropTypes.object.isRequired
};

export default RadarChart;
