<script>
  import { onMount, onDestroy } from 'svelte';
  import { navigate } from 'svelte-routing';
  import { gameState, MISSIONS, missionResult } from './stores.js';

  let result = null;
  const unsub = missionResult.subscribe(v => { result = v; });
  onDestroy(unsub);

  $: found   = result && result.found;
  $: timedOut = result && result.timedOut;
  $: lives   = $gameState.lives;
  $: isGameOver = lives <= 0;
  $: hasNextMission = $gameState.mission < MISSIONS.length;

  // Score reveal animation
  let revealedCount  = 0;
  let displayTotal   = 0;
  let showTotal      = false;
  let showStars      = false;
  let showActions    = false;

  onMount(() => {
    if (!result || !found) {
      setTimeout(() => { showActions = true; }, 600);
      return;
    }
    const breakdown = result.breakdown || [];
    // Reveal each score line
    breakdown.forEach((_, i) => {
      setTimeout(() => { revealedCount = i + 1; }, 500 + i * 350);
    });
    // Tick up total
    const afterBreakdown = 500 + breakdown.length * 350 + 200;
    setTimeout(() => {
      showTotal = true;
      const target = result.total || 0;
      const steps  = 50;
      let step = 0;
      const interval = setInterval(() => {
        step++;
        displayTotal = Math.round(target * (step / steps));
        if (step >= steps) { displayTotal = target; clearInterval(interval); }
      }, 900 / steps);
    }, afterBreakdown);
    // Show stars
    setTimeout(() => { showStars = true; }, afterBreakdown + 1100);
    // Show actions
    setTimeout(() => { showActions = true; }, afterBreakdown + 1600);
  });

  function nextMission() {
    // Keep missionResult so Briefing can show the debrief story
    navigate(hasNextMission ? '/briefing' : '/gameover');
  }

  function retry() {
    missionResult.set(null);
    navigate('/find');
  }

  function goHome() {
    missionResult.set(null);
    navigate('/gameover');
  }
</script>

