var Sound = (function () {
    function Sound() {
        window['AudioContext'] = window['AudioContext'] || window['webkitAudioContext'];
        this.audioContext = new window['AudioContext']();
    }
    Sound.prototype.startNote = function () {
        var frq = 40, bpm = 120, notelength = .25, playlength = 1 / (bpm / 60) * notelength, o = this.audioContext.createOscillator(), g = this.audioContext.createGain(); // 1 second divided by number of beats per second times number of beats (length of a note)
        o.type = 'square';
        if (frq) {
            o.frequency.value = frq;
            o.start(this.audioContext.currentTime);
            o.stop(this.audioContext.currentTime + playlength);
            g.gain.value = 1;
            o.connect(g);
            g.connect(this.audioContext.destination);
        }
    };
    return Sound;
})();
//# sourceMappingURL=sound.js.map