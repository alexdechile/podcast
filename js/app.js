document.addEventListener('DOMContentLoaded', () => {
    const App = {
        // --- UI Elements ---
        recordBtn: document.getElementById('record-btn'),
        playBtn: document.getElementById('play-btn'),
        pauseBtn: document.getElementById('pause-btn'),
        stopBtn: document.getElementById('stop-btn'),
        downloadBtn: document.getElementById('download-btn'),
        recLight: document.getElementById('rec-light'),
        timeDisplay: document.querySelector('.time-display'),
        eqSliders: document.querySelectorAll('.eq-slider'),
        // Effects UI
        reverbToggle: document.getElementById('reverb-toggle'),
        reverbDecay: document.getElementById('reverb-decay'),
        reverbWet: document.getElementById('reverb-wet'),
        delayToggle: document.getElementById('delay-toggle'),
        delayTime: document.getElementById('delay-time'),
        delayFeedback: document.getElementById('delay-feedback'),
        delayWet: document.getElementById('delay-wet'),

        // --- State ---
        isRecording: false,
        recordedAudioUrl: null,

        init() {
            Visualizer.init(); // Initialize the visualizer
            this.addEventListeners();
            console.log("App initialized.");
        },

        addEventListeners() {
            this.recordBtn.addEventListener('click', () => this.toggleRecording());
            this.playBtn.addEventListener('click', () => Visualizer.waveSurfer.play());
            this.pauseBtn.addEventListener('click', () => Visualizer.waveSurfer.pause());
            this.stopBtn.addEventListener('click', () => Visualizer.waveSurfer.stop());
            this.downloadBtn.addEventListener('click', () => this.downloadRecording());

            // Update time display
            Visualizer.onTimeUpdate((currentTime) => {
                this.timeDisplay.textContent = this.formatTime(currentTime);
            });

            // Connect player to EQ when ready
            Visualizer.onReady(() => {
                const mediaElement = Visualizer.getMediaElement();
                if (mediaElement) {
                    AudioEngine.connectPlayerToChain(mediaElement);
                }
            });

            // Add EQ slider listeners
            this.eqSliders.forEach((slider, index) => {
                slider.addEventListener('input', (e) => {
                    // The first slider is preamp (index 0), which we are not handling yet.
                    // The EQ bands start from the second slider (index 1).
                    if (index > 0) {
                        AudioEngine.updateEQ(index - 1, e.target.value);
                    }
                });
            });

            // --- Add Effects Listeners ---
            // Reverb
            this.reverbToggle.addEventListener('change', (e) => {
                const wet = e.target.checked ? this.reverbWet.value : 0;
                AudioEngine.updateReverb({ wet });
            });
            this.reverbDecay.addEventListener('input', (e) => AudioEngine.updateReverb({ decay: e.target.value }));
            this.reverbWet.addEventListener('input', (e) => {
                if (this.reverbToggle.checked) {
                    AudioEngine.updateReverb({ wet: e.target.value });
                }
            });

            // Delay
            this.delayToggle.addEventListener('change', (e) => {
                const wet = e.target.checked ? this.delayWet.value : 0;
                AudioEngine.updateDelay({ wet });
            });
            this.delayTime.addEventListener('input', (e) => AudioEngine.updateDelay({ delayTime: e.target.value }));
            this.delayFeedback.addEventListener('input', (e) => AudioEngine.updateDelay({ feedback: e.target.value }));
            this.delayWet.addEventListener('input', (e) => {
                if (this.delayToggle.checked) {
                    AudioEngine.updateDelay({ wet: e.target.value });
                }
            });
        },

        async toggleRecording() {
            // Ensure audio context is started by user gesture
            if (!AudioEngine.isInitialized) {
                await AudioEngine.init();
            }

            this.isRecording = !this.isRecording;

            if (this.isRecording) {
                // Start recording
                await AudioEngine.openMic();
                AudioEngine.startRecording();
                this.updateUIRecording(true);
            } else {
                // Stop recording
                this.recordedAudioUrl = await AudioEngine.stopRecording();
                AudioEngine.closeMic();
                this.updateUIRecording(false);

                if (this.recordedAudioUrl) {
                    Visualizer.load(this.recordedAudioUrl);
                }
            }
        },

        formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        },

        updateUIRecording(isRecording) {
            if (isRecording) {
                this.recLight.classList.remove('rec-light-off');
                this.recLight.classList.add('rec-light-on');
                this.recordBtn.classList.add('recording-active'); // For potential CSS styles
            } else {
                this.recLight.classList.remove('rec-light-on');
                this.recLight.classList.add('rec-light-off');
                this.recordBtn.classList.remove('recording-active');
            }
        },

        downloadRecording() {
            if (this.recordedAudioUrl) {
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = this.recordedAudioUrl;
                a.download = `podcast-recording-${new Date().toISOString()}.wav`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            } else {
                alert("No recording available to download.");
            }
        }
    };

    App.init();
});
