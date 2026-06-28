<script>
  import { onMount, onDestroy } from 'svelte';
  import { navigate } from 'svelte-routing';
  import { gameState, MISSIONS, missionResult, calculateScore } from './stores.js';

  const API = 'https://findfalcone.geektrust.com';

  const ICON_MAP = {
    'Space pod': 'pod', 'Space rocket': 'rocket',
    'Space shuttle': 'shuttle', 'Falcon': 'falcon',
  };

  let planets  = [];
  let vehicles = [];
  let loading  = true;
  let submitting = false;
  let fetchError = '';

  let elapsed   = 0;
  let countdown = null;
  let timerInterval = null;

  let selections = [
    { planet: '', vehicle: '' },
    { planet: '', vehicle: '' },
    { planet: '', vehicle: '' },
    { planet: '', vehicle: '' },
  ];

  $: currentMission = MISSIONS[$gameState.mission] || MISSIONS[0];

  // Apply vehicle penalty from mission constraints
  $: modifiedVehicles = vehicles.map(v => {
    const penalty = currentMission.vehiclePenalty.includes(v.name) ? 1 : 0;
    return { ...v, total_no: Math.max(0, v.total_no - penalty) };
  });

  onMount(async () => {
    missionResult.set(null); // clear previous result — Briefing already read it
    try {
      const [pr, vr] = await Promise.all([
        fetch(`${API}/planets`),
        fetch(`${API}/vehicles`),
      ]);
      planets  = await pr.json();
      vehicles = await vr.json();
    } catch (e) {
      fetchError = 'Could not load mission data. Please refresh.';
    } finally {
      loading = false;
      if (currentMission.timeLimit) startTimer();
    }
  });

  onDestroy(() => { if (timerInterval) clearInterval(timerInterval); });

  function startTimer() {
    countdown = currentMission.timeLimit;
    timerInterval = setInterval(() => {
      elapsed++;
      countdown--;
      if (countdown <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        handleTimeout();
      }
    }, 1000);
  }

  function handleTimeout() {
    const score = calculateScore(false, totalTime, elapsed, currentMission.timeLimit, $gameState.streak);
    missionResult.set({ found: false, planet: null, travelTime: totalTime, elapsedSeconds: elapsed, timedOut: true, ...score });
    gameState.update(gs => ({ ...gs, lives: gs.lives - 1, streak: 0 }));
    navigate('/result');
  }

  function availablePlanets(i) {
    const chosen = selections.slice(0, i).map(s => s.planet).filter(Boolean);
    return planets.filter(p => !chosen.includes(p.name));
  }

  function availableVehicles(i) {
    const planet = planets.find(p => p.name === selections[i].planet);
    if (!planet) return [];
    const used = {};
    for (let j = 0; j < i; j++) {
      if (selections[j].vehicle) used[selections[j].vehicle] = (used[selections[j].vehicle] || 0) + 1;
    }
    return modifiedVehicles.map(v => {
      const remaining  = v.total_no - (used[v.name] || 0);
      const outOfRange = v.max_distance < planet.distance;
      return { ...v, remaining, outOfRange, disabled: remaining <= 0 || outOfRange, iconId: ICON_MAP[v.name] || 'rocket' };
    });
  }

  function setPlanet(i, value) {
    selections[i] = { planet: value, vehicle: '' };
    selections = [...selections];
  }

  function setVehicle(i, name) {
    selections[i] = { ...selections[i], vehicle: name };
    selections = [...selections];
  }

  $: totalTime = selections.reduce((sum, s) => {
    const p = planets.find(x => x.name === s.planet);
    const v = modifiedVehicles.find(x => x.name === s.vehicle);
    return sum + (p && v ? p.distance / v.speed : 0);
  }, 0);

  $: canSubmit = selections.every(s => s.planet && s.vehicle) && !submitting;

  $: countdownPct = currentMission.timeLimit ? (countdown / currentMission.timeLimit) * 100 : 100;
  $: countdownWarn = countdown !== null && countdown <= 20;
  $: countdownDanger = countdown !== null && countdown <= 10;

  async function submit() {
    if (!canSubmit) return;
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    submitting = true;
    fetchError = '';
    try {
      const tokenRes = await fetch(`${API}/token`, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      });
      const { token } = await tokenRes.json();

      const findRes = await fetch(`${API}/find`, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          planet_names:  selections.map(s => s.planet),
          vehicle_names: selections.map(s => s.vehicle),
        }),
      });
      const result = await findRes.json();
      const found  = result.status === 'success';
      const score  = calculateScore(found, totalTime, elapsed, currentMission.timeLimit, $gameState.streak);

      missionResult.set({ found, planet: result.planet_name, travelTime: totalTime, elapsedSeconds: elapsed, ...score });

      if (found) {
        gameState.update(gs => {
          const newTotal = gs.totalScore + score.total;
          return {
            ...gs,
            totalScore: newTotal,
            streak: gs.streak + 1,
            mission: Math.min(gs.mission + 1, MISSIONS.length),
            highScore: Math.max(gs.highScore, newTotal),
          };
        });
        try { localStorage.setItem('ff_high', String(Math.max($gameState.highScore, $gameState.totalScore))); } catch {}
      } else {
        gameState.update(gs => ({ ...gs, lives: gs.lives - 1, streak: 0 }));
      }

      navigate('/result');
    } catch (e) {
      fetchError = 'Mission launch failed. Please try again.';
      submitting = false;
      if (currentMission.timeLimit && countdown > 0) startTimer();
    }
  }
