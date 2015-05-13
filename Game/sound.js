var Sound = (function () {
    function Sound() {
        window['AudioContext'] = window['AudioContext'] || window['webkitAudioContext'];
        this.audioContext = new window['AudioContext']();
    }
    Sound.prototype.startNote = function (frequency, length, gain, type) {
        var bpm = 120, notelength = length, playlength = 1 / (bpm / 60) * notelength, o = this.audioContext.createOscillator(), g = this.audioContext.createGain();
        o.type = o.type ? o.type : 'square';
        o.frequency.value = frequency;
        o.start(this.audioContext.currentTime);
        o.stop(this.audioContext.currentTime + playlength);
        g.gain.value = gain;
        o.connect(g);
        g.connect(this.audioContext.destination);
    };
    return Sound;
})();
//# sourceMappingURL=sound.js.map