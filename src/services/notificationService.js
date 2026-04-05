/**
 * NotificationService handles audio-visual alerts for the BioSphere platform.
 * It uses the Web Audio API to generate premium, synthesizer-like tones
 * without requiring external assets.
 */

class NotificationService {
    constructor() {
        this.audioCtx = null;
    }

    /**
     * Initializes the AudioContext lazily.
     * Required because browsers block audio play until a user interaction occurs.
     */
    initCtx() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    /**
     * Plays a high-fidelity "success" chime.
     * Consists of two rising sine waves with a gentle exponential decay.
     */
    playSuccessChime() {
        try {
            this.initCtx();
            const now = this.audioCtx.currentTime;

            // Frequency pair for a pleasant harmonic chime
            const frequencies = [523.25, 659.25]; // C5 and E5

            frequencies.forEach((freq, index) => {
                const osc = this.audioCtx.createOscillator();
                const gain = this.audioCtx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + (index * 0.05)); // Slight delay for stereo/richness
                
                // Volume envelope: fast attack, gentle decay (louder peak)
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.5, now + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

                osc.connect(gain);
                gain.connect(this.audioCtx.destination);

                osc.start(now);
                osc.stop(now + 1.5);
            });
        } catch (error) {
            console.error("Failed to play notification sound:", error);
        }
    }
}

export default new NotificationService();