</script>

<!-- ── Vehicle SVGs ──────────────────────────────────────────── -->
<svg style="display:none">
  <symbol id="icon-pod" viewBox="0 0 64 38">
    <path d="M22 20 Q22 6 32 6 Q42 6 42 20" fill="rgba(167,139,250,0.2)" stroke="currentColor" stroke-width="1.5"/>
    <ellipse cx="32" cy="22" rx="28" ry="9" fill="currentColor"/>
    <ellipse cx="27" cy="13" rx="4" ry="3" fill="rgba(255,255,255,0.14)"/>
    <ellipse cx="32" cy="28" rx="16" ry="4" fill="rgba(139,92,246,0.45)"/>
    <circle cx="14" cy="24" r="1.5" fill="#fde68a"/>
    <circle cx="24" cy="27" r="1.5" fill="#fde68a"/>
    <circle cx="32" cy="28" r="1.5" fill="#fde68a"/>
    <circle cx="40" cy="27" r="1.5" fill="#fde68a"/>
    <circle cx="50" cy="24" r="1.5" fill="#fde68a"/>
  </symbol>
  <symbol id="icon-rocket" viewBox="0 0 44 82">
    <rect x="14" y="22" width="16" height="42" rx="3" fill="currentColor"/>
    <path d="M14 24 Q22 2 30 24 Z" fill="currentColor"/>
    <path d="M14 54 L4 70 L14 64 Z" fill="currentColor" opacity="0.7"/>
    <path d="M30 54 L40 70 L30 64 Z" fill="currentColor" opacity="0.7"/>
    <circle cx="22" cy="36" r="5" fill="rgba(147,210,255,0.45)" stroke="rgba(255,255,255,0.25)" stroke-width="1"/>
    <path d="M16 66 Q22 80 28 66" fill="rgba(251,146,60,0.75)"/>
    <path d="M18 66 Q22 75 26 66" fill="rgba(253,224,71,0.85)"/>
  </symbol>
  <symbol id="icon-shuttle" viewBox="0 0 82 58">
    <path d="M8 29 Q16 14 36 10 Q56 6 70 20 L74 29 L70 38 Q56 52 36 48 Q16 44 8 29 Z" fill="currentColor"/>
    <path d="M24 34 L2 50 L20 42 Z" fill="currentColor" opacity="0.65"/>
    <path d="M24 24 L2 8 L20 16 Z" fill="currentColor" opacity="0.65"/>
    <ellipse cx="60" cy="29" rx="10" ry="7" fill="rgba(147,210,255,0.35)" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
    <ellipse cx="10" cy="29" rx="5" ry="8" fill="rgba(251,146,60,0.65)"/>
  </symbol>
  <symbol id="icon-falcon" viewBox="0 0 52 86">
    <path d="M26 4 L36 30 L32 74 L26 70 L20 74 L16 30 Z" fill="currentColor"/>
    <path d="M20 36 L2 58 L18 47 Z" fill="currentColor" opacity="0.75"/>
    <path d="M32 36 L50 58 L34 47 Z" fill="currentColor" opacity="0.75"/>
    <ellipse cx="26" cy="16" rx="5" ry="7" fill="rgba(147,210,255,0.38)"/>
    <circle cx="26" cy="6" r="2.5" fill="rgba(167,243,208,0.9)"/>
    <path d="M20 74 Q26 86 32 74" fill="rgba(139,92,246,0.75)"/>
    <path d="M22 74 Q26 82 30 74" fill="rgba(167,139,250,0.9)"/>
  </symbol>
