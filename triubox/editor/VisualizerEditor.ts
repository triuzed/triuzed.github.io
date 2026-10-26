// Copyright (c) John Nesky and contributing authors, distributed under the MIT license, see accompanying the LICENSE.md file.
// Triubox v1.0 addition: audio visualizers (oscilloscope + spectrum) driven by an AnalyserNode.

import {HTML} from "imperative-html/dist/esm/elements-strict.js";
import {ColorConfig} from "./ColorConfig.js";
import {SongDocument} from "./SongDocument.js";

const {canvas, div, span} = HTML;

export type VisualizerMode = "off" | "scope" | "spectrum" | "both";

export const visualizerModeNames: ReadonlyArray<string> = ["Off", "Oscilloscope", "Spectrum", "Scope + Spectrum"];

export class VisualizerEditor {
        private readonly _canvas: HTMLCanvasElement = canvas({style: "width: 100%; height: 100%; display: block;"});
        public readonly container: HTMLDivElement = div({class: "visualizer-editor noSelection", style: "display: none;"}, this._canvas);

        private readonly _ctx: CanvasRenderingContext2D;
        private _mode: VisualizerMode = "both";
        private _timeData: Float32Array | null = null;
        private _freqData: Uint8Array | null = null;
        private _renderedWidth: number = 0;
        private _renderedHeight: number = 0;

        constructor(private _doc: SongDocument) {
                this._ctx = <CanvasRenderingContext2D> this._canvas.getContext("2d");
                window.requestAnimationFrame(this._animate);
        }

        public get mode(): VisualizerMode {
                return this._mode;
        }

        public setMode(mode: VisualizerMode): void {
                this._mode = mode;
                const hidden: boolean = (mode == "off");
                this.container.style.display = hidden ? "none" : "";
                // Collapse the whole grid area when the visualizer is off.
                if (this.container.parentElement) this.container.parentElement.style.display = hidden ? "none" : "";
                this._doc.prefs.visualizerMode = mode;
                this._doc.prefs.save();
        }

        private _animate = (): void => {
                window.requestAnimationFrame(this._animate);
                if (this._mode == "off") return;
                this._render();
        }

        private _render(): void {
                const width: number = this._canvas.clientWidth;
                const height: number = this._canvas.clientHeight;
                if (width == 0 || height == 0) return;
                if (this._renderedWidth != width || this._renderedHeight != height) {
                        this._renderedWidth = width;
                        this._renderedHeight = height;
                        const scale: number = window.devicePixelRatio || 1;
                        this._canvas.width = Math.round(width * scale);
                        this._canvas.height = Math.round(height * scale);
                }

                const g: CanvasRenderingContext2D = this._ctx;
                const w: number = this._canvas.width;
                const h: number = this._canvas.height;
                g.clearRect(0, 0, w, h);

                // Resolve theme colors each frame so theme switches apply instantly.
                const computed: CSSStyleDeclaration = getComputedStyle(this.container);
                const scopeColor: string = computed.getPropertyValue("--loop-accent").trim() || "#ff2fd6";
                const spectrumColor: string = computed.getPropertyValue("--link-accent").trim() || "#4de3ea";
                const dimColor: string = computed.getPropertyValue("--secondary-text").trim() || "#999";

                const showScope: boolean = this._mode == "scope" || this._mode == "both";
                const showSpectrum: boolean = this._mode == "spectrum" || this._mode == "both";

                const analyser: any | null = this._doc.synth.getAnalyser();
                if (analyser == null) {
                        g.fillStyle = dimColor;
                        g.font = Math.round(h * 0.14) + "px sans-serif";
                        g.textAlign = "center";
                        g.fillText("press play to visualize", w / 2, h / 2);
                        return;
                }

                if (showScope) {
                        if (this._timeData == null || this._timeData.length != analyser.fftSize) this._timeData = new Float32Array(analyser.fftSize);
                        analyser.getFloatTimeDomainData(this._timeData);

                        g.lineWidth = Math.max(1, Math.round(h / 60));
                        g.strokeStyle = scopeColor;
                        g.beginPath();
                        const midY: number = showSpectrum ? h * 0.72 : h / 2;
                        const ampY: number = showSpectrum ? h * 0.24 : h * 0.46;
                        const step: number = Math.max(1, Math.floor(this._timeData.length / w));
                        for (let x: number = 0; x < w; x++) {
                                const sample: number = this._timeData[Math.min(this._timeData.length - 1, x * step)] || 0;
                                const y: number = midY - sample * ampY;
                                if (x == 0) g.moveTo(0, y); else g.lineTo(x, y);
                        }
                        g.stroke();
                }

                if (showSpectrum) {
                        const bins: number = analyser.frequencyBinCount;
                        if (this._freqData == null || this._freqData.length != bins) this._freqData = new Uint8Array(bins);
                        analyser.getByteFrequencyData(this._freqData);

                        // Display only the lower half of the spectrum (musical content), log-ish grouping.
                        const barCount: number = Math.max(24, Math.min(96, Math.floor(w / 8)));
                        g.fillStyle = spectrumColor;
                        g.globalAlpha = 0.75;
                        for (let i: number = 0; i < barCount; i++) {
                                // Group bins with an exponential curve so bass doesn't dominate the display.
                                const startBin: number = Math.floor(Math.pow(i / barCount, 2.2) * bins * 0.5);
                                const endBin: number = Math.max(startBin + 1, Math.floor(Math.pow((i + 1) / barCount, 2.2) * bins * 0.5));
                                let peak: number = 0;
                                for (let b: number = startBin; b < endBin && b < bins; b++) {
                                        if (this._freqData[b] > peak) peak = this._freqData[b];
                                }
                                const value: number = peak / 255;
                                const barW: number = w / barCount;
                                const barH: number = Math.max(1, value * h * 0.5);
                                g.fillRect(i * barW + 0.5, h - barH, barW - 1, barH);
                        }
                        g.globalAlpha = 1.0;
                }
        }
}
