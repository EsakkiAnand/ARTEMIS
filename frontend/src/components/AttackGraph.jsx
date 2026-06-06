import React, { useRef, useEffect, useState } from 'react';
import { Network } from 'lucide-react';

const NODE_COLORS = {
  attacker: { fill: '#ff4d6a', stroke: '#ff8096', label: '#fff' },
  tool:     { fill: '#1a3a4a', stroke: '#63d2c9', label: '#63d2c9' },
  service:  { fill: '#1a2a3a', stroke: '#45a29e', label: '#c9d1d9' },
  goal:     { fill: '#2a1a4a', stroke: '#b57eff', label: '#b57eff' },
  critical: { fill: '#3a0a1a', stroke: '#ff4d6a', label: '#ff4d6a' }, // Added critical
};

const ACTIVE_OVERLAY = { fill: 'rgba(99,210,201,0.18)', stroke: '#63d2c9', glow: '#63d2c9' };

// Layout positions adjusted to fit up to 8 nodes horizontally
const NODE_LAYOUT = {
  attacker:   { x: 60,  y: 200 },
  scanner:    { x: 180, y: 200 },
  ftp_target: { x: 310, y: 90  },
  ssh_target: { x: 310, y: 200 },
  web_target: { x: 310, y: 310 },
  shell:      { x: 450, y: 200 },
  privesc:    { x: 590, y: 200 },
  pivot:      { x: 730, y: 200 },
};

function getNodePos(nodeId) {
  return NODE_LAYOUT[nodeId] || { x: 400, y: 200 };
}