</svg>

<div class="page">
  <header class="hdr">
    <div class="hdr-left">
      <a href="/briefing" class="back-link">← Briefing</a>
      <span class="mission-tag">Mission {$gameState.mission + 1} — {currentMission.name}</span>
    </div>
    <div class="hdr-right">
      {#if countdown !== null}
        <div class="countdown" class:countdown-warn={countdownWarn} class:countdown-danger={countdownDanger}>
          <div class="countdown-bar" style="width:{countdownPct}%"></div>
          <span class="countdown-val">{countdown}s</span>
        </div>
      {/if}
      <div class="timer" class:timer-active={totalTime > 0}>
        <span class="timer-label">TRAVEL TIME</span>
        <span class="timer-value">{totalTime.toFixed(1)} hrs</span>
      </div>
      <div class="lives-mini">
        {#each Array(3) as _, i}
          <span class="life-dot" class:life-dot-lost={i >= $gameState.lives}></span>
        {/each}
      </div>
    </div>
  </header>

  <main class="main">
    {#if loading}
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Scanning the galaxy…</p>
      </div>
    {:else if fetchError && !submitting}
      <div class="error-state">
        <p>{fetchError}</p>
        <button on:click={() => window.location.reload()}>Retry</button>
      </div>
    {:else}
      <div class="section-label">SELECT 4 DESTINATIONS + VEHICLES</div>

      <div class="slots">
        {#each selections as sel, i}
          <div class="slot" class:slot-complete={sel.vehicle}>
            <div class="slot-header">
              <span class="slot-num">0{i + 1}</span>
              <span class="slot-title">Destination</span>
              {#if sel.vehicle}<span class="slot-check">LOCKED</span>{/if}
            </div>

            <div class="field">
              <select value={sel.planet} on:change={e => setPlanet(i, e.target.value)} class:selected={sel.planet}>
                <option value="">— Choose planet —</option>
                {#each availablePlanets(i) as p}
                  <option value={p.name}>
                    {p.name}{currentMission.hiddenDistances ? '' : ' · ' + p.distance + ' LY'}
                  </option>
                {/each}
              </select>
            </div>

            {#if sel.planet}
              <div class="vehicle-grid">
                {#each availableVehicles(i) as v}
                  <label
                    class="v-card"
                    class:v-disabled={v.disabled}
                    class:v-selected={sel.vehicle === v.name}
                    title={v.outOfRange ? 'Out of range' : v.remaining <= 0 ? 'None available' : ''}
                  >
                    <input
                      type="radio"
                      name="veh-{i}"
                      value={v.name}
                      disabled={v.disabled}
                      checked={sel.vehicle === v.name}
                      on:change={() => setVehicle(i, v.name)}
                    />
                    <svg class="v-icon" viewBox="0 0 52 86" aria-hidden="true">
                      <use href="#icon-{v.iconId}" style="color:currentColor"/>
                    </svg>
                    <div class="v-info">
                      <span class="v-name">{v.name}</span>
                      <span class="v-stat">
                        {#if v.outOfRange}
                          <span class="v-err">Out of range</span>
                        {:else if v.remaining <= 0}
                          <span class="v-err">Unavailable</span>
                        {:else}
                          <span class="v-ok">{v.remaining} avail</span>
                        {/if}
                      </span>
                      <span class="v-speed">
                        {v.speed} LY/hr
                        {currentMission.hiddenDistances ? '' : '· ' + v.max_distance + ' LY range'}
                      </span>
                    </div>
                  </label>
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      </div>

      {#if fetchError}<p class="submit-error">{fetchError}</p>{/if}

      <div class="submit-row">
        <button class="launch-btn" on:click={submit} disabled={!canSubmit}>
          {#if submitting}
            <div class="btn-spinner"></div>
            Launching…
          {:else}
            Launch Mission
            <svg viewBox="0 0 52 86" fill="none" width="13" height="20">
              <use href="#icon-falcon" style="color:currentColor"/>
            </svg>
          {/if}
        </button>
        <span class="submit-hint">
          {#if canSubmit}All destinations locked — ready to launch
          {:else}Assign a vehicle to all 4 destinations{/if}
        </span>
      </div>
    {/if}
  </main>
</div>

<style>
  .page { min-height: 100vh; display: flex; flex-direction: column; }

  /* ── Header ────────────────────────────────────────────────── */
  .hdr {
    position: sticky; top: 0; z-index: 10;
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 24px;
    background: rgba(3,4,8,0.88);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(139,92,246,0.15);
    gap: 16px;
    flex-wrap: wrap;
  }

  .hdr-left { display: flex; align-items: center; gap: 14px; }
  .hdr-right { display: flex; align-items: center; gap: 16px; }

  .back-link {
    font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.3);
    text-decoration: none; letter-spacing: 0.06em; transition: color 0.15s;
  }
  .back-link:hover { color: rgba(255,255,255,0.65); }

  .mission-tag {
    font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
    color: rgba(167,139,250,0.6);
  }

  /* Countdown */
  .countdown {
    position: relative;
    display: flex; align-items: center;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 6px;
    overflow: hidden;
    min-width: 80px; height: 28px;
    transition: border-color 0.3s;
  }

  .countdown-warn  { border-color: rgba(251,191,36,0.4); }
  .countdown-danger{ border-color: rgba(239,68,68,0.5); }

  .countdown-bar {
    position: absolute; left: 0; top: 0; bottom: 0;
    background: rgba(139,92,246,0.25);
    transition: width 1s linear, background 0.3s;
  }
  .countdown-warn  .countdown-bar { background: rgba(251,191,36,0.2); }
  .countdown-danger .countdown-bar { background: rgba(239,68,68,0.25); }

  .countdown-val {
    position: relative; z-index: 1;
    font-size: 12px; font-weight: 800;
    font-variant-numeric: tabular-nums;
    color: rgba(255,255,255,0.75);
    padding: 0 12px;
    transition: color 0.3s;
  }
  .countdown-warn  .countdown-val { color: rgba(251,191,36,0.9); }
  .countdown-danger .countdown-val { color: rgba(239,68,68,0.95); animation: blink 0.5s infinite; }

  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.4} }

  /* Timer */
  .timer { display: flex; flex-direction: column; align-items: flex-end; gap: 1px; }
  .timer-label { font-size: 8px; font-weight: 800; letter-spacing: 0.22em; color: rgba(255,255,255,0.2); }
  .timer-value { font-size: 15px; font-weight: 800; font-variant-numeric: tabular-nums; color: rgba(255,255,255,0.25); transition: color 0.3s; }
  .timer-active .timer-value { color: #a78bfa; }

  /* Lives */
  .lives-mini { display: flex; gap: 5px; }
  .life-dot { width: 8px; height: 8px; border-radius: 50%; background: #8b5cf6; box-shadow: 0 0 6px rgba(139,92,246,0.6); }
  .life-dot-lost { background: rgba(255,255,255,0.1); box-shadow: none; }

  /* ── Main ──────────────────────────────────────────────────── */
  .main { flex: 1; max-width: 1100px; margin: 0 auto; padding: 28px 20px 56px; width: 100%; }

  .section-label { font-size: 9px; font-weight: 800; letter-spacing: 0.28em; color: rgba(139,92,246,0.55); margin-bottom: 18px; }

  /* ── Slots ─────────────────────────────────────────────────── */
  .slots { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 32px; }

  .slot {
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(139,92,246,0.12);
    border-radius: 12px; padding: 16px 14px;
    transition: border-color 0.2s, background 0.2s;
  }
  .slot-complete { border-color: rgba(139,92,246,0.38); background: rgba(139,92,246,0.055); }

  .slot-header { display: flex; align-items: center; gap: 7px; margin-bottom: 12px; }
  .slot-num { font-size: 10px; font-weight: 800; letter-spacing: 0.1em; color: #7c3aed; }
  .slot-title { font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.1em; }
  .slot-check { margin-left: auto; font-size: 8px; font-weight: 800; letter-spacing: 0.15em; color: #6ee7b7; }

  /* Select */
  .field { margin-bottom: 12px; }
  select {
    width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09);
    border-radius: 7px; color: rgba(255,255,255,0.4); font-size: 11.5px; padding: 8px 28px 8px 10px;
    outline: none; cursor: pointer; transition: border-color 0.15s, color 0.15s;
    appearance: none; -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(139,92,246,0.5)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 8px center;
  }
  select.selected { border-color: rgba(139,92,246,0.32); color: rgba(255,255,255,0.88); }
  select:focus { border-color: rgba(139,92,246,0.55); }

  /* Vehicle cards */
  .vehicle-grid { display: flex; flex-direction: column; gap: 6px; }

  .v-card {
    position: relative; display: flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06);
    border-radius: 7px; padding: 8px 10px; cursor: pointer; transition: all 0.15s;
  }
  .v-card input { display: none; }
  .v-card:not(.v-disabled):hover { border-color: rgba(139,92,246,0.32); background: rgba(139,92,246,0.07); }
  .v-selected { border-color: rgba(139,92,246,0.52) !important; background: rgba(139,92,246,0.11) !important; box-shadow: 0 0 10px rgba(139,92,246,0.1); }
  .v-disabled { opacity: 0.28; cursor: not-allowed; pointer-events: none; }

  .v-icon { flex-shrink: 0; width: 20px; height: 28px; color: #a78bfa; }
  .v-selected .v-icon { color: #c4b5fd; }

  .v-info { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
  .v-name { font-size: 10.5px; font-weight: 700; color: rgba(255,255,255,0.72); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .v-selected .v-name { color: #e9d5ff; }
  .v-ok   { font-size: 9.5px; color: rgba(110,231,183,0.75); font-weight: 600; }
  .v-err  { font-size: 9.5px; color: rgba(239,68,68,0.65);   font-weight: 600; }
  .v-speed { font-size: 9px; color: rgba(255,255,255,0.22); }

  /* Submit */
  .submit-row { display: flex; align-items: center; gap: 16px; }

  .launch-btn {
    display: inline-flex; align-items: center; gap: 9px;
    background: linear-gradient(135deg, #7c3aed, #6d28d9);
    border: 1px solid rgba(139,92,246,0.4); border-radius: 9px;
    color: rgba(255,255,255,0.95); font-size: 13px; font-weight: 700; letter-spacing: 0.06em;
    padding: 11px 24px; transition: all 0.2s; box-shadow: 0 0 20px rgba(124,58,237,0.25);
  }
  .launch-btn:not(:disabled):hover { background: linear-gradient(135deg,#8b5cf6,#7c3aed); box-shadow: 0 0 30px rgba(139,92,246,0.4); transform: translateY(-1px); }
  .launch-btn:disabled { opacity: 0.28; cursor: not-allowed; box-shadow: none; }

  .submit-hint { font-size: 11px; color: rgba(255,255,255,0.22); }
  .submit-error { font-size: 12px; color: rgba(239,68,68,0.7); margin-bottom: 10px; }

  /* Loading */
  .loading-state, .error-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; min-height: 50vh; color: rgba(255,255,255,0.3); font-size: 13px; }

  .spinner, .btn-spinner { border-radius: 50%; animation: spin 0.8s linear infinite; }
  .spinner { width: 28px; height: 28px; border: 2px solid rgba(139,92,246,0.2); border-top-color: #8b5cf6; }
  .btn-spinner { width: 12px; height: 12px; border: 2px solid rgba(255,255,255,0.2); border-top-color: #fff; flex-shrink: 0; }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 900px) { .slots { grid-template-columns: repeat(2,1fr); } }
  @media (max-width: 520px) { .slots { grid-template-columns: 1fr; } .main { padding: 18px 14px 44px; } .submit-row { flex-direction: column; align-items: flex-start; } }
</style>
