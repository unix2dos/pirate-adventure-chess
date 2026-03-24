const MOBILE_WIDTH_BREAKPOINT = 820;

function toFiniteDimension(value, fallback = 0) {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function readMetricsFromSource(source = globalThis) {
  if (source && typeof source.width === 'number' && typeof source.height === 'number') {
    return {
      width: toFiniteDimension(source.width),
      height: toFiniteDimension(source.height),
    };
  }

  const visualViewport = source?.visualViewport;
  const width = toFiniteDimension(
    visualViewport?.width,
    toFiniteDimension(source?.innerWidth, 1440),
  );
  const height = toFiniteDimension(
    visualViewport?.height,
    toFiniteDimension(source?.innerHeight, 900),
  );

  return { width, height };
}

export function getViewportLayoutState(source = globalThis) {
  const { width, height } = readMetricsFromSource(source);
  const isPortrait = height >= width;
  const isCompact = width <= MOBILE_WIDTH_BREAKPOINT;
  const mode = !isCompact
    ? 'desktop'
    : isPortrait
      ? 'mobile-portrait'
      : 'mobile-landscape';

  return {
    width,
    height,
    isPortrait,
    isCompact,
    mode,
    hudDocked: mode === 'mobile-portrait',
    infoOverlayLayout: mode === 'desktop' ? 'anchored' : 'modal',
  };
}
