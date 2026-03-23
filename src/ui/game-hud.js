function renderCrewItems(crew, currentPlayerId) {
  return crew
    .map((member) => {
      const active = member.id === currentPlayerId;
      const borderColor = active ? member.color : '#ffffff';
      return `
        <li style="border:2px solid ${borderColor};border-radius:999px;padding:6px 10px;background:#ffffffcc;">
          ${member.name}
        </li>
      `;
    })
    .join('');
}

export function renderGameHud(root, { state }) {
  const currentPlayer = state.currentPlayer ?? { id: 'crew-1', name: '待命船员', color: '#ff6b6b' };
  const crew = Array.isArray(state.crew) && state.crew.length > 0 ? state.crew : [currentPlayer];
  const recentEventTitle = state.recentEvent?.title ?? '准备出航';
  const zoneLabel = state.currentZoneLabel ?? '晴空湾';
  const objective = state.currentObjective ?? `穿越${zoneLabel}`;
  const turnLabel = typeof state.turnNumber === 'number' ? `第 ${state.turnNumber} 回合` : '冒险进行中';

  root.innerHTML = `
    <aside data-scene="game-hud" style="display:flex;flex-direction:column;gap:14px;height:100%;">
      <section data-role="current-player-banner" style="background:#1d4f91;color:#fff;border-radius:16px;padding:12px;">
        <div style="font-size:12px;opacity:0.92;">${turnLabel}</div>
        <div style="display:flex;align-items:center;gap:8px;font-size:20px;font-weight:700;">
          <span style="width:10px;height:10px;border-radius:999px;background:${currentPlayer.color};display:inline-block;"></span>
          ${currentPlayer.name}
        </div>
      </section>
      <section data-role="zone-objective-card" style="background:#f7ffcf;border-radius:16px;padding:12px;">
        <div style="font-size:12px;color:#5d5d35;">海域目标</div>
        <div style="font-weight:700;">${zoneLabel}</div>
        <div>${objective}</div>
      </section>
      <section data-role="recent-encounter-card" style="background:#fff0da;border-radius:16px;padding:12px;">
        <div style="font-size:12px;color:#875f29;">最近遭遇</div>
        <div style="font-weight:700;">${recentEventTitle}</div>
      </section>
      <section data-role="crew-strip" style="background:#eaf5ff;border-radius:16px;padding:12px;">
        <div style="font-size:12px;color:#26456f;margin-bottom:8px;">船员队列</div>
        <ul style="margin:0;padding:0;list-style:none;display:flex;flex-wrap:wrap;gap:8px;">
          ${renderCrewItems(crew, currentPlayer.id)}
        </ul>
      </section>
      <section data-role="action-dock" style="margin-top:auto;background:#ffffffd9;border-radius:18px;padding:10px;display:flex;flex-direction:column;gap:8px;">
        <div style="font-size:12px;color:#36506d;">准备掷骰，继续寻宝航线</div>
        <button data-role="roll-action" type="button" style="border:none;border-radius:14px;padding:12px;background:#ff7b4a;color:#fff;font-size:16px;font-weight:700;cursor:pointer;">
          掷骰出航
        </button>
      </section>
    </aside>
  `;
}
