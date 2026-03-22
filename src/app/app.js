export function createApp(root) {
  if (!root) {
    throw new Error('createApp requires a mount element with id="app".');
  }

  root.innerHTML = `
    <main data-scene="start">
      <button data-role="start-adventure">Start</button>
    </main>
  `;
}
