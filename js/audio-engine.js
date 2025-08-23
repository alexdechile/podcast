const AudioEngine = {
    isInitialized: false,
    mic: null,
    recorder: null,
    player: null,
    meter: null,

    async init() {
        if (this.isInitialized) {
            return;
        }

        // Tone.js requires a user gesture to start the audio context.
        // This is typically done in an event listener (e.g., a click).
        await Tone.start();
        console.log("Audio context started.");

        this.setupNodes();
        this.isInitialized = true;
        console.log("AudioEngine initialized.");
    },

    reverb: null,
    delay: null,
    eqFilters: [],
    playerSource: null,

    setupNodes() {
        // Microphone input
        this.mic = new Tone.UserMedia();
        // Recorder
        this.recorder = new Tone.Recorder();
        // Meter
        this.meter = new Tone.Meter();
        // Effects
        this.reverb = new Tone.Reverb({ decay: 1.5, wet: 0 });
        this.delay = new Tone.FeedbackDelay({ delayTime: 0.25, feedback: 0.5, wet: 0 });

        // Connections
        this.mic.connect(this.recorder);
        this.mic.connect(this.meter);

        // Setup EQ filters
        this.setupEQ();
    },

    setupEQ() {
        const freqs = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];
        this.eqFilters = freqs.map(freq => new Tone.Filter({
            type: 'peaking',
            frequency: freq,
            Q: 1.4,
            gain: 0
        }));
    },

    connectPlayerToChain(mediaElement) {
        if (this.playerSource) {
            this.playerSource.disconnect();
        }
        this.playerSource = Tone.context.createMediaElementSource(mediaElement);

        // Chain: Source -> EQ -> Delay -> Reverb -> Destination
        this.playerSource.connect(this.eqFilters[0]);
        for (let i = 0; i < this.eqFilters.length - 1; i++) {
            this.eqFilters[i].connect(this.eqFilters[i + 1]);
        }
        this.eqFilters[this.eqFilters.length - 1].chain(
            this.delay,
            this.reverb,
            Tone.Destination
        );
        console.log("Player connected to full effects chain.");
    },

    updateEQ(bandIndex, gain) {
        if (this.eqFilters[bandIndex]) {
            this.eqFilters[bandIndex].gain.value = gain;
        }
    },

    updateReverb(params) {
        if (this.reverb) {
            this.reverb.set(params);
        }
    },

    updateDelay(params) {
        if (this.delay) {
            this.delay.set(params);
        }
    },

    async openMic() {
        if (!this.isInitialized) {
            await this.init();
        }
        if (this.mic.state !== 'started') {
            try {
                await this.mic.open();
                console.log("Microphone opened.");
            } catch (e) {
                console.error("Microphone access denied.", e);
                alert("Microphone access was denied. Please allow microphone access in your browser settings.");
            }
        }
    },

    closeMic() {
        if (this.mic && this.mic.state === 'started') {
            this.mic.close();
            console.log("Microphone closed.");
        }
    },

    startRecording() {
        if (this.recorder && this.mic.state === 'started') {
            this.recorder.start();
            console.log("Recording started.");
        } else {
            console.error("Cannot start recording. Mic not ready or recorder not initialized.");
        }
    },

    async stopRecording() {
        if (this.recorder) {
            const recording = await this.recorder.stop();
            console.log("Recording stopped.");
            return URL.createObjectURL(recording);
        }
        return null;
    },

    loadAudio(url) {
        if (this.player) {
            this.player.load(url);
            console.log("Audio loaded into player.");
        }
    },

    play() {
        if (this.player && this.player.loaded) {
            this.player.start();
            console.log("Playback started.");
        }
    },

    pause() {
        if (this.player && this.player.state === 'started') {
            this.player.pause();
            console.log("Playback paused.");
        }
    },

    stop() {
        if (this.player) {
            this.player.stop();
            console.log("Playback stopped.");
        }
    }
};
