const MAX_CONCURRENT_SOUNDS = 5;
let activeSounds = [];

const playManagedSound = (src, volume) => {
  if (typeof window === 'undefined') return;
  if (window.__isMuted) return;

  // Cleanup completed sounds
  activeSounds = activeSounds.filter(audio => !audio.ended && !audio.paused);

  // Enforce limit
  if (activeSounds.length >= MAX_CONCURRENT_SOUNDS) {
    const oldest = activeSounds.shift();
    if (oldest) {
      oldest.pause();
      oldest.currentTime = 0;
    }
  }

  const audio = new Audio(src);
  audio.volume = volume;
  
  // Clean up when this specific audio ends
  audio.addEventListener('ended', () => {
    activeSounds = activeSounds.filter(a => a !== audio);
  });

  activeSounds.push(audio);
  audio.play().catch(e => console.warn("Audio play prevented:", e));
};

export const playPopSound = () => playManagedSound('/pop.mp3', 0.8);
export const playWhooshSound = () => playManagedSound('/whoosh.mp3', 0.7);
export const playPartyPopperSound = () => playManagedSound('/popper.mp3', 0.9);
