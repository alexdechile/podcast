const Visualizer = {
    waveSurfer: null,

    init() {
        if (this.waveSurfer) {
            return;
        }

        this.waveSurfer = WaveSurfer.create({
            container: '#waveform',
            waveColor: '#00ff41',     // Neon Green
            progressColor: '#0080ff', // Neon Blue
            barWidth: 2,
            barRadius: 1,
            cursorWidth: 2,
            cursorColor: '#ff8000',   // Orange
            height: 100,
            responsive: true,
        });

        console.log("Visualizer (WaveSurfer) initialized.");

        // We can add event listeners here if needed, e.g., for time updates
        this.waveSurfer.on('finish', () => {
            console.log('Playback finished.');
            // Optionally, reset the play button icon or state here
        });
    },

    load(url) {
        if (this.waveSurfer) {
            console.log("Loading audio into visualizer:", url);
            this.waveSurfer.load(url);
        }
    },

    onTimeUpdate(callback) {
        if (this.waveSurfer) {
            this.waveSurfer.on('timeupdate', callback);
        }
    },

    onReady(callback) {
        if (this.waveSurfer) {
            this.waveSurfer.on('ready', callback);
        }
    },

    getMediaElement() {
        return this.waveSurfer ? this.waveSurfer.getMediaElement() : null;
    }
};