{#if !result}
  <div class="no-result">
    <p>No mission data. <a href="/">Return to base</a></p>
  </div>
{:else}
  <div class="page" class:page-fail={!found}>
    <!-- Background glow for success -->
    {#if found}
      <div class="bg-glow" aria-hidden="true"></div>
    {/if}

    <div class="content">
      <!-- Lives bar -->
      <div class="lives-bar">
        {#each Array(3) as _, i}
          <span class="life-dot" class:life-dot-lost={i >= lives}></span>
        {/each}
        <span class="lives-label">{lives} {lives === 1 ? 'life' : 'lives'} remaining</span>
        <span class="score-label">{$gameState.totalScore.toLocaleString()} pts total</span>
      </div>

      <!-- Craft icon -->
      <div class="craft-wrap" class:craft-found={found} class:craft-fail={!found}>
        {#if found}
          <svg viewBox="0 0 52 86" fill="none" width="52" height="84">
            <path d="M26 4 L36 30 L32 74 L26 70 L20 74 L16 30 Z" fill="currentColor"/>
            <path d="M20 36 L2 58 L18 47 Z" fill="currentColor" opacity="0.75"/>
            <path d="M32 36 L50 58 L34 47 Z" fill="currentColor" opacity="0.75"/>
            <ellipse cx="26" cy="16" rx="5" ry="7" fill="rgba(147,210,255,0.38)"/>
            <circle cx="26" cy="6" r="2.5" fill="rgba(167,243,208,0.9)"/>
            <path d="M20 74 Q26 86 32 74" fill="rgba(139,92,246,0.75)"/>
            <path d="M22 74 Q26 82 30 74" fill="rgba(167,139,250,0.9)"/>
          </svg>
        {:else}
          <svg viewBox="0 0 80 80" fill="none" width="72" height="72">
            <circle cx="40" cy="40" r="28" stroke="currentColor" stroke-width="2" opacity="0.45"/>
            <circle cx="40" cy="40" r="16" fill="currentColor" opacity="0.2"/>
            <ellipse cx="40" cy="40" rx="38" ry="12" stroke="currentColor" stroke-width="1.5" opacity="0.25"/>
            <line x1="60" y1="60" x2="74" y2="74" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
          </svg>
        {/if}
      </div>

      <!-- Status -->
      <div class="mission-tag">
        {#if timedOut}TIME EXPIRED
        {:else if found}MISSION COMPLETE
        {:else}MISSION FAILED
        {/if}
      </div>

      <h1 class="headline" class:headline-found={found} class:headline-fail={!found}>
        {#if found}
          Queen Found
        {:else if timedOut}
          Time's Up
        {:else}
          Not Found
        {/if}
      </h1>

      {#if found}
        <p class="detail">Queen Al Falcone was hiding on <strong class="planet">{result.planet}</strong></p>
      {:else if timedOut}
        <p class="detail">Mission clock ran out before you could deploy your fleet.</p>
      {:else}
        <p class="detail">The Queen was not on any of your searched planets. Regroup.</p>
      {/if}

      <!-- Travel time -->
      <div class="stat-row">
        <div class="stat">
          <span class="stat-label">Travel time</span>
          <span class="stat-value">{result.travelTime.toFixed(1)} hrs</span>
        </div>
        {#if result.elapsedSeconds !== undefined && $gameState.mission > 0}
          <div class="stat">
            <span class="stat-label">Time used</span>
            <span class="stat-value">{result.elapsedSeconds}s</span>
          </div>
        {/if}
      </div>

      <!-- Score breakdown (only on success) -->
      {#if found}
        <div class="score-card">
          <div class="score-card-title">MISSION SCORE</div>
          <div class="score-lines">
            {#each (result.breakdown || []) as item, i}
              <div class="score-line" class:score-line-visible={i < revealedCount}>
                <span class="score-item-label">{item.label}</span>
                <span class="score-item-val">+{item.value.toLocaleString()}</span>
              </div>
            {/each}
          </div>
          <div class="score-total-row" class:score-total-visible={showTotal}>
            <span>Total</span>
            <span class="score-total-num">{displayTotal.toLocaleString()}</span>
          </div>

          <!-- Stars -->
          {#if showStars}
            <div class="stars" class:stars-visible={showStars}>
              {#each Array(3) as _, i}
                <span class="star" class:star-lit={i < (result.stars || 0)}
                  style="transition-delay: {i * 120}ms">★</span>
              {/each}
            </div>
          {/if}
        </div>
      {/if}

      <!-- Actions -->
      {#if showActions}
        <div class="actions" class:actions-visible={showActions}>
          {#if found}
            {#if hasNextMission}
              <button class="btn-primary" on:click={nextMission}>Next Mission →</button>
            {:else}
              <button class="btn-primary" on:click={() => navigate('/gameover')}>Campaign Complete</button>
            {/if}
          {:else}
            {#if isGameOver}
              <button class="btn-primary" on:click={goHome}>See Final Score</button>
            {:else}
              <button class="btn-primary" on:click={retry}>Retry Mission</button>
              <button class="btn-ghost" on:click={goHome}>Give Up</button>
            {/if}
          {/if}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .no-result {
    display: flex; align-items: center; justify-content: center;
    min-height: 100vh; color: rgba(255,255,255,0.35); font-size: 14px;
  }

  .page {
    position: relative; min-height: 100vh;
    display: flex; align-items: center; justify-content: center;
    padding: 48px 24px; overflow: hidden;
  }

  /* Background */
  .bg-glow {
    position: absolute; inset: 0; pointer-events: none;
    background: radial-gradient(ellipse 70% 60% at 50% 40%, rgba(139,92,246,0.12) 0%, transparent 70%);
    animation: pulse 3s ease-in-out infinite;
  }
  @keyframes pulse { 0%,100%{opacity:0.6} 50%{opacity:1} }

  .content {
    position: relative; z-index: 1;
    display: flex; flex-direction: column; align-items: center;
    text-align: center; max-width: 440px; width: 100%;
  }

  /* Lives bar */
  .lives-bar {
    display: flex; align-items: center; gap: 6px;
    margin-bottom: 36px; width: 100%;
  }
  .life-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: #8b5cf6; box-shadow: 0 0 6px rgba(139,92,246,0.6);
  }
  .life-dot-lost { background: rgba(255,255,255,0.1); box-shadow: none; }
  .lives-label { font-size: 10px; color: rgba(255,255,255,0.25); margin-left: 4px; }
  .score-label  { margin-left: auto; font-size: 10px; font-weight: 700; color: rgba(167,139,250,0.55); }

  /* Craft */
  .craft-wrap { margin-bottom: 24px; }
  .craft-found {
    color: #a78bfa;
    filter: drop-shadow(0 0 20px rgba(139,92,246,0.55));
    animation: float 3s ease-in-out infinite;
  }
  .craft-fail { color: rgba(239,68,68,0.45); filter: drop-shadow(0 0 14px rgba(239,68,68,0.25)); }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }

  /* Status */
  .mission-tag {
    font-size: 9px; font-weight: 800; letter-spacing: 0.3em;
    color: rgba(139,92,246,0.55); margin-bottom: 10px;
  }

  .headline {
    font-size: clamp(40px, 9vw, 72px); font-weight: 900;
    letter-spacing: -0.03em; line-height: 1; margin-bottom: 14px;
  }
  .headline-found {
    background: linear-gradient(135deg, #8b5cf6, #c4b5fd);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .headline-fail { color: rgba(255,255,255,0.45); }

  .detail { font-size: 14px; color: rgba(255,255,255,0.45); line-height: 1.7; margin-bottom: 20px; }
  .planet { color: #c4b5fd; font-weight: 700; }

  /* Stats */
  .stat-row {
    display: flex; gap: 24px; margin-bottom: 28px;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 10px; padding: 14px 24px;
    background: rgba(255,255,255,0.025);
  }
  .stat { display: flex; flex-direction: column; align-items: center; gap: 3px; }
  .stat-label { font-size: 9px; font-weight: 700; letter-spacing: 0.18em; color: rgba(255,255,255,0.25); text-transform: uppercase; }
  .stat-value { font-size: 20px; font-weight: 800; color: #a78bfa; font-variant-numeric: tabular-nums; }

  /* Score card */
  .score-card {
    width: 100%; background: rgba(139,92,246,0.055);
    border: 1px solid rgba(139,92,246,0.2); border-radius: 12px;
    padding: 20px 22px; margin-bottom: 28px; text-align: left;
  }

  .score-card-title {
    font-size: 8px; font-weight: 800; letter-spacing: 0.28em;
    color: rgba(139,92,246,0.5); margin-bottom: 14px;
  }

  .score-lines { display: flex; flex-direction: column; gap: 7px; margin-bottom: 12px; }

  .score-line {
    display: flex; justify-content: space-between; align-items: center;
    font-size: 12px; opacity: 0; transform: translateX(-8px);
    transition: opacity 0.3s, transform 0.3s;
  }
  .score-line-visible { opacity: 1; transform: translateX(0); }

  .score-item-label { color: rgba(255,255,255,0.5); }
  .score-item-val   { color: rgba(167,139,250,0.9); font-weight: 700; font-variant-numeric: tabular-nums; }

  .score-total-row {
    display: flex; justify-content: space-between; align-items: center;
    border-top: 1px solid rgba(139,92,246,0.18); padding-top: 10px;
    font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.3);
    opacity: 0; transition: opacity 0.4s;
  }
  .score-total-visible { opacity: 1; }

  .score-total-num {
    font-size: 24px; font-weight: 900; color: #c4b5fd;
    font-variant-numeric: tabular-nums; letter-spacing: -0.02em;
  }

  /* Stars */
  .stars { display: flex; justify-content: center; gap: 6px; margin-top: 14px; }
  .star { font-size: 26px; color: rgba(255,255,255,0.1); transition: color 0.3s, filter 0.3s; }
  .star-lit { color: #fbbf24; filter: drop-shadow(0 0 6px rgba(251,191,36,0.55)); }

  /* Actions */
  .actions {
    display: flex; flex-direction: column; align-items: center; gap: 12px;
    opacity: 0; transform: translateY(8px); transition: opacity 0.4s, transform 0.4s;
  }
  .actions-visible { opacity: 1; transform: translateY(0); }

  .btn-primary {
    background: linear-gradient(135deg, #7c3aed, #6d28d9);
    border: 1px solid rgba(139,92,246,0.4); border-radius: 9px;
    color: rgba(255,255,255,0.95); font-size: 13px; font-weight: 700;
    letter-spacing: 0.06em; padding: 12px 32px;
    box-shadow: 0 0 20px rgba(124,58,237,0.25); transition: all 0.2s;
  }
  .btn-primary:hover { background: linear-gradient(135deg,#8b5cf6,#7c3aed); box-shadow: 0 0 30px rgba(139,92,246,0.4); transform: translateY(-1px); }

  .btn-ghost { font-size: 11px; color: rgba(255,255,255,0.25); background: none; border: none; transition: color 0.15s; }
  .btn-ghost:hover { color: rgba(255,255,255,0.55); }
</style>
