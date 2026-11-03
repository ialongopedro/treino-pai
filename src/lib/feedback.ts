export function avisarFimDoDescanso() {
  if ('vibrate' in navigator) {
    navigator.vibrate([250, 100, 250])
  }
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AudioContextClass()
    const tocarBip = (inicioSegundos: number) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.frequency.value = 880
      osc.type = 'sine'
      gain.gain.setValueAtTime(0.15, ctx.currentTime + inicioSegundos)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime + inicioSegundos)
      osc.stop(ctx.currentTime + inicioSegundos + 0.25)
    }
    tocarBip(0)
    tocarBip(0.35)
  } catch {
    // Web Audio indisponível (ex.: navegador muito antigo); segue só com a vibração.
  }
}

export function solicitarTelaSempreAcesa(): Promise<WakeLockSentinel | null> {
  if (!('wakeLock' in navigator)) return Promise.resolve(null)
  return navigator.wakeLock.request('screen').catch(() => null)
}
