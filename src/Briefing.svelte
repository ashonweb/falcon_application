<script>
  import { navigate } from 'svelte-routing';
  import { gameState, MISSIONS, missionResult } from './stores.js';

  $: mission   = MISSIONS[$gameState.mission];
  $: missionNo = $gameState.mission + 1;

  // Debrief — only shown when coming from a previous found result
  $: prevResult = $missionResult;
  $: showDebrief = prevResult && prevResult.found && mission && mission.debrief;
  $: debriefText = showDebrief
    ? mission.debrief.replace('{planet}', prevResult.planet || 'an unknown planet')
    : '';

  function acceptMission() {
    missionResult.set(null);
    navigate('/find');
  }
</script>

<div class="page">
  <div class="card">
    <!-- Lives -->
    <div class="lives-row">
      {#each Array(3) as _, i}
        <span class="life" class:life-lost={i >= $gameState.lives}></span>
      {/each}
      <span class="score-chip">{$gameState.totalScore.toLocaleString()} pts</span>
    </div>

    <!-- Debrief from previous mission -->
    {#if showDebrief}
      <div class="debrief">
        <div class="debrief-header">
          <span class="debrief-badge">INTEL REPORT</span>
          <span class="debrief-planet">Last seen: {prevResult.planet}</span>
        </div>
        <p class="debrief-text">{debriefText}</p>
        <div class="debrief-divider"></div>
      </div>
    {/if}

    <!-- Mission header -->
    <div class="mission-badge">MISSION {missionNo} / {MISSIONS.length}</div>
    <h1 class="mission-name">{mission.name}</h1>
    <div class="mission-subtitle">{mission.subtitle}</div>
    <p class="mission-desc">{mission.description}</p>

    <!-- Constraints -->
    <div class="constraints">
      {#if mission.timeLimit}
        <div class="constraint constraint-warn">
          <span class="c-icon">T</span>
          <span>Time limit: <strong>{mission.timeLimit}s</strong></span>
        </div>
      {/if}
      {#if mission.hiddenDistances}
        <div class="constraint constraint-warn">
          <span class="c-icon">?</span>
          <span>Planet distances <strong>classified</strong></span>
        </div>
      {/if}
      {#each mission.vehiclePenalty as v}
        <div class="constraint constraint-danger">
          <span class="c-icon">!</span>
          <span><strong>{v}</strong> — 1 unit destroyed</span>
        </div>
      {/each}
      {#if !mission.timeLimit && !mission.hiddenDistances && mission.vehiclePenalty.length === 0}
        <div class="constraint constraint-ok">
          <span class="c-icon">+</span>
          <span>No restrictions — full resources available</span>
        </div>
      {/if}
    </div>

    <button class="accept-btn" on:click={acceptMission}>
      Accept Mission
    </button>
  </div>
</div>

<style>
  .page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
  }

  .card {
    width: 100%;
    max-width: 500px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(139,92,246,0.2);
    border-radius: 16px;
    padding: 36px 32px;
  }

  /* Lives */
  .lives-row {
    display: flex; align-items: center; gap: 8px; margin-bottom: 28px;
  }
  .life {
    width: 10px; height: 10px; border-radius: 50%;
    background: #8b5cf6; box-shadow: 0 0 8px rgba(139,92,246,0.6); transition: all 0.3s;
  }
  .life-lost { background: rgba(255,255,255,0.1); box-shadow: none; }
  .score-chip {
    margin-left: auto; font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
    color: rgba(167,139,250,0.7); background: rgba(139,92,246,0.08);
    border: 1px solid rgba(139,92,246,0.15); border-radius: 20px; padding: 3px 10px;
  }

  /* Debrief */
  .debrief {
    margin-bottom: 24px;
  }

  .debrief-header {
    display: flex; align-items: center; gap: 10px; margin-bottom: 10px;
  }

  .debrief-badge {
    font-size: 8.5px; font-weight: 800; letter-spacing: 0.22em;
    color: rgba(251,191,36,0.7);
    background: rgba(251,191,36,0.07);
    border: 1px solid rgba(251,191,36,0.18);
    border-radius: 4px; padding: 2px 7px;
  }

  .debrief-planet {
    font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.28);
    letter-spacing: 0.06em;
  }

  .debrief-text {
    font-size: 13px; line-height: 1.75;
    color: rgba(255,255,255,0.52);
    font-style: italic;
    padding: 12px 14px;
    background: rgba(251,191,36,0.04);
    border-left: 2px solid rgba(251,191,36,0.25);
    border-radius: 0 6px 6px 0;
    margin-bottom: 0;
  }

  .debrief-divider {
    height: 1px; background: rgba(255,255,255,0.06); margin: 24px 0 0;
  }

  /* Mission identity */
  .mission-badge {
    font-size: 9px; font-weight: 800; letter-spacing: 0.3em;
    color: rgba(139,92,246,0.55); margin-bottom: 10px; margin-top: 20px;
  }
  .mission-name {
    font-size: 36px; font-weight: 900; letter-spacing: -0.02em;
    line-height: 1.1; color: rgba(255,255,255,0.95); margin-bottom: 6px;
  }
  .mission-subtitle {
    font-size: 12px; font-weight: 700; letter-spacing: 0.12em;
    text-transform: uppercase; color: #8b5cf6; margin-bottom: 18px;
  }
  .mission-desc {
    font-size: 13.5px; color: rgba(255,255,255,0.45); line-height: 1.7; margin-bottom: 28px;
  }

  /* Constraints */
  .constraints { display: flex; flex-direction: column; gap: 8px; margin-bottom: 32px; }
  .constraint {
    display: flex; align-items: center; gap: 10px;
    font-size: 12px; padding: 9px 12px; border-radius: 7px;
  }
  .constraint-ok     { color: rgba(110,231,183,0.8); background: rgba(110,231,183,0.06); border: 1px solid rgba(110,231,183,0.15); }
  .constraint-warn   { color: rgba(251,191,36,0.85); background: rgba(251,191,36,0.06);  border: 1px solid rgba(251,191,36,0.15);  }
  .constraint-danger { color: rgba(239,68,68,0.8);   background: rgba(239,68,68,0.06);   border: 1px solid rgba(239,68,68,0.15);   }
  .c-icon {
    flex-shrink: 0; width: 18px; height: 18px; border-radius: 4px;
    border: 1px solid currentColor; display: flex; align-items: center;
    justify-content: center; font-size: 10px; font-weight: 900; opacity: 0.8;
  }
  .constraint strong { color: inherit; opacity: 1; font-weight: 700; }

  /* Button */
  .accept-btn {
    width: 100%; background: linear-gradient(135deg, #7c3aed, #6d28d9);
    border: 1px solid rgba(139,92,246,0.4); border-radius: 9px;
    color: rgba(255,255,255,0.95); font-size: 14px; font-weight: 700;
    letter-spacing: 0.08em; padding: 14px; transition: all 0.2s;
    box-shadow: 0 0 24px rgba(124,58,237,0.25);
  }
  .accept-btn:hover {
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
    box-shadow: 0 0 36px rgba(139,92,246,0.4); transform: translateY(-1px);
  }
</style>
