import React, { useEffect } from 'react';
import ReactFlow, { Background, Controls, Edge, Node, Position, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import { useArtemis } from '../services/ArtemisContext';
import { FaServer, FaBug, FaSearch, FaShieldAlt } from 'react-icons/fa';

const customNodeStyle = {
  background: '#111827',
  color: '#fff',
  border: '1px solid #00F0FF',
  borderRadius: '8px',
  padding: '10px',
  boxShadow: '0 0 10px rgba(0, 240, 255, 0.2)',
  fontFamily: 'monospace',
  fontSize: '12px'
};

const activeNodeStyle = {
  ...customNodeStyle,
  background: 'rgba(0, 240, 255, 0.2)',
  border: '2px solid #00F0FF',
  boxShadow: '0 0 20px rgba(0, 240, 255, 0.6)',
};

const initialNodes: Node[] = [
  { id: '1', type: 'default', data: { label: 'Reconnaissance' }, position: { x: 250, y: 0 }, style: customNodeStyle, sourcePosition: Position.Bottom, targetPosition: Position.Top },
  { id: '2', type: 'default', data: { label: 'Service Discovery' }, position: { x: 250, y: 100 }, style: customNodeStyle, sourcePosition: Position.Bottom, targetPosition: Position.Top },
  { id: '3', type: 'default', data: { label: 'Vuln Analysis' }, position: { x: 250, y: 200 }, style: customNodeStyle, sourcePosition: Position.Bottom, targetPosition: Position.Top },
  { id: '4', type: 'default', data: { label: 'Threat Simulation' }, position: { x: 250, y: 300 }, style: customNodeStyle, sourcePosition: Position.Bottom, targetPosition: Position.Top },
  { id: '5', type: 'default', data: { label: 'Mitigation' }, position: { x: 250, y: 400 }, style: customNodeStyle, sourcePosition: Position.Bottom, targetPosition: Position.Top },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#00F0FF' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#00F0FF' } },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#00F0FF' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#00F0FF' } },
  { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: '#00F0FF' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#00F0FF' } },
  { id: 'e4-5', source: '4', target: '5', animated: true, style: { stroke: '#00F0FF' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#00F0FF' } },
];

const AttackGraph: React.FC = () => {
  const { logs } = useArtemis();
  const [nodes, setNodes] = React.useState<Node[]>(initialNodes);
  
  useEffect(() => {
    if (logs.length > 0) {
      const lastLog = logs[logs.length - 1];
      const msg = lastLog.message.toLowerCase();
      let activeIndex = -1;
      
      if (msg.includes('recon') || msg.includes('initialize')) activeIndex = 0;
      else if (msg.includes('scan') || msg.includes('discover')) activeIndex = 1;
      else if (msg.includes('analy')) activeIndex = 2;
      else if (msg.includes('execut') || msg.includes('simulat')) activeIndex = 3;
      else if (msg.includes('mitigat')) activeIndex = 4;
      
      if (activeIndex !== -1) {
        setNodes(nds => nds.map((node, idx) => ({
          ...node,
          style: idx === activeIndex ? activeNodeStyle : customNodeStyle
        })));
      }
    }
  }, [logs]);

  return (
    <div className="panel flex-1 flex flex-col relative overflow-hidden h-[400px]">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-danger to-warning"></div>
      <h2 className="text-xl font-mono text-danger mb-2 border-b border-danger/30 pb-2">Attack Chain</h2>
      <div className="flex-1 w-full h-full" style={{ background: '#0B0F19' }}>
        <ReactFlow 
          nodes={nodes} 
          edges={initialEdges}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#1f2937" gap={16} />
          <Controls className="bg-panel border border-cyan-900 fill-white" />
        </ReactFlow>
      </div>
    </div>
  );
};

export default AttackGraph;
