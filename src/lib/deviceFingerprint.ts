// Gera um fingerprint único do dispositivo
export function generateDeviceFingerprint(): string {
  const navigator = window.navigator;
  const screen = window.screen;
  
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    !!navigator.plugins?.length,
    typeof navigator.doNotTrack,
  ];
  
  const fingerprint = components.join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(36);
}

export function getClientInfo() {
  return {
    deviceFingerprint: generateDeviceFingerprint(),
    userAgent: window.navigator.userAgent,
    ipAddress: '', // Será obtido no servidor
  };
}
