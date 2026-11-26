import React from 'react';
import './WorkingAnimatedFlow.css';

export default function WorkingAnimatedFlow() {
  return (
    <section className="wk-section wk-flow">
      <div className="wk-container">
        <h2 className="wk-flow__heading">
          Watch a product move through the pipeline
        </h2>
        <p className="wk-body wk-flow__sub">
          Every product loops through the same path. When validation finds a
          problem, it's caught and repaired at the center node before
          anything reaches Amazon.
        </p>

        <div className="wk-flow__diagram" role="img" aria-label="Animated diagram: data flows from Shopify to the Qwen AI and Rule Engine core, through a validation fix step, then to Amazon">
          {/* Node 1 — Shopify */}
          <div className="wk-flow__node wk-flow__node--shopify">
            <span className="wk-flow__node-dot" />
            <span className="wk-flow__node-label">Shopify</span>
            <span className="wk-flow__node-sub">Source data</span>
          </div>

          {/* Track 1 */}
          <div className="wk-flow__track">
            <span className="wk-flow__packet wk-flow__packet--1" />
          </div>

          {/* Node 2 — AI + Rule Engine core */}
          <div className="wk-flow__core">
            <div className="wk-flow__core-ring" />
            <div className="wk-flow__core-body">
              <span className="wk-flow__core-title">Qwen AI + Rule Engine</span>
              <span className="wk-flow__core-line">Semantic mapping</span>
              <span className="wk-flow__core-line">Deterministic build</span>
            </div>
            <span className="wk-flow__fixing-chip">Validation caught an issue — fixing…</span>
          </div>

          {/* Track 2 */}
          <div className="wk-flow__track">
            <span className="wk-flow__packet wk-flow__packet--2" />
          </div>

          {/* Node 3 — Amazon */}
          <div className="wk-flow__node wk-flow__node--amazon">
            <span className="wk-flow__node-dot" />
            <span className="wk-flow__node-label">Amazon</span>
            <span className="wk-flow__node-sub">SP-API publish</span>
          </div>
        </div>
      </div>
    </section>
  );
}
