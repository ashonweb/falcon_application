<script>
  import { navigate } from 'svelte-routing';
  import { gameState, MISSIONS } from './stores.js';

  $: state    = $gameState;
  $: beaten   = state.mission >= MISSIONS.length;
  $: isRecord = state.totalScore > 0 && state.totalScore >= state.highScore;

  function newGame() {
    const best = $gameState.highScore;
    gameState.set({ mission: 0, lives: 3, totalScore: 0, streak: 0, highScore: best });
    navigate('/briefing');
  }
</script>

<div class="page">
  <div class="content">
    <!-- Icon -->
    <div class="icon-wrap" class:icon-beat={beaten}>
      {#if beaten}
        <svg viewBox="0 0 52 86" fill="none" width="56" height="90">
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
          <circle cx="40" cy="40" r="30" stroke="currentColor" stroke-width="2" opacity="0.3"/>
          <line x1="27" y1="27" x2="53" y2="53" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity="0.55"/>
          <line x1="53" y1="27" x2="27" y2="53" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity="0.55"/>
        </svg>
      {/if}
    </div>

    <div class="eyebrow">{beaten ? 'CAMPAIGN COMPLETE' : 'GAME OVER'}</div>

    <h1 class="headline" class:headline-beat={beaten}>
      {beaten ? 'The Queen is Caught' : 'Mission Failed'}
    </h1>

    <p class="sub">
      {#if beaten}
        You completed all {MISSIONS.length} missions and brought Queen Al Falcone to justice.
      {:else}
        You ran out of lives on Mission {state.mission + 1}. Better luck next time.
      {/if}
    </p>

    <!-- Scores -->
    <div class="score-board">
      <div class="score-item">
        <span class="score-item-label">Final Score</span>
        <span class="score-item-val score-item-val-big">{state.totalScore.toLocaleString()}</span>
      </div>
      <div class="divider"></div>
      <div class="score-item">
        <span class="score-item-label">Best Score</span>
        <span class="score-item-val" class:score-item-record={isRecord}>
          {state.highScore.toLocaleString()}
          {#if isRecord}<span class="record-tag">NEW</span>{/if}
        </span>
      </div>
      <div class="divider"></div>
      <div class="score-item">
        <span class="score-item-label">Missions Done</span>
        <span class="score-item-val">{state.mission} / {MISSIONS.length}</span>
      </div>
    </div>

    <button class="play-btn" on:click={newGame}>Play Again</button>
    <a href="/" class="home-link">← Return to base</a>
  </div>

  {#if beaten}
    <div class="bg-victory" aria-hidden="true"></div>
  {/if}
</div>

<style>
  .page {
    position: relative; min-height: 100vh;
    display: flex; align-items: center; justify-content: center;
    padding: 48px 24px; overflow: hidden;
  }

  .bg-victory {
    position: absolute; inset: 0; pointer-events: none;
    background: radial-gradient(ellipse 80% 60% at 50% 40%, rgba(139,92,246,0.13) 0%, transparent 70%);
    animation: vpulse 3s ease-in-out infinite;
  }
  @keyframes vpulse { 0%,100%{opacity:0.5} 50%{opacity:1} }

  .content {
    position: relative; z-index: 1;
    display: flex; flex-direction: column; align-items: center;
    text-align: center; max-width: 420px; width: 100%; gap: 0;
  }

  .icon-wrap { margin-bottom: 24px; color: rgba(239,68,68,0.4); filter: drop-shadow(0 0 14px rgba(239,68,68,0.2)); }
  .icon-beat { color: #a78bfa; filter: drop-shadow(0 0 20px rgba(139,92,246,0.55)); animation: float 3s ease-in-out infinite; }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }

  .eyebrow { font-size: 9px; font-weight: 800; letter-spacing: 0.3em; color: rgba(139,92,246,0.5); margin-bottom: 10px; }

  .headline {
    font-size: clamp(38px, 8vw, 64px); font-weight: 900;
    letter-spacing: -0.03em; color: rgba(255,255,255,0.45);
    margin-bottom: 14px; line-height: 1.05;
  }
  .headline-beat {
    background: linear-gradient(135deg, #8b5cf6, #c4b5fd);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }

  .sub { font-size: 13px; color: rgba(255,255,255,0.38); line-height: 1.7; margin-bottom: 32px; }

  /* Score board */
  .score-board {
    display: flex; align-items: center; gap: 0;
    background: rgba(255,255,255,0.025); border: 1px solid rgba(139,92,246,0.15);
    border-radius: 12px; padding: 18px 24px; margin-bottom: 32px;
    width: 100%;
  }

  .score-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 5px; }
  .score-item-label { font-size: 8.5px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.25); }
  .score-item-val { font-size: 18px; font-weight: 800; color: rgba(255,255,255,0.6); font-variant-numeric: tabular-nums; display: flex; align-items: center; gap: 5px; }
  .score-item-val-big { font-size: 26px; color: #c4b5fd; }
  .score-item-record { color: #fbbf24; }

  .record-tag {
    font-size: 8px; font-weight: 800; letter-spacing: 0.1em;
    color: #fbbf24; background: rgba(251,191,36,0.12);
    border: 1px solid rgba(251,191,36,0.3); border-radius: 3px;
    padding: 1px 4px;
  }

  .divider { width: 1px; align-self: stretch; background: rgba(255,255,255,0.06); margin: 0 4px; }

  .play-btn {
    background: linear-gradient(135deg, #7c3aed, #6d28d9);
    border: 1px solid rgba(139,92,246,0.4); border-radius: 9px;
    color: rgba(255,255,255,0.95); font-size: 14px; font-weight: 700;
    letter-spacing: 0.06em; padding: 13px 40px; margin-bottom: 16px;
    box-shadow: 0 0 22px rgba(124,58,237,0.28); transition: all 0.2s;
  }
  .play-btn:hover { background: linear-gradient(135deg,#8b5cf6,#7c3aed); box-shadow: 0 0 32px rgba(139,92,246,0.4); transform: translateY(-1px); }

  .home-link { font-size: 11px; color: rgba(255,255,255,0.22); transition: color 0.15s; }
  .home-link:hover { color: rgba(255,255,255,0.55); }
</style>
