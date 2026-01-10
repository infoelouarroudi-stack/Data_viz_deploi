import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';

const ExpenseBreakdown = ({ cityData }) => {
    const svgRef = useRef();

    useEffect(() => {
        if (!cityData) return;

        // If we have raw values, let's use them. If only indices, we use indices.
        // Assuming cityData has 'apt_1bed_city_center', 'mc_meal', 'milk' etc.
        // Let's approximate a "Budget"
        
        const housing = (cityData.apt_1bed_city_center + cityData.apt_1bed_outside_center) / 2 || 0;
        const food = (cityData.market_total || (cityData.milk + cityData.bread + cityData.chicken_fillets * 4 + cityData.rice * 2)) * 4 || 0; // rough estimate
        const transport = (cityData.pass_monthly) || 50;
        const utilities = (cityData.utilities_basic + cityData.internet) || 0;
        const leisure = (cityData.fitness_club + cityData.cinema * 2) || 0;

        const data = [
            { label: 'Housing', value: housing, color: '#6366f1' },
            { label: 'Food & Groceries', value: food, color: '#ec4899' },
            { label: 'Transport', value: transport, color: '#14b8a6' },
            { label: 'Utilities', value: utilities, color: '#f59e0b' },
            { label: 'Leisure', value: leisure, color: '#8b5cf6' }
        ].filter(d => d.value > 0);

        const width = 300;
        const height = 300;
        const radius = Math.min(width, height) / 2;

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height)
            .style('overflow', 'visible');
            
        svg.selectAll('*').remove();

        const g = svg.append('g').attr('transform', `translate(${width/2},${height/2})`);

        const pie = d3.pie().value(d => d.value).sort(null);
        const arc = d3.arc().innerRadius(radius * 0.6).outerRadius(radius);
        const arcHover = d3.arc().innerRadius(radius * 0.6).outerRadius(radius * 1.1);

        g.selectAll('path')
            .data(pie(data))
            .join('path')
            .attr('d', arc)
            .attr('fill', d => d.data.color)
            .attr('stroke', '#0f172a')
            .style('stroke-width', '4px')
            .style('cursor', 'pointer')
            .on('mouseenter', function(e, d) {
                d3.select(this).transition().duration(200).attr('d', arcHover);
                // Center Text
                g.select('.center-text-val').text(`$${d.data.value.toFixed(0)}`);
                g.select('.center-text-label').text(d.data.label);
            })
            .on('mouseleave', function() {
                d3.select(this).transition().duration(200).attr('d', arc);
                g.select('.center-text-val').text(`$${data.reduce((a,b)=>a+b.value,0).toFixed(0)}`);
                g.select('.center-text-label').text('Total / Mo');
            });

        // Center Text
        const total = data.reduce((acc, curr) => acc + curr.value, 0);

        g.append('text')
            .attr('class', 'center-text-val')
            .attr('text-anchor', 'middle')
            .attr('dy', '-0.2em')
            .style('font-size', '24px')
            .style('font-weight', 'bold')
            .style('fill', '#fff')
            .text(`$${total.toFixed(0)}`);
            
        g.append('text')
            .attr('class', 'center-text-label')
            .attr('text-anchor', 'middle')
            .attr('dy', '1.2em')
            .style('font-size', '12px')
            .style('fill', '#94a3b8')
            .text('Total / Mo');

    }, [cityData]);

    return (
        <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
            <svg ref={svgRef}></svg>
            <div style={{display:'flex', flexWrap:'wrap', gap:'1rem', marginTop:'1rem', justifyContent:'center'}}>
                {['Housing', 'Food', 'Transport', 'Utilities', 'Leisure'].map((l, i) => (
                    <div key={i} style={{display:'flex', alignItems:'center', gap:'0.25rem', fontSize:'0.8rem', color: '#cbd5e1'}}>
                        <div style={{width: 8, height: 8, borderRadius: '50%', backgroundColor: ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6'][i]}}></div>
                        <span>{l}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

ExpenseBreakdown.propTypes = {
    cityData: PropTypes.object
};

export default ExpenseBreakdown;
