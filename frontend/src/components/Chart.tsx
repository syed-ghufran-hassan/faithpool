import { useMemo } from 'react';
import clsx from 'clsx';

export type ChartType = 'bar' | 'line' | 'pie' | 'doughnut';

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
    backgroundColor?: string;
  }[];
}

export interface ChartProps {
  type: ChartType;
  data: ChartData;
  height?: number;
  width?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  animate?: boolean;
  className?: string;
  title?: string;
  unit?: string;
}

export function Chart({
  type,
  data,
  height = 300,
  width = 600,
  showLegend = true,
  showGrid = true,
  animate = true,
  className,
  title,
  unit = '',
}: ChartProps) {
  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
  ];

  const maxValue = useMemo(() => {
    return Math.max(...data.datasets.flatMap(d => d.data), 0);
  }, [data]);

  const renderBarChart = () => {
    const barCount = data.datasets.length * data.labels.length;
    const barWidth = (width - 100) / barCount * 0.8;
    const groupWidth = (width - 100) / data.labels.length;
    
    return (
      <svg width={width} height={height} className="chart__svg">
        {/* Grid lines */}
        {showGrid && Array.from({ length: 6 }).map((_, i) => {
          const y = height - 40 - (i * (height - 60) / 5);
          return (
            <g key={i}>
              <line
                x1={50}
                y1={y}
                x2={width - 20}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth={1}
              />
              <text x={40} y={y + 4} textAnchor="end" fontSize={12} fill="#6b7280">
                {Math.round(maxValue * i / 5)}{unit}
              </text>
            </g>
          );
        })}
        
        {/* Bars */}
        {data.labels.map((label, labelIndex) => (
          <g key={label}>
            {data.datasets.map((dataset, datasetIndex) => {
              const value = dataset.data[labelIndex] || 0;
              const barHeight = (value / maxValue) * (height - 60);
              const x = 50 + labelIndex * groupWidth + datasetIndex * (barWidth + 2);
              const y = height - 40 - barHeight;
              
              return (
                <rect
                  key={`${label}-${dataset.label}`}
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={dataset.color || colors[datasetIndex % colors.length]}
                  rx={2}
                  className={animate ? 'chart__bar--animate' : ''}
                />
              );
            })}
            
            {/* X-axis label */}
            <text
              x={50 + labelIndex * groupWidth + groupWidth / 2}
              y={height - 20}
              textAnchor="middle"
              fontSize={12}
              fill="#6b7280"
            >
              {label}
            </text>
          </g>
        ))}
        
        {/* X and Y axis */}
        <line x1={50} y1={height - 40} x2={width - 20} y2={height - 40} stroke="#9ca3af" strokeWidth={2} />
        <line x1={50} y1={20} x2={50} y2={height - 40} stroke="#9ca3af" strokeWidth={2} />
      </svg>
    );
  };

  const renderLineChart = () => {
    const xStep = (width - 100) / (data.labels.length - 1 || 1);
    
    return (
      <svg width={width} height={height} className="chart__svg">
        {/* Grid lines */}
        {showGrid && Array.from({ length: 6 }).map((_, i) => {
          const y = height - 40 - (i * (height - 60) / 5);
          return (
            <g key={i}>
              <line
                x1={50}
                y1={y}
                x2={width - 20}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth={1}
              />
              <text x={40} y={y + 4} textAnchor="end" fontSize={12} fill="#6b7280">
                {Math.round(maxValue * i / 5)}{unit}
              </text>
            </g>
          );
        })}
        
        {/* Lines */}
        {data.datasets.map((dataset, datasetIndex) => {
          const points = dataset.data.map((value, index) => {
            const x = 50 + index * xStep;
            const y = height - 40 - (value / maxValue) * (height - 60);
            return `${x},${y}`;
          }).join(' ');
          
          return (
            <g key={dataset.label}>
              <polyline
                fill="none"
                stroke={dataset.color || colors[datasetIndex % colors.length]}
                strokeWidth={3}
                points={points}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={animate ? 'chart__line--animate' : ''}
              />
              
              {/* Data points */}
              {dataset.data.map((value, index) => {
                const x = 50 + index * xStep;
                const y = height - 40 - (value / maxValue) * (height - 60);
                
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r={5}
                    fill={dataset.color || colors[datasetIndex % colors.length]}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                );
              })}
            </g>
          );
        })}
        
        {/* X-axis labels */}
        {data.labels.map((label, index) => (
          <text
            key={label}
            x={50 + index * xStep}
            y={height - 20}
            textAnchor="middle"
            fontSize={12}
            fill="#6b7280"
          >
            {label}
          </text>
        ))}
        
        {/* X and Y axis */}
        <line x1={50} y1={height - 40} x2={width - 20} y2={height - 40} stroke="#9ca3af" strokeWidth={2} />
        <line x1={50} y1={20} x2={50} y2={height - 40} stroke="#9ca3af" strokeWidth={2} />
      </svg>
    );
  };

  const renderPieChart = () => {
    const isDoughnut = type === 'doughnut';
    const centerX = width / 2;
    const centerY = height / 2 - 20;
    const radius = Math.min(width, height) / 3;
    const innerRadius = isDoughnut ? radius * 0.6 : 0;
    
    const total = data.datasets[0]?.data.reduce((a, b) => a + b, 0) || 1;
    let currentAngle = -Math.PI / 2;
    
    return (
      <svg width={width} height={height} className="chart__svg">
        {data.datasets[0]?.data.map((value, index) => {
          const angle = (value / total) * Math.PI * 2;
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;
          currentAngle = endAngle;
          
          const x1 = centerX + Math.cos(startAngle) * radius;
          const y1 = centerY + Math.sin(startAngle) * radius;
          const x2 = centerX + Math.cos(endAngle) * radius;
          const y2 = centerY + Math.sin(endAngle) * radius;
          
          const largeArc = angle > Math.PI ? 1 : 0;
          
          let path;
          if (isDoughnut) {
            const innerX1 = centerX + Math.cos(startAngle) * innerRadius;
            const innerY1 = centerY + Math.sin(startAngle) * innerRadius;
            const innerX2 = centerX + Math.cos(endAngle) * innerRadius;
            const innerY2 = centerY + Math.sin(endAngle) * innerRadius;
            
            path = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${innerX2} ${innerY2} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerX1} ${innerY1} Z`;
          } else {
            path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
          }
          
          return (
            <path
              key={index}
              d={path}
              fill={colors[index % colors.length]}
              stroke="#fff"
              strokeWidth={2}
              className={animate ? 'chart__slice--animate' : ''}
            />
          );
        })}
        
        {/* Center label for doughnut */}
        {isDoughnut && (
          <text
            x={centerX}
            y={centerY}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={14}
            fill="#374151"
          >
            {total}{unit}
          </text>
        )}
      </svg>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return renderBarChart();
      case 'line':
        return renderLineChart();
      case 'pie':
      case 'doughnut':
        return renderPieChart();
      default:
        return null;
    }
  };

  return (
    <div className={clsx('chart', className)}>
      {title && <h3 className="chart__title">{title}</h3>}
      
      <div className="chart__container">
        {renderChart()}
      </div>
      
      {showLegend && type !== 'pie' && type !== 'doughnut' && (
        <div className="chart__legend">
          {data.datasets.map((dataset, index) => (
            <div key={dataset.label} className="chart__legend-item">
              <span
                className="chart__legend-color"
                style={{ backgroundColor: dataset.color || colors[index % colors.length] }}
              />
              <span className="chart__legend-label">{dataset.label}</span>
            </div>
          ))}
        </div>
      )}
      
      {(type === 'pie' || type === 'doughnut') && showLegend && (
        <div className="chart__legend chart__legend--vertical">
          {data.labels.map((label, index) => {
            const value = data.datasets[0]?.data[index] || 0;
            return (
              <div key={label} className="chart__legend-item">
                <span
                  className="chart__legend-color"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="chart__legend-label">{label}: {value}{unit}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Chart;
