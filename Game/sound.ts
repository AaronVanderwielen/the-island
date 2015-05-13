class Sound {
    audioContext;

    constructor() {
        window['AudioContext'] = window['AudioContext'] || window['webkitAudioContext'];
        this.audioContext = new window['AudioContext']();
    }

    startNote(frequency: number, length: number, gain: number, type?: string) {
        var bpm = 120,
            notelength = length,
            playlength = 1 / (bpm / 60) * notelength, // 1 second divided by number of beats per second times number of beats (length of a note)
            o = this.audioContext.createOscillator(),
            g = this.audioContext.createGain();

        o.type = o.type ? o.type : 'square';

        o.frequency.value = frequency;
        o.start(this.audioContext.currentTime);
        o.stop(this.audioContext.currentTime + playlength);

        g.gain.value = gain;
        o.connect(g);
        g.connect(this.audioContext.destination);
    }
}