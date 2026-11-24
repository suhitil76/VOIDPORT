/**
 * VOIDPORT — Four Unique Interactive Puzzles System
 * Handles UI overlay, interactive logic, hints, sound feedback, and unlock state
 * for all 4 towers:
 * - Tower 01: The Signal Tower (Harmonic Sequence Memory)
 * - Tower 02: The Reactor (Concentric Energy Ring Alignment)
 * - Tower 03: The Archive (Data Fragment Reconstruction)
 * - Tower 04: The Nexus (Network Grid Node Connection)
 */
import { soundSystem } from '../audio/FuturisticSoundSystem.js';

export class PuzzleSystem {
  constructor(onPuzzleComplete) {
    this.onPuzzleComplete = onPuzzleComplete;
    this.activeBuildingId = null;
    this.completedTowers = {
      signal: false,
      reactor: false,
      archive: false,
      nexus: false
    };

    this.container = null;
    this.createDOM();
  }

  createDOM() {
    // Puzzle Modal Container
    this.container = document.createElement('div');
    this.container.id = 'puzzle-modal';
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(5, 7, 14, 0.85);
      backdrop-filter: blur(14px);
      z-index: 1000;
      display: none;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
      font-family: 'Rajdhani', -apple-system, sans-serif;
    `;

    this.container.innerHTML = `
      <div id="puzzle-card" style="
        width: 580px;
        max-width: 92vw;
        background: linear-gradient(135deg, rgba(16, 22, 36, 0.95), rgba(9, 12, 22, 0.98));
        border: 1px solid rgba(0, 204, 255, 0.35);
        border-radius: 12px;
        box-shadow: 0 16px 48px rgba(0, 0, 0, 0.8), 0 0 32px rgba(0, 204, 255, 0.15);
        padding: 32px;
        color: #e0eaf5;
        position: relative;
        overflow: hidden;
      ">
        <!-- Close Button -->
        <button id="puzzle-close-btn" style="
          position: absolute;
          top: 20px;
          right: 20px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #8da4be;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        ">✕</button>

        <!-- Header -->
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
          <span id="puzzle-tower-tag" style="
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 2px;
            padding: 3px 8px;
            border-radius: 3px;
            background: rgba(0, 204, 255, 0.15);
            border: 1px solid rgba(0, 204, 255, 0.4);
            color: #00ccff;
            text-transform: uppercase;
          ">BUILDING 01</span>
          <span style="font-size: 11px; color: #64748b; letter-spacing: 1.5px;">SYSTEM ACCESS TERMINAL</span>
        </div>

        <h2 id="puzzle-title" style="
          font-size: 24px;
          font-weight: 700;
          letter-spacing: 3px;
          color: #ffffff;
          margin-bottom: 8px;
          text-transform: uppercase;
          text-shadow: 0 0 12px rgba(0, 204, 255, 0.4);
        ">THE SIGNAL TOWER</h2>

        <p id="puzzle-desc" style="
          font-size: 13px;
          color: #94a3b8;
          line-height: 1.5;
          margin-bottom: 24px;
        ">Reproduce the illuminated transmission sequence to unlock the communications array.</p>

        <!-- Interactive Puzzle Area -->
        <div id="puzzle-interactive-area" style="
          min-height: 240px;
          background: rgba(7, 10, 18, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          position: relative;
        "></div>

        <!-- Footer Actions -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
          <button id="puzzle-hint-btn" style="
            background: rgba(14, 20, 32, 0.8);
            border: 1px solid rgba(0, 204, 255, 0.3);
            color: #7dd3fc;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 1px;
            cursor: pointer;
            transition: all 0.2s;
            text-transform: uppercase;
          ">💡 Need a Hint?</button>

          <div id="puzzle-status-msg" style="
            font-size: 13px;
            letter-spacing: 1px;
            color: #94a3b8;
            font-weight: 600;
          ">AWAITING INPUT...</div>
        </div>
      </div>
    `;

    document.body.appendChild(this.container);

    // Event listeners
    document.getElementById('puzzle-close-btn').addEventListener('click', () => this.close());
    document.getElementById('puzzle-hint-btn').addEventListener('click', () => this.triggerHint());
  }

  open(buildingId) {
    if (this.completedTowers[buildingId]) {
      return; // Already unlocked
    }

    this.activeBuildingId = buildingId;
    const modal = this.container;
    modal.style.display = 'flex';
    setTimeout(() => { modal.style.opacity = '1'; }, 10);

    soundSystem.playClick();

    if (buildingId === 'signal') this.setupSignalPuzzle();
    if (buildingId === 'reactor') this.setupReactorPuzzle();
    if (buildingId === 'archive') this.setupArchivePuzzle();
    if (buildingId === 'nexus') this.setupNexusPuzzle();
  }

  close() {
    soundSystem.playClick();
    this.container.style.opacity = '0';
    setTimeout(() => {
      this.container.style.display = 'none';
      this.activeBuildingId = null;
    }, 300);
  }

  onSolved(buildingId) {
    this.completedTowers[buildingId] = true;
    soundSystem.playPuzzleSuccess();
    soundSystem.playBuildingUnlock();

    const statusMsg = document.getElementById('puzzle-status-msg');
    statusMsg.textContent = 'ACCESS GRANTED — TOWER RESTORED';
    statusMsg.style.color = '#34d399';

    // Celebration flash
    const card = document.getElementById('puzzle-card');
    card.style.boxShadow = '0 0 45px rgba(52, 211, 153, 0.6)';

    setTimeout(() => {
      card.style.boxShadow = '0 16px 48px rgba(0, 0, 0, 0.8), 0 0 32px rgba(0, 204, 255, 0.15)';
      this.close();
      if (this.onPuzzleComplete) {
        this.onPuzzleComplete(buildingId, this.getCompletionCount());
      }
    }, 1400);
  }

  getCompletionCount() {
    return Object.values(this.completedTowers).filter(Boolean).length;
  }

  // ═══════════════════════════════════════════════════════════════
  // PUZZLE 1: THE SIGNAL TOWER (Harmonic Sequence Memory)
  // ═══════════════════════════════════════════════════════════════
  setupSignalPuzzle() {
    document.getElementById('puzzle-tower-tag').textContent = 'NORTH TOWER — 01';
    document.getElementById('puzzle-tower-tag').style.color = '#00e5ff';
    document.getElementById('puzzle-tower-tag').style.borderColor = '#00e5ff';
    document.getElementById('puzzle-title').textContent = 'THE SIGNAL TOWER';
    document.getElementById('puzzle-desc').textContent = 
      'Observe the harmonic transmission sequence, then reproduce the frequencies to calibrate the antenna array.';

    const area = document.getElementById('puzzle-interactive-area');
    area.innerHTML = `
      <div style="display: flex; gap: 16px; margin-bottom: 24px;">
        <button class="signal-btn" data-id="0" style="width: 72px; height: 72px; border-radius: 8px; background: #0f172a; border: 2px solid #00e5ff; color: #00e5ff; font-size: 20px; font-weight: 700; cursor: pointer; transition: all 0.2s;">α</button>
        <button class="signal-btn" data-id="1" style="width: 72px; height: 72px; border-radius: 8px; background: #0f172a; border: 2px solid #38bdf8; color: #38bdf8; font-size: 20px; font-weight: 700; cursor: pointer; transition: all 0.2s;">β</button>
        <button class="signal-btn" data-id="2" style="width: 72px; height: 72px; border-radius: 8px; background: #0f172a; border: 2px solid #818cf8; color: #818cf8; font-size: 20px; font-weight: 700; cursor: pointer; transition: all 0.2s;">γ</button>
        <button class="signal-btn" data-id="3" style="width: 72px; height: 72px; border-radius: 8px; background: #0f172a; border: 2px solid #c084fc; color: #c084fc; font-size: 20px; font-weight: 700; cursor: pointer; transition: all 0.2s;">δ</button>
      </div>
      <button id="signal-play-btn" style="
        background: linear-gradient(135deg, #0284c7, #0369a1);
        border: none;
        color: #ffffff;
        padding: 8px 20px;
        border-radius: 4px;
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 1.5px;
        cursor: pointer;
        text-transform: uppercase;
      ">Play Signal Sequence</button>
    `;

    const sequence = [0, 2, 1, 3]; // 4-step sequence
    let playerInput = [];
    let isPlayingSeq = false;

    const playSequence = async () => {
      isPlayingSeq = true;
      playerInput = [];
      document.getElementById('puzzle-status-msg').textContent = 'TRANSMITTING SIGNAL...';
      document.getElementById('puzzle-status-msg').style.color = '#38bdf8';

      const buttons = area.querySelectorAll('.signal-btn');
      for (const idx of sequence) {
        await new Promise(r => setTimeout(r, 450));
        const btn = buttons[idx];
        btn.style.background = '#00e5ff';
        btn.style.color = '#000000';
        btn.style.boxShadow = '0 0 20px #00e5ff';
        soundSystem.playPuzzleStep(300 + idx * 120);

        await new Promise(r => setTimeout(r, 380));
        btn.style.background = '#0f172a';
        btn.style.color = btn.style.borderColor;
        btn.style.boxShadow = 'none';
      }

      document.getElementById('puzzle-status-msg').textContent = 'REPEAT THE SEQUENCE';
      isPlayingSeq = false;
    };

    document.getElementById('signal-play-btn').addEventListener('click', () => {
      if (!isPlayingSeq) playSequence();
    });

    area.querySelectorAll('.signal-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (isPlayingSeq) return;
        const id = parseInt(btn.dataset.id);
        soundSystem.playPuzzleStep(300 + id * 120);

        btn.style.transform = 'scale(0.92)';
        setTimeout(() => { btn.style.transform = 'scale(1)'; }, 150);

        playerInput.push(id);
        const curStep = playerInput.length - 1;

        if (playerInput[curStep] !== sequence[curStep]) {
          // Failed
          document.getElementById('puzzle-status-msg').textContent = 'SIGNAL DESYNC — TRY AGAIN';
          document.getElementById('puzzle-status-msg').style.color = '#f87171';
          playerInput = [];
          setTimeout(playSequence, 900);
          return;
        }

        if (playerInput.length === sequence.length) {
          this.onSolved('signal');
        }
      });
    });

    // Auto play initial sequence
    setTimeout(playSequence, 500);

    this.currentHint = () => {
      const nextRequired = sequence[playerInput.length] ?? sequence[0];
      const names = ['α (Alpha)', 'β (Beta)', 'γ (Gamma)', 'δ (Delta)'];
      document.getElementById('puzzle-status-msg').textContent = `HINT: Next harmonic is ${names[nextRequired]}`;
      document.getElementById('puzzle-status-msg').style.color = '#fbbf24';
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // PUZZLE 2: THE REACTOR (Energy Ring Alignment)
  // ═══════════════════════════════════════════════════════════════
  setupReactorPuzzle() {
    document.getElementById('puzzle-tower-tag').textContent = 'EAST TOWER — 02';
    document.getElementById('puzzle-tower-tag').style.color = '#fb923c';
    document.getElementById('puzzle-tower-tag').style.borderColor = '#fb923c';
    document.getElementById('puzzle-title').textContent = 'THE REACTOR';
    document.getElementById('puzzle-desc').textContent = 
      'Rotate the 3 magnetic containment rings until all power channels align vertically to close the primary circuit.';

    const area = document.getElementById('puzzle-interactive-area');
    area.innerHTML = `
      <div style="position: relative; width: 220px; height: 220px; display: flex; align-items: center; justify-content: center;">
        <!-- Center Core -->
        <div style="width: 36px; height: 36px; border-radius: 50%; background: #ea580c; box-shadow: 0 0 16px #ea580c; z-index: 5;"></div>

        <!-- Inner Ring -->
        <div id="ring-inner" class="reactor-ring" data-angle="90" style="
          position: absolute;
          width: 90px;
          height: 90px;
          border-radius: 50%;
          border: 4px dashed #fb923c;
          cursor: pointer;
          transition: transform 0.3s ease;
          transform: rotate(90deg);
        "></div>

        <!-- Middle Ring -->
        <div id="ring-middle" class="reactor-ring" data-angle="180" style="
          position: absolute;
          width: 145px;
          height: 145px;
          border-radius: 50%;
          border: 4px dashed #f97316;
          cursor: pointer;
          transition: transform 0.3s ease;
          transform: rotate(180deg);
        "></div>

        <!-- Outer Ring -->
        <div id="ring-outer" class="reactor-ring" data-angle="270" style="
          position: absolute;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          border: 4px dashed #fdba74;
          cursor: pointer;
          transition: transform 0.3s ease;
          transform: rotate(270deg);
        "></div>
      </div>
      <div style="font-size: 11px; color: #64748b; margin-top: 14px; letter-spacing: 1px;">CLICK ANY RING TO ROTATE BY 90°</div>
    `;

    const rings = area.querySelectorAll('.reactor-ring');
    const checkAlignment = () => {
      let allAligned = true;
      rings.forEach(ring => {
        const angle = parseInt(ring.dataset.angle) % 360;
        if (angle !== 0) allAligned = false;
      });

      if (allAligned) {
        rings.forEach(ring => {
          ring.style.border = '4px solid #34d399';
          ring.style.boxShadow = '0 0 16px #34d399';
        });
        this.onSolved('reactor');
      }
    };

    rings.forEach(ring => {
      ring.addEventListener('click', () => {
        let angle = parseInt(ring.dataset.angle) + 90;
        ring.dataset.angle = angle;
        ring.style.transform = `rotate(${angle}deg)`;
        soundSystem.playClick();
        soundSystem.playPuzzleStep(220 + (angle % 360) * 1.5);
        setTimeout(checkAlignment, 320);
      });
    });

    this.currentHint = () => {
      // Find first unaligned ring and rotate it
      for (const ring of rings) {
        let angle = parseInt(ring.dataset.angle) % 360;
        if (angle !== 0) {
          ring.dataset.angle = 0;
          ring.style.transform = 'rotate(0deg)';
          soundSystem.playPuzzleStep(440);
          break;
        }
      }
      setTimeout(checkAlignment, 320);
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // PUZZLE 3: THE ARCHIVE (Data Fragment Reconstruction)
  // ═══════════════════════════════════════════════════════════════
  setupArchivePuzzle() {
    document.getElementById('puzzle-tower-tag').textContent = 'SOUTH TOWER — 03';
    document.getElementById('puzzle-tower-tag').style.color = '#38bdf8';
    document.getElementById('puzzle-tower-tag').style.borderColor = '#38bdf8';
    document.getElementById('puzzle-title').textContent = 'THE ARCHIVE';
    document.getElementById('puzzle-desc').textContent = 
      'Reconstruct the corrupted telemetry log by sequencing the encrypted memory fragments in chronological order (01 → 04).';

    let currentFragments = [
      { id: 2, label: '02_SYNC_GRID', text: 'PHASE 2: Energize radial transmission conduits.' },
      { id: 4, label: '04_IGNITE_BEAM', text: 'PHASE 4: Emit high-altitude atmospheric beam.' },
      { id: 1, label: '01_INIT_CORE', text: 'PHASE 1: Spin central magnetic containment ring.' },
      { id: 3, label: '03_ARRAY_LOCK', text: 'PHASE 3: Lock tower transceivers to central frequency.' }
    ];

    const area = document.getElementById('puzzle-interactive-area');
    let selectedIndex = null;

    const renderList = () => {
      area.innerHTML = `
        <div id="archive-list" style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
          ${currentFragments.map((f, idx) => `
            <div class="archive-item" data-index="${idx}" data-id="${f.id}" style="
              background: ${selectedIndex === idx ? 'rgba(56, 189, 248, 0.25)' : 'rgba(15, 23, 42, 0.9)'};
              border: 1px solid ${selectedIndex === idx ? '#38bdf8' : 'rgba(56, 189, 248, 0.3)'};
              box-shadow: ${selectedIndex === idx ? '0 0 14px rgba(56, 189, 248, 0.6)' : 'none'};
              padding: 10px 16px;
              border-radius: 6px;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: space-between;
              transition: all 0.2s;
            ">
              <div>
                <span style="font-weight: 700; color: #38bdf8; font-size: 13px; margin-right: 10px;">${f.label}</span>
                <span style="color: #94a3b8; font-size: 12px;">${f.text}</span>
              </div>
              <span style="color: ${selectedIndex === idx ? '#38bdf8' : '#475569'}; font-size: 16px;">⇅</span>
            </div>
          `).join('')}
        </div>
        <div style="font-size: 11px; color: #64748b; margin-top: 14px; letter-spacing: 1px;">CLICK TWO ITEMS TO SWAP THEIR POSITIONS (ORDER 01 → 04)</div>
      `;

      area.querySelectorAll('.archive-item').forEach(el => {
        el.addEventListener('click', () => {
          const clickedIdx = parseInt(el.dataset.index);
          soundSystem.playClick();

          if (selectedIndex === null) {
            selectedIndex = clickedIdx;
            renderList();
          } else if (selectedIndex === clickedIdx) {
            selectedIndex = null;
            renderList();
          } else {
            // Swap in array
            const temp = currentFragments[selectedIndex];
            currentFragments[selectedIndex] = currentFragments[clickedIdx];
            currentFragments[clickedIdx] = temp;
            selectedIndex = null;
            renderList();

            soundSystem.playPuzzleStep(320);

            // Check if solved
            const isCorrect = currentFragments.every((item, i) => item.id === i + 1);
            if (isCorrect) {
              const items = area.querySelectorAll('.archive-item');
              items.forEach(it => {
                it.style.borderColor = '#34d399';
                it.style.background = 'rgba(52, 211, 153, 0.2)';
              });
              this.onSolved('archive');
            }
          }
        });
      });
    };

    renderList();

    this.currentHint = () => {
      currentFragments.sort((a, b) => a.id - b.id);
      selectedIndex = null;
      renderList();
      soundSystem.playPuzzleStep(440);
      const items = area.querySelectorAll('.archive-item');
      items.forEach(it => {
        it.style.borderColor = '#34d399';
        it.style.background = 'rgba(52, 211, 153, 0.2)';
      });
      this.onSolved('archive');
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // PUZZLE 4: THE NEXUS (Network Node Routing)
  // ═══════════════════════════════════════════════════════════════
  setupNexusPuzzle() {
    document.getElementById('puzzle-tower-tag').textContent = 'WEST TOWER — 04';
    document.getElementById('puzzle-tower-tag').style.color = '#c084fc';
    document.getElementById('puzzle-tower-tag').style.borderColor = '#c084fc';
    document.getElementById('puzzle-title').textContent = 'THE NEXUS';
    document.getElementById('puzzle-desc').textContent = 
      'Establish a secure routing pathway from ORIGIN [S] to CORE [E] across the neural grid.';

    const area = document.getElementById('puzzle-interactive-area');
    // 3x3 Grid
    const gridLayout = [
      ['S', '.', 'X'],
      ['.', '.', '.'],
      ['X', '.', 'E']
    ];

    area.innerHTML = `
      <div id="nexus-grid" style="display: grid; grid-template-columns: repeat(3, 64px); gap: 12px;">
        ${gridLayout.flatMap((row, r) => row.map((cell, c) => `
          <button class="nexus-node ${cell === 'X' ? 'blocked' : ''} ${cell === 'S' ? 'start active' : ''} ${cell === 'E' ? 'end' : ''}" 
            data-r="${r}" data-c="${c}" style="
            width: 64px;
            height: 64px;
            border-radius: 8px;
            background: ${cell === 'X' ? '#1e1b4b' : cell === 'S' ? '#9333ea' : '#0f172a'};
            border: 2px solid ${cell === 'X' ? '#4338ca' : cell === 'S' ? '#c084fc' : '#334155'};
            color: ${cell === 'X' ? '#6366f1' : '#ffffff'};
            font-size: 16px;
            font-weight: 700;
            cursor: ${cell === 'X' ? 'not-allowed' : 'pointer'};
            transition: all 0.2s;
          ">${cell === 'S' ? 'START' : cell === 'E' ? 'CORE' : cell === 'X' ? '✕' : '○'}</button>
        `)).join('')}
      </div>
      <div style="font-size: 11px; color: #64748b; margin-top: 14px; letter-spacing: 1px;">ACTIVATE ADJACENT NODES TO CONNECT TO CORE</div>
    `;

    const activeCoords = new Set(['0,0']);

    area.querySelectorAll('.nexus-node:not(.blocked)').forEach(btn => {
      btn.addEventListener('click', () => {
        const r = parseInt(btn.dataset.r);
        const c = parseInt(btn.dataset.c);
        const key = `${r},${c}`;

        // Check adjacency to existing active node
        const isAdjacent = Array.from(activeCoords).some(coord => {
          const [ar, ac] = coord.split(',').map(Number);
          return Math.abs(ar - r) + Math.abs(ac - c) === 1;
        });

        if (isAdjacent || key === '0,0') {
          activeCoords.add(key);
          btn.style.background = '#9333ea';
          btn.style.borderColor = '#c084fc';
          btn.style.boxShadow = '0 0 16px #c084fc';
          soundSystem.playPuzzleStep(320 + activeCoords.size * 60);

          if (r === 2 && c === 2) {
            // Reached Core!
            this.onSolved('nexus');
          }
        } else {
          soundSystem.playClick();
        }
      });
    });

    this.currentHint = () => {
      // Connect path: (0,0) -> (1,0) -> (1,1) -> (1,2) -> (2,2)
      const path = [[1,0], [1,1], [1,2], [2,2]];
      path.forEach(([r, c], i) => {
        setTimeout(() => {
          const btn = area.querySelector(`.nexus-node[data-r="${r}"][data-c="${c}"]`);
          if (btn) btn.click();
        }, i * 200);
      });
    };
  }

  triggerHint() {
    soundSystem.playClick();
    if (this.currentHint) {
      this.currentHint();
    }
  }
}
