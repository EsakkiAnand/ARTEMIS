import React from 'react';
import { Crosshair, Info } from 'lucide-react';
import ScenarioSelector from '../components/ScenarioSelector';
import AttackGraph from '../components/AttackGraph';

const ScenariosPage = ({ sim }) => {
  const { scenarios, activeScenario, status, attackGraph, setActiveScenario } = sim;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--c-text)]">Attack Scenarios</h2>
        <p className="text-xs text-[var(--c-text-dim)] mt-0.5">
          Configure and select the attack simulation scenario. Changes take effect on the next simulation run.
        </p>
      </div>

      {/* Info banner */}
      <div className="glass-panel px-4 py-3 flex items-start gap-3 border-[rgba(99,210,201,0.2)]">
        <Info size={15} className="text-[var(--c-cyan)] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[var(--c-text-dim)] leading-relaxed">
          All attacks run in a <strong className="text-[var(--c-text)]">fully isolated sandbox</strong> environment.
          No real exploit payloads are generated or sent to external systems.
          This platform is for authorized security testing and research only.
        </p>
      </div>

      {/* Scenario Cards */}
      <ScenarioSelector
        scenarios={scenarios}
        activeScenario={activeScenario}
        onSelect={setActiveScenario}
        isRunning={status === 'running'}
      />

      {/* Active scenario attack graph preview */}
      {attackGraph?.nodes?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[var(--c-text-dim)] mb-3 flex items-center gap-2">
            <Crosshair size={14} />
            Current Attack Graph State
          </h3>
          <AttackGraph graphData={attackGraph} />
        </div>
      )}
    </div>
  );
};

export default ScenariosPage;