function NodePopover({ node, onClose }) {
  if (!node) return null;
  const colors = NODE_COLORS[node.type] || NODE_COLORS.service;
  return (
    <div
      className="absolute z-20 glass-panel px-4 py-3 text-xs min-w-[180px]"
      style={{ left: node.x + 30, top: node.y - 40, maxWidth: 220 }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-[var(--c-cyan)]">{node.label}</span>
        <button onClick={onClose} className="text-[var(--c-text-dim)] hover:text-[var(--c-text)] ml-2">✕</button>
      </div>
      <p className="text-[var(--c-text-dim)] mb-1">Type: <span className="text-[var(--c-text)] capitalize">{node.type}</span></p>
      <p className={`font-bold ${node.active ? 'text-[var(--c-green)]' : 'text-[var(--c-text-dim)]'}`}>
        {node.active ? '● Compromised / Active' : '○ Not reached'}
      </p>
    </div>
  );
}

const AttackGraph = ({ graphData }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const svgRef = useRef(null);

  const nodes = graphData?.nodes || [];
  const edges = graphData?.edges || [];

  // Map node id → position
  const nodeMap = {};
  nodes.forEach(n => {
    nodeMap[n.id] = { ...n, ...getNodePos(n.id) };
  });

  const handleNodeClick = (node) => {
    setSelectedNode(prev => prev?.id === node.id ? null : node);
  };

  return (
    <div className="glass-panel p-4 flex flex-col h-72 relative">
      <div className="panel-header">
        <Network size={16} className="text-[var(--c-cyan)]" />
        <h3 className="font-semibold text-sm text-[var(--c-cyan)] neon-text-sm">
          Attack Path Visualization
        </h3>
        <span className="ml-auto font-mono text-[10px] text-[var(--c-text-dim)]">
          {graphData?.active_nodes?.length || 1} / {nodes.length} nodes active
        </span>
      </div>

      {selectedNode && (
        <NodePopover
          node={nodeMap[selectedNode.id]}
          onClose={() => setSelectedNode(null)}
        />
      )}

      <div className="flex-1 relative overflow-hidden">
        {/* Adjusted viewBox from 720 to 820 width to accommodate pivot node */}
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox="0 0 820 380"
          style={{ display: 'block' }}
        >
          <defs>
            {/* Glow filter */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-strong" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Arrow marker */}
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="rgba(99,210,201,0.5)" />
            </marker>
            <marker id="arrow-active" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="var(--c-cyan)" />
            </marker>
          </defs>

          {/* Edges */}
          {edges.map((edge, i) => {
            const src = nodeMap[edge.source];
            const tgt = nodeMap[edge.target];
            if (!src || !tgt) return null;

            const isActive = graphData?.active_nodes?.includes(edge.source) &&
                             graphData?.active_nodes?.includes(edge.target);

            // Offset endpoints to edge of circles (r=28)
            const dx = tgt.x - src.x;
            const dy = tgt.y - src.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const ux = dx / dist;
            const uy = dy / dist;
            const r = 28;
            const x1 = src.x + ux * r;
            const y1 = src.y + uy * r;
            const x2 = tgt.x - ux * (r + 8);
            const y2 = tgt.y - uy * (r + 8);

            // Midpoint for label
            const mx = (x1 + x2) / 2;
            const my = (y1 + y2) / 2;

            return (
              <g key={i}>
                <line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={isActive ? 'var(--c-cyan)' : 'rgba(99,210,201,0.2)'}
                  strokeWidth={isActive ? 2 : 1}
                  strokeDasharray={isActive ? '6 3' : '4 4'}
                  markerEnd={isActive ? 'url(#arrow-active)' : 'url(#arrow)'}
                  filter={isActive ? 'url(#glow)' : undefined}
                  style={isActive ? { animation: 'dash-flow 1s linear infinite' } : undefined}
                />
                <text
                  x={mx} y={my - 5}
                  textAnchor="middle"
                  fontSize="9"
                  fill={isActive ? 'var(--c-cyan)' : 'rgba(99,210,201,0.35)'}
                  fontFamily="Space Mono"
                >
                  {edge.label}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const pos = getNodePos(node.id);
            const colors = NODE_COLORS[node.type] || NODE_COLORS.service;
            const isActive = node.active;
            const isSelected = selectedNode?.id === node.id;

            return (
              <g
                key={node.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                style={{ cursor: 'pointer' }}
                onClick={() => handleNodeClick({ ...node, ...pos })}
              >
                {/* Active glow ring */}
                {isActive && (
                  <circle r={36} fill="none" stroke={ACTIVE_OVERLAY.glow} strokeWidth={1.5} opacity={0.4} style={{ animation: 'glow-pulse 2s ease-in-out infinite' }} />
                )}
                {/* Selection ring */}
                {isSelected && (
                  <circle r={34} fill="none" stroke="white" strokeWidth={1.5} strokeDasharray="4 3" opacity={0.7} />
                )}

                {/* Node circle */}
                <circle
                  r={28}
                  fill={isActive ? colors.fill : '#0d1117'}
                  stroke={isActive ? colors.stroke : 'rgba(99,210,201,0.25)'}
                  strokeWidth={isActive ? 2 : 1}
                  filter={isActive ? 'url(#glow)' : undefined}
                />

                {/* Status dot */}
                {isActive && (
                  <circle
                    cx={20} cy={-20}
                    r={5}
                    fill="var(--c-green)"
                    filter="url(#glow)"
                    style={{ animation: 'pulse-dot 1.4s ease-in-out infinite' }}
                  />
                )}

                {/* Label */}
                <text
                  textAnchor="middle"
                  y={45}
                  fontSize="9"
                  fontFamily="Space Grotesk"
                  fontWeight="600"
                  fill={isActive ? colors.stroke : 'var(--c-text-dim)'}
                >
                  {node.label}
                </text>

                {/* Icon letter */}
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="13"
                  fontFamily="Space Mono"
                  fontWeight="700"
                  fill={isActive ? colors.label : 'rgba(99,210,201,0.3)'}
                >
                  {node.label[0]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-2 px-1">
        {[
          { color: '#ff4d6a', label: 'Attacker' },
          { color: '#63d2c9', label: 'Active/Compromised' },
          { color: 'rgba(99,210,201,0.25)', label: 'Not Reached' },
          { color: '#b57eff', label: 'Goal' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: color }} />
            <span className="text-[9px] text-[var(--c-text-dim)]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttackGraph;
