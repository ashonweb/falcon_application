<script>
  import { onMount } from 'svelte';
  import { navigate } from 'svelte-routing';
  import { missionResult } from './stores.js';

  const result = $missionResult;
  if (!result) { navigate('/'); }

  const planets     = result ? (result.searchedPlanets || []) : [];
  const foundPlanet = result && result.found ? result.planet : null;
  const isFound     = !!(result && result.found);

  // 'queued' | 'scanning' | 'clear' | 'found'
  let statuses   = planets.map(() => 'queued');
  let currentIdx = -1;
  let done       = false;
  let showFinal  = false;

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  onMount(async () => {
    await sleep(500);

    for (let i = 0; i < planets.length; i++) {
      currentIdx = i;
      statuses[i] = 'scanning';
      statuses = [...statuses];

      await sleep(1000);

      const hit = isFound && planets[i] === foundPlanet;
      statuses[i] = hit ? 'found' : 'clear';
      statuses = [...statuses];

      if (hit) { await sleep(900); break; }
      await sleep(220);
    }

    done = true;
    await sleep(250);
    showFinal = true;
    await sleep(2200);
    navigate('/result');
  });
</script>

<div class="page">
  <div class="terminal" class:terminal-found={isFound && showFinal}>

    <div class="t-header">
      <span class="t-title">FLEET DEPLOYMENT STATUS</span>
      <span class="t-cursor" class:t-cursor-active={!done}>█</span>
    </div>

    <div class="t-divider"></div>

    <div class="t-rows">
      {#each planets as planet, i}
        <div
          class="t-row"
          class:row-queued={statuses[i] === 'queued'}
          class:row-scanning={statuses[i] === 'scanning'}
          class:row-clear={statuses[i] === 'clear'}
          class:row-found={statuses[i] === 'found'}
        >
          <span class="row-num">0{i + 1}</span>
          <span class="row-planet">{planet}</span>

          <div class="row-bar">
            {#if statuses[i] === 'scanning'}
              <div class="bar-sweep"></div>
            {:else if statuses[i] !== 'queued'}
              <div class="bar-done"></div>
            {/if}
          </div>

          <span class="row-status">
            {#if statuses[i] === 'queued'}   <span class="s-queued">QUEUED</span>
            {:else if statuses[i] === 'scanning'}<span class="s-scanning">SCANNING</span>
            {:else if statuses[i] === 'clear'}  <span class="s-clear">CLEAR</span>
            {:else if statuses[i] === 'found'}  <span class="s-found">SIGNAL DETECTED</span>
            {/if}
          </span>
        </div>
      {/each}
    </div>

    <div class="t-divider"></div>

    <div class="t-footer">
      {#if !done}
        <span class="f-active">{planets.length} TARGETS · SCANNING IN PROGRESS</span>
      {:else if isFound}
        <span class="f-found">QUEEN LOCATED · TRANSMITTING COORDINATES</span>
      {:else}
        <span class="f-miss">SCAN COMPLETE · NO SIGNAL IN SEARCHED SECTORS</span>
      {/if}
    </div>
  </div>

  <!-- Final reveal overlay -->
  {#if showFinal}
    <div class="final-overlay" class:final-found={isFound} class:final-miss={!isFound}>
      {#if isFound}
        <div class="final-eyebrow">SIGNAL ACQUIRED</div>
        <div class="final-title">Queen Located</div>
        <div class="final-planet">{foundPlanet}</div>
      {:else}
        <div class="final-eyebrow">SEARCH COMPLETE</div>
        <div class="final-title">No Signal</div>
        <div class="final-sub">Queen not in searched sectors</div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    font-family: 'Courier New', 'SF Mono', monospace;
  }

  /* Terminal card */
  .terminal {
    width: 100%;
    max-width: 520px;
    background: rgba(3, 4, 8, 0.85);
    border: 1px solid rgba(139, 92, 246, 0.2);
    border-radius: 12px;
    padding: 28px 30px;
    transition: border-color 0.5s, box-shadow 0.5s;
  }

  .terminal-found {
    border-color: rgba(139, 92, 246, 0.55);
    box-shadow: 0 0 40px rgba(139, 92, 246, 0.15);
  }

  /* Header */
  .t-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .t-title {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.25em;
    color: rgba(139, 92, 246, 0.6);
  }

  .t-cursor {
    font-size: 12px;
    color: rgba(139, 92, 246, 0.3);
    opacity: 0;
  }

  .t-cursor-active {
    opacity: 1;
    animation: cur-blink 0.7s step-end infinite;
  }

  @keyframes cur-blink { 0%,100%{opacity:1} 50%{opacity:0} }

  /* Divider */
  .t-divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.07);
    margin: 0 0 20px;
  }

  /* Rows */
  .t-rows {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 20px;
  }

  .t-row {
    display: grid;
    grid-template-columns: 24px 1fr 120px 140px;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.04);
    transition: all 0.3s;
  }

  .row-queued  { opacity: 0.28; }
  .row-scanning { border-color: rgba(139,92,246,0.3); background: rgba(139,92,246,0.05); }
  .row-clear   { border-color: rgba(110,231,183,0.15); background: rgba(110,231,183,0.03); }
  .row-found   { border-color: rgba(251,191,36,0.4);  background: rgba(251,191,36,0.07);  animation: found-pulse 0.5s ease-in-out 3; }

  @keyframes found-pulse {
    0%,100% { box-shadow: none; }
    50%     { box-shadow: 0 0 20px rgba(251,191,36,0.25); }
  }

  .row-num {
    font-size: 10px;
    font-weight: 700;
    color: rgba(139, 92, 246, 0.5);
    letter-spacing: 0.05em;
  }

  .row-planet {
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.6);
    letter-spacing: 0.05em;
  }
  .row-found .row-planet { color: rgba(251,191,36,0.9); }
  .row-clear .row-planet { color: rgba(255,255,255,0.4); }

  /* Bar */
  .row-bar {
    position: relative;
    height: 3px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 2px;
    overflow: hidden;
  }

  .bar-sweep {
    position: absolute;
    top: 0; bottom: 0;
    width: 50%;
    background: linear-gradient(90deg, transparent, rgba(139,92,246,0.8), transparent);
    animation: sweep 1s ease-in-out infinite;
  }

  @keyframes sweep {
    0%   { left: -50%; }
    100% { left: 120%; }
  }

  .bar-done {
    position: absolute;
    inset: 0;
    background: rgba(110, 231, 183, 0.4);
    border-radius: 2px;
  }
  .row-found .bar-done { background: rgba(251,191,36,0.6); }

  /* Status text */
  .row-status { text-align: right; }

  .s-queued   { font-size: 9px; letter-spacing: 0.15em; color: rgba(255,255,255,0.18); }
  .s-scanning { font-size: 9px; letter-spacing: 0.15em; color: rgba(139,92,246,0.7); animation: s-blink 0.6s step-end infinite; }
  .s-clear    { font-size: 9px; letter-spacing: 0.15em; color: rgba(110,231,183,0.6); }
  .s-found    { font-size: 9px; letter-spacing: 0.1em;  color: rgba(251,191,36,0.9); font-weight: 700; }

  @keyframes s-blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

  /* Footer */
  .t-footer { font-size: 9px; letter-spacing: 0.18em; text-align: center; }
  .f-active { color: rgba(139,92,246,0.45); animation: s-blink 1s ease-in-out infinite; }
  .f-found  { color: rgba(251,191,36,0.7); }
  .f-miss   { color: rgba(255,255,255,0.2); }

  /* Final overlay */
  .final-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    animation: overlay-in 0.4s ease-out;
    z-index: 50;
  }

  @keyframes overlay-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .final-found { background: rgba(3,4,8,0.92); }
  .final-miss  { background: rgba(3,4,8,0.88); }

  .final-eyebrow {
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.35em;
    margin-bottom: 12px;
  }
  .final-found .final-eyebrow { color: rgba(251,191,36,0.6); }
  .final-miss  .final-eyebrow { color: rgba(255,255,255,0.25); }

  .final-title {
    font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif;
    font-size: clamp(48px, 10vw, 80px);
    font-weight: 900;
    letter-spacing: -0.03em;
    line-height: 1;
    margin-bottom: 12px;
  }
  .final-found .final-title {
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: drop-shadow(0 0 30px rgba(251,191,36,0.4));
  }
  .final-miss .final-title { color: rgba(255,255,255,0.25); }

  .final-planet {
    font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif;
    font-size: 22px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.7);
    letter-spacing: 0.05em;
  }

  .final-sub {
    font-size: 13px;
    color: rgba(255,255,255,0.25);
    letter-spacing: 0.05em;
  }

  @media (max-width: 540px) {
    .t-row { grid-template-columns: 20px 1fr 80px 110px; gap: 6px; }
    .terminal { padding: 20px 16px; }
  }
</style>
