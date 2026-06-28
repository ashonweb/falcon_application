<script>
  import { Router, Route } from 'svelte-routing';
  import Game     from './Game.svelte';
  import Result   from './Result.svelte';
  import Briefing from './Briefing.svelte';
  import GameOver from './GameOver.svelte';
  import { gameState, MISSIONS } from './stores.js';

  export let url = '';

  function beginCampaign() {
    gameState.set({ mission: 0, lives: 3, totalScore: 0, streak: 0, highScore: $gameState.highScore });
  }
</script>

<Router url="{url}">
  <Route path="/">
    <div class="landing">
      <div class="landing-inner">
        <div class="eyebrow">GALACTIC MISSION</div>
        <h1 class="title">
          Finding<br/>
          <span class="title-accent">Falcon</span>
        </h1>
        <div class="lore">
          <p>
            In the distant galaxy of <strong>Tara B</strong>, Queen Al Falcone of Falicornia
            has been exiled by King Shan and gone into hiding across one of six known planets.
          </p>
          <p>
            You have been tasked with locating her. Deploy four space vehicles across four
            planets — but choose wisely. Each vehicle has limited range and speed.
          </p>
        </div>
        <div class="instructions">
          <div class="inst-item">
            <span class="inst-num">01</span>
            <span>Choose 4 planets from the 6 known hiding spots</span>
          </div>
          <div class="inst-item">
            <span class="inst-num">02</span>
            <span>Assign a space vehicle to each destination</span>
          </div>
          <div class="inst-item">
            <span class="inst-num">03</span>
            <span>Vehicles with insufficient range cannot reach distant planets</span>
          </div>
          <div class="inst-item">
            <span class="inst-num">04</span>
            <span>The Queen's location changes every mission — good luck</span>
          </div>
        </div>
        <a href="/briefing" class="cta" on:click={beginCampaign}>
          <span>Begin Mission</span>
          <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
            <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </a>
      </div>

      <div class="planet-orbit" aria-hidden="true">
        <div class="orbit-ring ring-1">
          <div class="orbit-dot"></div>
        </div>
        <div class="orbit-ring ring-2">
          <div class="orbit-dot"></div>
        </div>
        <div class="orbit-ring ring-3">
          <div class="orbit-dot"></div>
        </div>
        <div class="orbit-planet"></div>
      </div>
    </div>
  </Route>

  <Route path="/briefing" component="{Briefing}" />
  <Route path="/find" component="{Game}" />
  <Route path="/result" component="{Result}" />
  <Route path="/gameover" component="{GameOver}" />
</Router>

<style>
  .landing {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 80px;
    padding: 48px 32px;
    max-width: 1100px;
    margin: 0 auto;
  }

  .landing-inner {
    max-width: 540px;
  }

  .eyebrow {
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: #8b5cf6;
    margin-bottom: 16px;
  }

  .title {
    font-size: clamp(52px, 8vw, 88px);
    font-weight: 900;
    line-height: 1.0;
    letter-spacing: -0.03em;
    color: rgba(255, 255, 255, 0.95);
    margin-bottom: 32px;
  }

  .title-accent {
    background: linear-gradient(135deg, #8b5cf6 0%, #c4b5fd 50%, #a78bfa 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .lore {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 32px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.5);
    line-height: 1.7;
  }

  .lore strong {
    color: rgba(255, 255, 255, 0.75);
    font-weight: 600;
  }

  .instructions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 40px;
  }

  .inst-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.55);
  }

  .inst-num {
    flex-shrink: 0;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.1em;
    color: #7c3aed;
    padding-top: 2px;
  }

  .cta {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
    border: 1px solid rgba(139, 92, 246, 0.4);
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.95);
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.06em;
    padding: 14px 28px;
    text-decoration: none;
    transition: all 0.2s;
    box-shadow: 0 0 24px rgba(124, 58, 237, 0.3);
  }

  .cta:hover {
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    box-shadow: 0 0 36px rgba(139, 92, 246, 0.45);
    transform: translateY(-1px);
    color: #fff;
  }

  /* Decorative orbit animation */
  .planet-orbit {
    position: relative;
    width: 320px;
    height: 320px;
    flex-shrink: 0;
  }

  .orbit-planet {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 35%, #a78bfa, #4c1d95);
    box-shadow: 0 0 32px rgba(139, 92, 246, 0.5), 0 0 64px rgba(139, 92, 246, 0.2);
  }

  .orbit-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    border-radius: 50%;
    border: 1px solid rgba(139, 92, 246, 0.2);
    animation: orbit linear infinite;
  }

  .ring-1 {
    width: 130px;
    height: 130px;
    margin-top: -65px;
    margin-left: -65px;
    animation-duration: 6s;
  }

  .ring-2 {
    width: 210px;
    height: 210px;
    margin-top: -105px;
    margin-left: -105px;
    animation-duration: 10s;
    animation-direction: reverse;
  }

  .ring-3 {
    width: 300px;
    height: 300px;
    margin-top: -150px;
    margin-left: -150px;
    animation-duration: 16s;
  }

  .orbit-dot {
    position: absolute;
    top: -4px;
    left: 50%;
    transform: translateX(-50%);
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #a78bfa;
    box-shadow: 0 0 8px rgba(167, 139, 250, 0.8);
  }

  @keyframes orbit {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  @media (max-width: 768px) {
    .landing { flex-direction: column; gap: 40px; padding: 40px 20px; }
    .planet-orbit { width: 200px; height: 200px; }
    .ring-3 { display: none; }
    .ring-2 { width: 160px; height: 160px; margin-top: -80px; margin-left: -80px; }
    .ring-1 { width: 100px; height: 100px; margin-top: -50px; margin-left: -50px; }
  }
</style>
