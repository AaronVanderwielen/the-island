var Sound = (function () {
    function Sound() {
        window['AudioContext'] = window['AudioContext'] || window['webkitAudioContext'];
        this.audioContext = new window['AudioContext']();
    }
    Sound.prototype.makeDistortionCurve = function (amount) {
        var k = typeof amount === 'number' ? amount : 50, n_samples = 44100, curve = new Float32Array(n_samples), deg = Math.PI / 180, i = 0, x;
        for (; i < n_samples; ++i) {
            x = i * 2 / n_samples - 1;
            curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
        }
        return curve;
    };
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
