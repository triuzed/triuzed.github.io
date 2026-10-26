// Copyright (c) John Nesky and contributing authors, distributed under the MIT license, see accompanying the LICENSE.md file.
// Triubox v1.0: sample library (WAV import, slicing, kits), FX rack presets and instrument presets.

import {Config} from "../synth/SynthConfig.js";
import {SampleData, SampleLibrary, Instrument} from "../synth/synth.js";

export interface TriuFxSettings {
        tapeWobble: number;
        tapeWobbleSpeed: number;
        ringModDepth: number;
        ringModFreq: number;
        triDelayAmount: number;
        triDelayTime: number;
        sidechainAmount: number;
}

export interface TriuFxPreset {
        name: string;
        fx: TriuFxSettings;
}

export interface TriuInstrumentPreset {
        name: string;
        json: any;
}

export interface StoredSample {
        id: string;
        name: string;
        sampleRate: number;
        wavBase64: string;
}

const FX_STORAGE_KEY: string = "triubox.fxPresets";
const INSTRUMENT_STORAGE_KEY: string = "triubox.instrumentPresets";
const SAMPLE_PREFIX: string = "triubox.sample.";

function base64FromBytes(bytes: Uint8Array): string {
        let binary: string = "";
        const chunk: number = 0x8000;
        for (let i: number = 0; i < bytes.length; i += chunk) {
                binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)) as any);
        }
        return btoa(binary);
}

