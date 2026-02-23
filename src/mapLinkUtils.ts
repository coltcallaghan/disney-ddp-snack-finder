/**
 * Utility functions for generating smart map directions links.
 * Auto-selects Apple Maps on iOS/macOS, Google Maps on Android/other.
 */

/**
 * Detect if the current device is Apple (iPhone, iPad, Mac)
 * Used to choose between Apple Maps and Google Maps.
 */
export function isAppleDevice(): boolean {
  const ua = window.navigator.userAgent;
  return (
    ua.includes('iPhone') ||
    ua.includes('iPad') ||
    ua.includes('Mac') ||
    (/AppleWebKit/.test(ua) && !ua.includes('Chrome'))
  );
}

/**
 * Build a walking-directions URL to a destination.
 * Auto-selects Apple Maps (maps://) on iOS/macOS, Google Maps on everything else.
 *
 * @param destLat    Destination latitude
 * @param destLng    Destination longitude
 * @param originLat  Optional: user's current latitude (for "from here")
 * @param originLng  Optional: user's current longitude
 * @returns          URL string to open in new tab
 */
export function getDirectionsUrl(
  destLat: number,
  destLng: number,
  originLat?: number,
  originLng?: number
): string {
  if (isAppleDevice()) {
    // Apple Maps deep link — works on iPhone, iPad, macOS Safari
    // saddr omitted if no origin (Apple Maps will use current location)
    const base = 'maps://maps.apple.com/?';
    const params = new URLSearchParams({
      daddr: `${destLat},${destLng}`,
      dirflg: 'w', // walking
    });
    if (originLat !== undefined && originLng !== undefined) {
      params.set('saddr', `${originLat},${originLng}`);
    }
    return base + params.toString();
  } else {
    // Google Maps universal link — works on Android, Windows, and web fallback
    const base = 'https://www.google.com/maps/dir/?';
    const params: Record<string, string> = {
      api: '1',
      destination: `${destLat},${destLng}`,
      travelmode: 'walking',
    };
    if (originLat !== undefined && originLng !== undefined) {
      params['origin'] = `${originLat},${originLng}`;
    }
    return base + new URLSearchParams(params).toString();
  }
}
