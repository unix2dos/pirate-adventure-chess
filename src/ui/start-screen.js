export function renderStartScreen(root, { onStart }) {
  let selectedCount = 2;

  root.innerHTML = `
    <section data-scene="start">
      <button data-count="3" type="button">3人</button>
      <input id="player-name-0" value="你" />
      <button data-role="start-adventure" type="button">开始冒险</button>
    </section>
  `;

  root.querySelector('[data-count="3"]').addEventListener('click', () => {
    selectedCount = 3;
  });

  root.querySelector('[data-role="start-adventure"]').addEventListener('click', () => {
    onStart({
      players: Array.from({ length: selectedCount }, (_, index) => ({
        name: index === 0 ? (root.querySelector('#player-name-0').value || '你') : `海盗${index}`,
        isAI: false,
      })),
    });
  });
}