function bytesFromBase64(base64: string): Uint8Array {
        const binary: string = atob(base64);
        const bytes: Uint8Array = new Uint8Array(binary.length);
        for (let i: number = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        return bytes;
}

export class TriuboxLibrary {
        
        // Built-in FX rack presets (FL-style plugin chains).
        public static readonly builtInFxPresets: ReadonlyArray<{name: string, fx: TriuFxSettings}> = [
                {name: "Tape Wow",    fx: {tapeWobble: 42, tapeWobbleSpeed: 12, ringModDepth: 0,  ringModFreq: 25, triDelayAmount: 0,  triDelayTime: 25, sidechainAmount: 0}},
                {name: "Ring Robot",  fx: {tapeWobble: 0,  tapeWobbleSpeed: 25, ringModDepth: 48, ringModFreq: 38, triDelayAmount: 0,  triDelayTime: 25, sidechainAmount: 0}},
                {name: "Tri Space",   fx: {tapeWobble: 18, tapeWobbleSpeed: 20, ringModDepth: 0,  ringModFreq: 25, triDelayAmount: 38, triDelayTime: 30, sidechainAmount: 0}},
                {name: "Club Pump",   fx: {tapeWobble: 0,  tapeWobbleSpeed: 25, ringModDepth: 0,  ringModFreq: 25, triDelayAmount: 12, triDelayTime: 18, sidechainAmount: 46}},
                {name: "Broken Tape", fx: {tapeWobble: 58, tapeWobbleSpeed: 34, ringModDepth: 22, ringModFreq: 14, triDelayAmount: 20, triDelayTime: 40, sidechainAmount: 0}},
        ];
        
        // ---------- WAV decode / encode ----------
        
        public static decodeWav(buffer: ArrayBuffer): {mono: Float32Array, sampleRate: number} | null {
                const view: DataView = new DataView(buffer);
                if (buffer.byteLength < 12) return null;
                if (view.getUint32(0, true) != 0x46464952) return null; // "RIFF"
                if (view.getUint32(8, true) != 0x45564157) return null; // "WAVE"
                
                let offset: number = 12;
                let audioFormat: number = 1;
                let channelCount: number = 1;
                let sampleRate: number = 44100;
                let bitsPerSample: number = 16;
                let dataStart: number = -1;
                let dataLength: number = 0;
                
                while (offset + 8 <= buffer.byteLength) {
                        const chunkId: number = view.getUint32(offset, true);
                        const chunkSize: number = view.getUint32(offset + 4, true);
                        if (chunkId == 0x20746D66) { // "fmt "
                                audioFormat = view.getUint16(offset + 8, true);
                                channelCount = Math.max(1, view.getUint16(offset + 10, true));
                                sampleRate = view.getUint32(offset + 12, true);
                                bitsPerSample = view.getUint16(offset + 22, true);
                        } else if (chunkId == 0x61746164) { // "data"
                                dataStart = offset + 8;
                                dataLength = Math.min(chunkSize, buffer.byteLength - dataStart);
                        }
                        offset += 8 + chunkSize + (chunkSize & 1);
                }
                
                if (dataStart < 0 || dataLength <= 0) return null;
                
                let samples: Float32Array;
                const bytesPerSample: number = bitsPerSample >> 3;
                const frameCount: number = Math.floor(dataLength / (bytesPerSample * channelCount));
                if (audioFormat == 3 && bitsPerSample == 32) {
                        samples = new Float32Array(frameCount);
                        for (let i: number = 0; i < frameCount; i++) {
                                let sum: number = 0.0;
                                for (let c: number = 0; c < channelCount; c++) sum += view.getFloat32(dataStart + (i * channelCount + c) * 4, true);
                                samples[i] = sum / channelCount;
                        }
                } else if (audioFormat == 1 && bitsPerSample == 16) {
                        samples = new Float32Array(frameCount);
                        for (let i: number = 0; i < frameCount; i++) {
                                let sum: number = 0.0;
                                for (let c: number = 0; c < channelCount; c++) sum += view.getInt16(dataStart + (i * channelCount + c) * 2, true);
                                samples[i] = sum / channelCount / 32768.0;
                        }
                } else if (audioFormat == 1 && bitsPerSample == 8) {
                        samples = new Float32Array(frameCount);
                        for (let i: number = 0; i < frameCount; i++) {
                                let sum: number = 0.0;
                                for (let c: number = 0; c < channelCount; c++) sum += view.getUint8(dataStart + i * channelCount + c);
                                samples[i] = sum / channelCount / 128.0 - 1.0;
                        }
                } else if (audioFormat == 1 && bitsPerSample == 24) {
                        samples = new Float32Array(frameCount);
                        for (let i: number = 0; i < frameCount; i++) {
                                let sum: number = 0.0;
                                for (let c: number = 0; c < channelCount; c++) {
                                        const b: number = dataStart + (i * channelCount + c) * 3;
                                        let value: number = view.getUint8(b) | (view.getUint8(b + 1) << 8) | (view.getUint8(b + 2) << 16);
                                        if (value & 0x800000) value -= 0x1000000;
                                        sum += value;
                                }
                                samples[i] = sum / channelCount / 8388608.0;
                        }
                } else {
                        return null;
                }
                
                return {mono: samples, sampleRate: sampleRate};
        }
        
        // Fallback for compressed formats (mp3/ogg/etc.) via WebAudio decoding.
        public static async decodeCompressed(buffer: ArrayBuffer): Promise<{mono: Float32Array, sampleRate: number} | null> {
                try {
                        const AudioCtxClass: any = (window as any).AudioContext || (window as any).webkitAudioContext;
                        if (AudioCtxClass == null) return null;
                        const ctx: any = new AudioCtxClass();
                        const audio: any = await ctx.decodeAudioData(buffer.slice(0));
                        const channelCount: number = Math.min(2, audio.numberOfChannels);
                        const length: number = audio.length;
                        const mono: Float32Array = new Float32Array(length);
                        for (let c: number = 0; c < channelCount; c++) {
                                const data: Float32Array = audio.getChannelData(c);
                                for (let i: number = 0; i < length; i++) mono[i] += data[i];
                        }
                        for (let i: number = 0; i < length; i++) mono[i] /= channelCount;
                        const sampleRate: number = audio.sampleRate;
                        if (ctx.close) ctx.close();
                        return {mono, sampleRate};
                } catch (error) {
                        return null;
                }
        }
        
        public static encodeWavBase64(mono: Float32Array, sampleRate: number): string {
                const bytes: Uint8Array = new Uint8Array(44 + mono.length * 2);
                const view: DataView = new DataView(bytes.buffer);
                const writeString = (offset: number, text: string): void => {
                        for (let i: number = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
                };
                writeString(0, "RIFF");
                view.setUint32(4, 36 + mono.length * 2, true);
                writeString(8, "WAVE");
                writeString(12, "fmt ");
                view.setUint32(16, 16, true);
                view.setUint16(20, 1, true);
                view.setUint16(22, 1, true);
                view.setUint32(24, sampleRate, true);
                view.setUint32(28, sampleRate * 2, true);
                view.setUint16(32, 2, true);
                view.setUint16(34, 16, true);
                writeString(36, "data");
                view.setUint32(40, mono.length * 2, true);
                for (let i: number = 0; i < mono.length; i++) {
                        let s: number = mono[i];
                        s = s < -1 ? -1 : s > 1 ? 1 : s;
                        view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
                }
                return base64FromBytes(bytes);
        }
        
        // ---------- Sample library (localStorage-backed) ----------
        
        public static listSamples(): StoredSample[] {
                const result: StoredSample[] = [];
                try {
                        for (let i: number = 0; i < window.localStorage.length; i++) {
                                const key: string = window.localStorage.key(i)!;
                                if (key.indexOf(SAMPLE_PREFIX) == 0) {
                                        try {
                                                result.push(JSON.parse(window.localStorage.getItem(key)!));
                                        } catch (e) {}
                                }
                        }
                } catch (e) {}
                result.sort((a, b) => a.name.localeCompare(b.name));
                return result;
        }
        
        public static getSample(id: string): StoredSample | null {
                try {
                        const raw: string | null = window.localStorage.getItem(SAMPLE_PREFIX + id);
                        return raw != null ? JSON.parse(raw) : null;
                } catch (e) {
                        return null;
                }
        }
        
        public static ensureLoaded(id: string): boolean {
                if (SampleLibrary.has(id)) return true;
                const stored: StoredSample | null = TriuboxLibrary.getSample(id);
                if (stored == null) return false;
                const wav: {mono: Float32Array, sampleRate: number} | null = TriuboxLibrary.decodeWav(bytesFromBase64(stored.wavBase64).buffer as ArrayBuffer);
                if (wav == null) return false;
                SampleLibrary.put(id, new SampleData(wav.mono, wav.sampleRate));
                return true;
        }
        
        public static putSample(name: string, mono: Float32Array, sampleRate: number, sliceStarts: Int32Array | null = null): string {
                const maxSamples: number = Math.floor(sampleRate * Config.triuSampleMaxSeconds);
                if (mono.length > maxSamples) mono = mono.slice(0, maxSamples);
                const id: string = "u" + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36);
                const stored: StoredSample = {id, name, sampleRate, wavBase64: TriuboxLibrary.encodeWavBase64(mono, sampleRate)};
                try {
                        window.localStorage.setItem(SAMPLE_PREFIX + id, JSON.stringify(stored));
                } catch (e) {
                        // Storage full: keep the sample for this session only.
                        console.warn("Triubox: localStorage is full, sample kept for this session only.");
                }
                SampleLibrary.put(id, new SampleData(mono, sampleRate));
                TriuboxLibrary.setSliceBoundaries(id, sliceStarts);
                return id;
        }
        
        public static deleteSample(id: string): void {
                try {
                        window.localStorage.removeItem(SAMPLE_PREFIX + id);
                } catch (e) {}
        }
        
        // Slice boundary cache (for transient chopping). Boundaries live in memory and are
        // regenerated whenever the sample is chopped; they ride along with the decoded sample.
        private static readonly sliceBoundaries: {[id: string]: Int32Array} = {};
        
        public static setSliceBoundaries(id: string, starts: Int32Array | null): void {
                if (starts == null) delete TriuboxLibrary.sliceBoundaries[id];
                else TriuboxLibrary.sliceBoundaries[id] = starts;
                const data: SampleData | null = SampleLibrary.get(id);
                if (data != null) data.sliceStarts = starts;
        }
        
        public static getSliceBoundaries(id: string): Int32Array | null {
                return TriuboxLibrary.sliceBoundaries[id] || null;
        }
        
        // Breakcore chopping: detect transients and return slice start positions.
        public static chopByTransients(mono: Float32Array, maxSlices: number): Int32Array {
                const length: number = mono.length;
                const windowSize: number = 256;
                const envelopeLength: number = Math.max(1, Math.floor(length / windowSize));
                const envelope: Float32Array = new Float32Array(envelopeLength);
                for (let i: number = 0; i < envelopeLength; i++) {
                        let peak: number = 0.0;
                        const start: number = i * windowSize;
                        const stop: number = Math.min(length, start + windowSize);
                        for (let j: number = start; j < stop; j++) {
                                const amp: number = Math.abs(mono[j]);
                                if (amp > peak) peak = amp;
                        }
                        envelope[i] = peak;
                }
                
                let globalPeak: number = 0.0;
                for (let i: number = 0; i < envelopeLength; i++) if (envelope[i] > globalPeak) globalPeak = envelope[i];
                const threshold: number = Math.max(0.04, globalPeak * 0.22);
                
                const starts: number[] = [0];
                let quietEnough: boolean = envelope[0] < threshold * 0.5;
                for (let i: number = 1; i < envelopeLength && starts.length < maxSlices; i++) {
                        if (quietEnough && envelope[i] >= threshold) {
                                const position: number = Math.max(0, i * windowSize - Math.floor(windowSize * 0.5));
                                if (position - starts[starts.length - 1] > windowSize * 8) starts.push(position);
                                quietEnough = false;
                        } else if (envelope[i] < threshold * 0.4) {
                                quietEnough = true;
                        }
                }
                if (starts.length < 2) starts.push(length);
                return Int32Array.from(starts);
        }
        
        // ---------- Built-in kits (procedurally generated, so they always work, even offline) ----------
        
        public static ensureKits(): void {
                if (!SampleLibrary.has("kit.808")) TriuboxLibrary.generate808Kit();
                if (!SampleLibrary.has("kit.dnb")) TriuboxLibrary.generateDnBKit();
        }
        
        private static generateKit(id: string, name: string, drums: Float32Array[]): void {
                const sampleRate: number = 44100;
                let total: number = 0;
                for (const drum of drums) total += drum.length;
                const mono: Float32Array = new Float32Array(total);
                const starts: number[] = [];
                let offset: number = 0;
                for (const drum of drums) {
                        starts.push(offset);
                        mono.set(drum, offset);
                        offset += drum.length;
                }
                SampleLibrary.put(id, new SampleData(mono, sampleRate));
                TriuboxLibrary.setSliceBoundaries(id, Int32Array.from(starts));
        }
        
        private static synth808Kick(): Float32Array {
                const sampleRate: number = 44100;
                const length: number = Math.floor(sampleRate * 0.7);
                const out: Float32Array = new Float32Array(length);
                let phase: number = 0.0;
                for (let i: number = 0; i < length; i++) {
                        const t: number = i / sampleRate;
                        const freq: number = 45 + 150 * Math.exp(-t * 28);
                        phase += 2 * Math.PI * freq / sampleRate;
                        const amp: number = Math.exp(-t * 4.2) * (1 + 0.6 * Math.exp(-t * 90));
                        out[i] = Math.sin(phase) * amp * 0.95;
                }
                return out;
        }
        
        private static synthSnare(tune: number, decay: number, noiseMix: number): Float32Array {
                const sampleRate: number = 44100;
                const length: number = Math.floor(sampleRate * decay);
                const out: Float32Array = new Float32Array(length);
                let phase: number = 0.0;
                let noiseState: number = 0.0;
                let noisePrev: number = 0.0;
                for (let i: number = 0; i < length; i++) {
                        const t: number = i / sampleRate;
                        phase += 2 * Math.PI * tune * (1 - 0.08 * t / decay) / sampleRate;
                        const tone: number = Math.sin(phase) + 0.5 * Math.sin(phase * 1.59);
                        const white: number = Math.random() * 2 - 1;
                        noiseState += 0.35 * (white - noiseState); // low-passed noise
                        noisePrev = noiseState;
                        const amp: number = Math.exp(-t * (3.4 / decay));
                        out[i] = (tone * (1 - noiseMix) + noiseState * noiseMix * 2.2) * amp * 0.8;
                }
                return out;
        }
        
        private static synthHat(open: boolean): Float32Array {
                const sampleRate: number = 44100;
                const decay: number = open ? 0.35 : 0.06;
                const length: number = Math.floor(sampleRate * decay);
                const out: Float32Array = new Float32Array(length);
                let hpPrevIn: number = 0.0;
                let hpPrevOut: number = 0.0;
                for (let i: number = 0; i < length; i++) {
                        const t: number = i / sampleRate;
                        const white: number = Math.random() * 2 - 1;
                        const alpha: number = 0.92; // high-pass
                        const hp: number = alpha * (hpPrevOut + white - hpPrevIn);
                        hpPrevIn = white;
                        hpPrevOut = hp;
                        out[i] = hp * Math.exp(-t * (open ? 11 : 55)) * 0.6;
                }
                return out;
        }
        
        private static synthClap(): Float32Array {
                const sampleRate: number = 44100;
                const length: number = Math.floor(sampleRate * 0.35);
                const out: Float32Array = new Float32Array(length);
                let lp: number = 0.0;
                const bursts: number[] = [0.0, 0.012, 0.024, 0.036];
                for (let i: number = 0; i < length; i++) {
                        const t: number = i / sampleRate;
                        let amp: number = Math.exp(-t * 18);
                        for (const burst of bursts) {
                                if (t >= burst) amp = Math.max(amp, Math.exp(-(t - burst) * 55) * 0.9);
                        }
                        const white: number = Math.random() * 2 - 1;
                        lp += 0.5 * (white - lp);
                        out[i] = lp * amp * 0.9;
                }
                return out;
        }
        
        private static synthTom(freq: number): Float32Array {
                const sampleRate: number = 44100;
                const length: number = Math.floor(sampleRate * 0.45);
                const out: Float32Array = new Float32Array(length);
                let phase: number = 0.0;
                for (let i: number = 0; i < length; i++) {
                        const t: number = i / sampleRate;
                        const f: number = freq * (1 + 0.4 * Math.exp(-t * 40));
                        phase += 2 * Math.PI * f / sampleRate;
                        out[i] = Math.sin(phase) * Math.exp(-t * 9) * 0.85;
                }
                return out;
        }
        
        private static synthCowbell(): Float32Array {
                const sampleRate: number = 44100;
                const length: number = Math.floor(sampleRate * 0.3);
                const out: Float32Array = new Float32Array(length);
                let p1: number = 0.0;
                let p2: number = 0.0;
                for (let i: number = 0; i < length; i++) {
                        const t: number = i / sampleRate;
                        p1 += 2 * Math.PI * 540 / sampleRate;
                        p2 += 2 * Math.PI * 800 / sampleRate;
                        const sq1: number = Math.sin(p1) > 0 ? 1 : -1;
                        const sq2: number = Math.sin(p2) > 0 ? 1 : -1;
                        out[i] = (sq1 + sq2) * 0.25 * Math.exp(-t * 16);
                }
                return out;
        }
        
        private static synthCrash(): Float32Array {
                const sampleRate: number = 44100;
                const length: number = Math.floor(sampleRate * 0.9);
                const out: Float32Array = new Float32Array(length);
                let hpPrevIn: number = 0.0;
                let hpPrevOut: number = 0.0;
                for (let i: number = 0; i < length; i++) {
                        const t: number = i / sampleRate;
                        const white: number = Math.random() * 2 - 1;
                        const alpha: number = 0.85;
                        const hp: number = alpha * (hpPrevOut + white - hpPrevIn);
                        hpPrevIn = white;
                        hpPrevOut = hp;
                        out[i] = hp * Math.exp(-t * 3.6) * 0.5;
                }
                return out;
        }
        
        private static synthRim(): Float32Array {
                const sampleRate: number = 44100;
                const length: number = Math.floor(sampleRate * 0.12);
                const out: Float32Array = new Float32Array(length);
                let phase: number = 0.0;
                for (let i: number = 0; i < length; i++) {
                        const t: number = i / sampleRate;
                        phase += 2 * Math.PI * 1700 / sampleRate;
                        const ring: number = Math.sin(phase) + 0.7 * Math.sin(phase * 2.37);
                        out[i] = ring * Math.exp(-t * 90) * 0.8;
                }
                return out;
        }
        
        private static synthSubDrop(): Float32Array {
                const sampleRate: number = 44100;
                const length: number = Math.floor(sampleRate * 0.5);
                const out: Float32Array = new Float32Array(length);
                let phase: number = 0.0;
                for (let i: number = 0; i < length; i++) {
                        const t: number = i / sampleRate;
                        const freq: number = 90 * Math.exp(-t * 2.2) + 30;
                        phase += 2 * Math.PI * freq / sampleRate;
                        out[i] = Math.sin(phase) * Math.exp(-t * 5) * 0.9;
                }
                return out;
        }
        
        private static generate808Kit(): void {
                TriuboxLibrary.generateKit("kit.808", "808 Kit", [
                        TriuboxLibrary.synth808Kick(),      // slice 1: kick
                        TriuboxLibrary.synthSnare(190, 0.28, 0.55), // slice 2: snare
                        TriuboxLibrary.synthClap(),         // slice 3: clap
                        TriuboxLibrary.synthHat(false),     // slice 4: closed hat
                        TriuboxLibrary.synthHat(true),      // slice 5: open hat
                        TriuboxLibrary.synthTom(120),       // slice 6: low tom
                        TriuboxLibrary.synthTom(200),       // slice 7: mid tom
                        TriuboxLibrary.synthCowbell(),      // slice 8: cowbell
                ]);
        }
        
        private static generateDnBKit(): void {
                TriuboxLibrary.generateKit("kit.dnb", "Drum & Bass Kit", [
                        TriuboxLibrary.synth808Kick(),      // slice 1: punchy kick
                        TriuboxLibrary.synthSnare(240, 0.18, 0.7), // slice 2: ghost snare
                        TriuboxLibrary.synthRim(),          // slice 3: rimshot
                        TriuboxLibrary.synthHat(false),     // slice 4: ghost hat
                        TriuboxLibrary.synthHat(true),      // slice 5: open hat
                        TriuboxLibrary.synthCrash(),        // slice 6: crash
                        TriuboxLibrary.synthSubDrop(),      // slice 7: sub drop (reese-ish filler)
                        TriuboxLibrary.synthTom(160),       // slice 8: tom fill
                ]);
        }
        
        // ---------- FX rack presets ----------
        
        public static listFxPresets(): TriuFxPreset[] {
                try {
                        return JSON.parse(window.localStorage.getItem(FX_STORAGE_KEY) || "[]");
                } catch (e) {
                        return [];
                }
        }
        
        public static saveFxPreset(name: string, fx: TriuFxSettings): void {
                const presets: TriuFxPreset[] = TriuboxLibrary.listFxPresets().filter(p => p.name != name);
                presets.push({name, fx});
                try {
                        window.localStorage.setItem(FX_STORAGE_KEY, JSON.stringify(presets));
                } catch (e) {}
        }
        
        public static deleteFxPreset(name: string): void {
                const presets: TriuFxPreset[] = TriuboxLibrary.listFxPresets().filter(p => p.name != name);
                try {
                        window.localStorage.setItem(FX_STORAGE_KEY, JSON.stringify(presets));
                } catch (e) {}
        }
        
        public static currentFxSettings(instrument: Instrument): TriuFxSettings {
                return {
                        tapeWobble: instrument.tapeWobble,
                        tapeWobbleSpeed: instrument.tapeWobbleSpeed,
                        ringModDepth: instrument.ringModDepth,
                        ringModFreq: instrument.ringModFreq,
                        triDelayAmount: instrument.triDelayAmount,
                        triDelayTime: instrument.triDelayTime,
                        sidechainAmount: instrument.sidechainAmount,
                };
        }
        
        public static applyFxSettings(instrument: Instrument, fx: TriuFxSettings): void {
                instrument.tapeWobble = fx.tapeWobble;
                instrument.tapeWobbleSpeed = fx.tapeWobbleSpeed;
                instrument.ringModDepth = fx.ringModDepth;
                instrument.ringModFreq = fx.ringModFreq;
                instrument.triDelayAmount = fx.triDelayAmount;
                instrument.triDelayTime = fx.triDelayTime;
                instrument.sidechainAmount = fx.sidechainAmount;
        }
        
        // ---------- Instrument presets ----------
        
        public static listInstrumentPresets(): TriuInstrumentPreset[] {
                try {
                        return JSON.parse(window.localStorage.getItem(INSTRUMENT_STORAGE_KEY) || "[]");
                } catch (e) {
                        return [];
                }
        }
        
        public static saveInstrumentPreset(name: string, instrument: Instrument): void {
                const presets: TriuInstrumentPreset[] = TriuboxLibrary.listInstrumentPresets().filter(p => p.name != name);
                presets.push({name, json: instrument.toJsonObject()});
                try {
                        window.localStorage.setItem(INSTRUMENT_STORAGE_KEY, JSON.stringify(presets));
                } catch (e) {}
        }
        
        public static deleteInstrumentPreset(name: string): void {
                const presets: TriuInstrumentPreset[] = TriuboxLibrary.listInstrumentPresets().filter(p => p.name != name);
                try {
                        window.localStorage.setItem(INSTRUMENT_STORAGE_KEY, JSON.stringify(presets));
                } catch (e) {}
        }
        
        public static downloadJson(filename: string, data: any): void {
                const blob: Blob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json"});
                const url: string = URL.createObjectURL(blob);
                const anchor: HTMLAnchorElement = document.createElement("a");
                anchor.href = url;
                anchor.download = filename;
                document.body.appendChild(anchor);
                anchor.click();
                document.body.removeChild(anchor);
                setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
}
