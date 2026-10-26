// Copyright (c) John Nesky and contributing authors, distributed under the MIT license, see accompanying the LICENSE.md file.

import {BeepBoxOption, DictionaryArray, toNameMap} from "../synth/SynthConfig.js";
import {Song} from "../synth/synth.js";
import {HTML} from "imperative-html/dist/esm/elements-strict.js";

export interface ChannelColors extends BeepBoxOption {
        readonly secondaryChannel: string;
        readonly primaryChannel:   string;
        readonly secondaryNote: string;
        readonly primaryNote: string;
}

export class ColorConfig {
        public static readonly themes: {[name: string]: string} = {
                "dark classic": `
                        :root {
                                --page-margin: black;
                                --editor-background: black;
                                --hover-preview: white;
                                --playhead: white;
                                --primary-text: white;
                                --secondary-text: #999;
                                --inverted-text: black;
                                --text-selection: rgba(119,68,255,0.99);
                                --box-selection-fill: rgba(255,255,255,0.2);
                                --loop-accent: #74f;
                                --link-accent: #98f;
                                --ui-widget-background: #444;
                                --ui-widget-focus: #777;
                                --pitch-background: #444;
                                --tonic: #864;
                                --fifth-note: #468;
                                --white-piano-key: #bbb;
                                --black-piano-key: #444;
                                --pitch1-secondary-channel: #0099A1;
                                --pitch1-primary-channel:   #25F3FF;
                                --pitch1-secondary-note:    #00BDC7;
                                --pitch1-primary-note:      #92F9FF;
                                --pitch2-secondary-channel: #A1A100;
                                --pitch2-primary-channel:   #FFFF25;
                                --pitch2-secondary-note:    #C7C700;
                                --pitch2-primary-note:      #FFFF92;
                                --pitch3-secondary-channel: #C75000;
                                --pitch3-primary-channel:   #FF9752;
                                --pitch3-secondary-note:    #FF771C;
                                --pitch3-primary-note:      #FFCDAB;
                                --pitch4-secondary-channel: #00A100;
                                --pitch4-primary-channel:   #50FF50;
                                --pitch4-secondary-note:    #00C700;
                                --pitch4-primary-note:      #A0FFA0;
                                --pitch5-secondary-channel: #D020D0;
                                --pitch5-primary-channel:   #FF90FF;
                                --pitch5-secondary-note:    #E040E0;
                                --pitch5-primary-note:      #FFC0FF;
                                --pitch6-secondary-channel: #7777B0;
                                --pitch6-primary-channel:   #A0A0FF;
                                --pitch6-secondary-note:    #8888D0;
                                --pitch6-primary-note:      #D0D0FF;
                                --pitch7-secondary-channel: #8AA100;
                                --pitch7-primary-channel:   #DEFF25;
                                --pitch7-secondary-note:    #AAC700;
                                --pitch7-primary-note:      #E6FF92;
                                --pitch8-secondary-channel: #DF0019;
                                --pitch8-primary-channel:   #FF98A4;
                                --pitch8-secondary-note:    #FF4E63;
                                --pitch8-primary-note:      #FFB2BB;
                                --pitch9-secondary-channel: #00A170;
                                --pitch9-primary-channel:   #50FFC9;
                                --pitch9-secondary-note:    #00C78A;
                                --pitch9-primary-note:      #83FFD9;
                                --pitch10-secondary-channel:#A11FFF;
                                --pitch10-primary-channel:  #CE8BFF;
                                --pitch10-secondary-note:   #B757FF;
                                --pitch10-primary-note:     #DFACFF;
                                --noise1-secondary-channel: #6F6F6F;
                                --noise1-primary-channel:   #AAAAAA;
                                --noise1-secondary-note:    #A7A7A7;
                                --noise1-primary-note:      #E0E0E0;
                                --noise2-secondary-channel: #996633;
                                --noise2-primary-channel:   #DDAA77;
                                --noise2-secondary-note:    #CC9966;
                                --noise2-primary-note:      #F0D0BB;
                                --noise3-secondary-channel: #4A6D8F;
                                --noise3-primary-channel:   #77AADD;
                                --noise3-secondary-note:    #6F9FCF;
                                --noise3-primary-note:      #BBD7FF;
                                --noise4-secondary-channel: #7A4F9A;
                                --noise4-primary-channel:   #AF82D2;
                                --noise4-secondary-note:    #9E71C1;
                                --noise4-primary-note:      #D4C1EA;
                                --noise5-secondary-channel: #607837;
                                --noise5-primary-channel:   #A2BB77;
                                --noise5-secondary-note:    #91AA66;
                                --noise5-primary-note:      #C5E2B2;
                        }
                `,
                "light classic": `
                        :root {
                                -webkit-text-stroke-width: 0.5px;
                                --page-margin: #685d88;
                                --editor-background: white;
                                --hover-preview: black;
                                --playhead: rgba(0,0,0,0.5);
                                --primary-text: black;
                                --secondary-text: #777;
                                --inverted-text: white;
                                --text-selection: rgba(200,170,255,0.99);
                                --box-selection-fill: rgba(0,0,0,0.1);
                                --loop-accent: #98f;
                                --link-accent: #74f;
                                --ui-widget-background: #ececec;
                                --ui-widget-focus: #eee;
                                --pitch-background: #ececec;
                                --tonic: #f0d6b6;
                                --fifth-note: #bbddf0;
                                --white-piano-key: #eee;
                                --black-piano-key: #666;
                                --pitch1-secondary-channel: #6CD9ED;
                                --pitch1-primary-channel:   #00A0BD;
                                --pitch1-secondary-note:    #34C2DC;
                                --pitch1-primary-note:      #00758A;
                                --pitch2-secondary-channel: #E3C941;
                                --pitch2-primary-channel:   #B49700;
                                --pitch2-secondary-note:    #D1B628;
                                --pitch2-primary-note:      #836E00;
                                --pitch3-secondary-channel: #FF9D61;
                                --pitch3-primary-channel:   #E14E00;
                                --pitch3-secondary-note:    #F67D3C;
                                --pitch3-primary-note:      #B64000;
                                --pitch4-secondary-channel: #4BE24B;
                                --pitch4-primary-channel:   #00A800;
                                --pitch4-secondary-note:    #2DC82D;
                                --pitch4-primary-note:      #008000;
                                --pitch5-secondary-channel: #FF90FF;
                                --pitch5-primary-channel:   #E12EDF;
                                --pitch5-secondary-note:    #EC6EEC;
                                --pitch5-primary-note:      #A600A5;
                                --pitch6-secondary-channel: #B5B5FE;
                                --pitch6-primary-channel:   #6969FD;
                                --pitch6-secondary-note:    #9393FE;
                                --pitch6-primary-note:      #4A4AD7;
                                --pitch7-secondary-channel: #C2D848;
                                --pitch7-primary-channel:   #8EA800;
                                --pitch7-secondary-note:    #B0C82D;
                                --pitch7-primary-note:      #6C8000;
                                --pitch8-secondary-channel: #FF90A4;
                                --pitch8-primary-channel:   #E12E4D;
                                --pitch8-secondary-note:    #EC6E85;
                                --pitch8-primary-note:      #A6001D;
                                --pitch9-secondary-channel: #41E3B5;
                                --pitch9-primary-channel:   #00B481;
                                --pitch9-secondary-note:    #28D1A1;
                                --pitch9-primary-note:      #00835E;
                                --pitch10-secondary-channel:#CA77FF;
                                --pitch10-primary-channel:  #9609FF;
                                --pitch10-secondary-note:   #B54FFF;
                                --pitch10-primary-note:     #8400E3;
                                --noise1-secondary-channel: #C1C1C1;
                                --noise1-primary-channel:   #898989;
                                --noise1-secondary-note:    #ADADAD;
                                --noise1-primary-note:      #6C6C6C;
                                --noise2-secondary-channel: #E8BB8C;
                                --noise2-primary-channel:   #BD7D3A;
                                --noise2-secondary-note:    #D1A374;
                                --noise2-primary-note:      #836342;
                                --noise3-secondary-channel: #9BC4EB;
                                --noise3-primary-channel:   #4481BE;
                                --noise3-secondary-note:    #7CA7D3;
                                --noise3-primary-note:      #476685;
                                --noise4-secondary-channel: #C5A5E0;
                                --noise4-primary-channel:   #8553AE;
                                --noise4-secondary-note:    #B290CC;
                                --noise4-primary-note:      #684F7D;
                                --noise5-secondary-channel: #B8CE93;
                                --noise5-primary-channel:   #87A74F;
                                --noise5-secondary-note:    #ABC183;
                                --noise5-primary-note:      #68784C;
                        }
                        
                        .beepboxEditor button, .beepboxEditor select {
                                box-shadow: inset 0 0 0 1px var(--secondary-text);
                        }
                `,
                "neon tri": `
                        :root {
                                --page-margin: #06040c;
                                --editor-background: #0f0c1d;
                                --hover-preview: #ffffff;
                                --playhead: #ffffff;
                                --primary-text: #e8e6ff;
                                --secondary-text: #8f8ab0;
                                --inverted-text: #0f0c1d;
                                --text-selection: rgba(0,229,255,0.45);
                                --box-selection-fill: rgba(255,255,255,0.18);
                                --loop-accent: #ff2fd6;
                                --link-accent: #4de3ea;
                                --ui-widget-background: #1c1834;
                                --ui-widget-focus: #292350;
                                --pitch-background: #171331;
                                --tonic: #8f6a1e;
                                --fifth-note: #1e6f8f;
                                --white-piano-key: #b9b3d9;
                                --black-piano-key: #322b58;
                                --pitch1-secondary-channel: #007a8a;
                                --pitch1-primary-channel:   #00e5ff;
                                --pitch1-secondary-note:    #00c2d6;
                                --pitch1-primary-note:      #7ff7ff;
                                --pitch2-secondary-channel: #8a7a00;
                                --pitch2-primary-channel:   #ffe100;
                                --pitch2-secondary-note:    #b3a300;
                                --pitch2-primary-note:      #fff97f;
                                --pitch3-secondary-channel: #a03e00;
                                --pitch3-primary-channel:   #ff7a2f;
                                --pitch3-secondary-note:    #d65f1a;
                                --pitch3-primary-note:      #ffb37f;
                                --pitch4-secondary-channel: #0a8a0a;
                                --pitch4-primary-channel:   #3dff3d;
                                --pitch4-secondary-note:    #17d117;
                                --pitch4-primary-note:      #a0ffa0;
                                --pitch5-secondary-channel: #a8009e;
                                --pitch5-primary-channel:   #ff2fd6;
                                --pitch5-secondary-note:    #d61fb0;
                                --pitch5-primary-note:      #ffa4f0;
                                --pitch6-secondary-channel: #4450c8;
                                --pitch6-primary-channel:   #8a94ff;
                                --pitch6-secondary-note:    #5f6ce0;
                                --pitch6-primary-note:      #c3c9ff;
                                --pitch7-secondary-channel: #6f8a00;
                                --pitch7-primary-channel:   #c8ff2f;
                                --pitch7-secondary-note:    #a3d600;
                                --pitch7-primary-note:      #e6ffa0;
                                --pitch8-secondary-channel: #c80f2e;
                                --pitch8-primary-channel:   #ff5f7a;
                                --pitch8-secondary-note:    #e02f4f;
                                --pitch8-primary-note:      #ffa8b8;
                                --pitch9-secondary-channel: #008a6f;
                                --pitch9-primary-channel:   #2fffd6;
                                --pitch9-secondary-note:    #00d6a8;
                                --pitch9-primary-note:      #a0ffe8;
                                --pitch10-secondary-channel:#7a2fc8;
                                --pitch10-primary-channel:  #b98aff;
                                --pitch10-secondary-note:   #9a5fe0;
                                --pitch10-primary-note:     #ddc2ff;
                                --noise1-secondary-channel: #4a4a55;
                                --noise1-primary-channel:   #8f8fa3;
                                --noise1-secondary-note:    #6f6f80;
                                --noise1-primary-note:      #c9c9dd;
                                --noise2-secondary-channel: #8a5f3a;
                                --noise2-primary-channel:   #d9a06f;
                                --noise2-secondary-note:    #b37f4f;
                                --noise2-primary-note:      #f0cdb0;
                                --noise3-secondary-channel: #2f5f8f;
                                --noise3-primary-channel:   #6fa8dd;
                                --noise3-secondary-note:    #4f88bd;
                                --noise3-primary-note:      #b0d5f0;
                                --noise4-secondary-channel: #6f3a8f;
                                --noise4-primary-channel:   #ad82d9;
                                --noise4-secondary-note:    #9166bd;
                                --noise4-primary-note:      #d4c0f0;
                                --noise5-secondary-channel: #4f6f2f;
                                --noise5-primary-channel:   #8fbd5f;
                                --noise5-secondary-note:    #6f9a4f;
                                --noise5-primary-note:      #c2e0a0;
                        }
                `,
                "retro crt": `
                        :root {
                                --page-margin: #000000;
                                --editor-background: #050805;
                                --hover-preview: #eaffea;
                                --playhead: #baffba;
                                --primary-text: #39ff6a;
                                --secondary-text: #2a8f47;
                                --inverted-text: #041004;
                                --text-selection: rgba(57,255,106,0.35);
                                --box-selection-fill: rgba(57,255,106,0.15);
                                --loop-accent: #ffb000;
                                --link-accent: #7aff9e;
                                --ui-widget-background: #0b1a0d;
                                --ui-widget-focus: #14301a;
                                --pitch-background: #0a140b;
                                --tonic: #915f10;
                                --fifth-note: #14532a;
                                --white-piano-key: #2f6b3f;
                                --black-piano-key: #0f2413;
                                --pitch1-secondary-channel: #0f6b3f;
                                --pitch1-primary-channel:   #39ff6a;
                                --pitch1-secondary-note:    #2ad655;
                                --pitch1-primary-note:      #a0ffc0;
                                --pitch2-secondary-channel: #6b5f0f;
                                --pitch2-primary-channel:   #ffe95c;
                                --pitch2-secondary-note:    #d6c22f;
                                --pitch2-primary-note:      #fffaa0;
                                --pitch3-secondary-channel: #6b3a0f;
                                --pitch3-primary-channel:   #ffb05c;
                                --pitch3-secondary-note:    #d67f2a;
                                --pitch3-primary-note:      #ffd0a0;
                                --pitch4-secondary-channel: #0f6b1f;
                                --pitch4-primary-channel:   #5cff8a;
                                --pitch4-secondary-note:    #2ad65f;
                                --pitch4-primary-note:      #a0ffbf;
                                --pitch5-secondary-channel: #0f6b5f;
                                --pitch5-primary-channel:   #3affd6;
                                --pitch5-secondary-note:    #2ad6a8;
                                --pitch5-primary-note:      #a0fff0;
                                --pitch6-secondary-channel: #0f4f6b;
                                --pitch6-primary-channel:   #5cc8ff;
                                --pitch6-secondary-note:    #2a9fd6;
                                --pitch6-primary-note:      #a0e8ff;
                                --pitch7-secondary-channel: #4f6b0f;
                                --pitch7-primary-channel:   #c8ff5c;
                                --pitch7-secondary-note:    #9fd62a;
                                --pitch7-primary-note:      #e0ffa0;
                                --pitch8-secondary-channel: #6b0f1f;
                                --pitch8-primary-channel:   #ff5c7a;
                                --pitch8-secondary-note:    #d62a4f;
                                --pitch8-primary-note:      #ffa0b5;
                                --pitch9-secondary-channel: #0f5f4f;
                                --pitch9-primary-channel:   #3affb5;
                                --pitch9-secondary-note:    #2ad68f;
                                --pitch9-primary-note:      #a0ffd6;
                                --pitch10-secondary-channel:#3f0f6b;
                                --pitch10-primary-channel:  #b05cff;
                                --pitch10-secondary-note:   #8f2ad6;
                                --pitch10-primary-note:     #d6a0ff;
                                --noise1-secondary-channel: #1f3f28;
                                --noise1-primary-channel:   #5c9f70;
                                --noise1-secondary-note:    #3f7f52;
                                --noise1-primary-note:      #a0d8b0;
                                --noise2-secondary-channel: #4f3f1f;
                                --noise2-primary-channel:   #c8a85c;
                                --noise2-secondary-note:    #9f7f3f;
                                --noise2-primary-note:      #e8d0a0;
                                --noise3-secondary-channel: #1f3a4f;
                                --noise3-primary-channel:   #5c92c8;
                                --noise3-secondary-note:    #3f6f9f;
                                --noise3-primary-note:      #a0cbe8;
                                --noise4-secondary-channel: #3f1f4f;
                                --noise4-primary-channel:   #9f5cc8;
                                --noise4-secondary-note:    #7f3f9f;
                                --noise4-primary-note:      #d0a0e8;
                                --noise5-secondary-channel: #33421f;
                                --noise5-primary-channel:   #8fb85c;
                                --noise5-secondary-note:    #6f943f;
                                --noise5-primary-note:      #cbe0a0;
                        }
                `,
                "paper": `
                        :root {
                                -webkit-text-stroke-width: 0.5px;
                                --page-margin: #b8a988;
                                --editor-background: #f4ecd8;
                                --hover-preview: #2b2620;
                                --playhead: rgba(43,38,32,0.5);
                                --primary-text: #2b2620;
                                --secondary-text: #7a6f5f;
                                --inverted-text: #f4ecd8;
                                --text-selection: rgba(210,160,90,0.55);
                                --box-selection-fill: rgba(43,38,32,0.12);
                                --loop-accent: #b0532a;
                                --link-accent: #2a5fb0;
                                --ui-widget-background: #e9dcc0;
                                --ui-widget-focus: #efe4cc;
                                --pitch-background: #e9dcc0;
                                --tonic: #d9b98a;
                                --fifth-note: #b8c9d9;
                                --white-piano-key: #efe6d0;
                                --black-piano-key: #5f5648;
                                --pitch1-secondary-channel: #8fc3cf;
                                --pitch1-primary-channel:   #3f8fa3;
                                --pitch1-secondary-note:    #6fb0bf;
                                --pitch1-primary-note:      #2a6b7d;
                                --pitch2-secondary-channel: #d9c46b;
                                --pitch2-primary-channel:   #a88f2a;
                                --pitch2-secondary-note:    #c2ad4f;
                                --pitch2-primary-note:      #7d6a1f;
                                --pitch3-secondary-channel: #e8a06b;
                                --pitch3-primary-channel:   #c25f2a;
                                --pitch3-secondary-note:    #d67f45;
                                --pitch3-primary-note:      #93451f;
                                --pitch4-secondary-channel: #90c290;
                                --pitch4-primary-channel:   #3f8f3f;
                                --pitch4-secondary-note:    #63ad63;
                                --pitch4-primary-note:      #2a6b2a;
                                --pitch5-secondary-channel: #d98fc3;
                                --pitch5-primary-channel:   #b03f8f;
                                --pitch5-secondary-note:    #c25fa3;
                                --pitch5-primary-note:      #7d2a63;
                                --pitch6-secondary-channel: #a3a3d9;
                                --pitch6-primary-channel:   #5f5fb0;
                                --pitch6-secondary-note:    #8383c2;
                                --pitch6-primary-note:      #46467d;
                                --pitch7-secondary-channel: #c2cf8f;
                                --pitch7-primary-channel:   #8fa32f;
                                --pitch7-secondary-note:    #a8bd5f;
                                --pitch7-primary-note:      #6b7d1f;
                                --pitch8-secondary-channel: #d98f9c;
                                --pitch8-primary-channel:   #b03f5f;
                                --pitch8-secondary-note:    #c25f7d;
                                --pitch8-primary-note:      #7d2a46;
                                --pitch9-secondary-channel: #8fc9b0;
                                --pitch9-primary-channel:   #2a8f63;
                                --pitch9-secondary-note:    #5fb083;
                                --pitch9-primary-note:      #1f6b4a;
                                --pitch10-secondary-channel:#c29fd9;
                                --pitch10-primary-channel:  #8f3fc2;
                                --pitch10-secondary-note:   #a85fd6;
                                --pitch10-primary-note:     #6b2a7d;
                                --noise1-secondary-channel: #cfc4ad;
                                --noise1-primary-channel:   #8f8470;
                                --noise1-secondary-note:    #a89d88;
                                --noise1-primary-note:      #5f5648;
                                --noise2-secondary-channel: #d9b98a;
                                --noise2-primary-channel:   #a3763f;
                                --noise2-secondary-note:    #bf9a63;
                                --noise2-primary-note:      #7d5528;
                                --noise3-secondary-channel: #a8bfd9;
                                --noise3-primary-channel:   #4f7db0;
                                --noise3-secondary-note:    #6f95bf;
                                --noise3-primary-note:      #33577d;
                                --noise4-secondary-channel: #c4a8d9;
                                --noise4-primary-channel:   #8f5fb0;
                                --noise4-secondary-note:    #a3769f;
                                --noise4-primary-note:      #6b3f7d;
                                --noise5-secondary-channel: #b8c99a;
                                --noise5-primary-channel:   #6b8f3f;
                                --noise5-secondary-note:    #84a35f;
                                --noise5-primary-note:      #4a632a;
                        }

                        .beepboxEditor button, .beepboxEditor select {
                                box-shadow: inset 0 0 0 1px var(--secondary-text);
                        }
                `,
        };

        // Порядок переключения тем в меню Options (клик по "Theme: ..." листает по кругу).
        public static readonly themeOrder: ReadonlyArray<string> = ["neon tri", "retro crt", "paper", "dark classic", "light classic"];
        public static readonly themeDisplayNames: {[name: string]: string} = {
                "neon tri": "Neon Tri",
                "retro crt": "Retro CRT",
                "paper": "Paper",
                "dark classic": "Classic Dark",
                "light classic": "Classic Light",
        };
        
        public static readonly pageMargin: string = "var(--page-margin)";
        public static readonly editorBackground: string = "var(--editor-background)";
        public static readonly hoverPreview: string = "var(--hover-preview)";
        public static readonly playhead: string = "var(--playhead)";
        public static readonly primaryText: string = "var(--primary-text)";
        public static readonly secondaryText: string = "var(--secondary-text)";
        public static readonly invertedText: string = "var(--inverted-text)";
        public static readonly textSelection: string = "var(--text-selection)";
        public static readonly boxSelectionFill: string = "var(--box-selection-fill)";
        public static readonly loopAccent: string = "var(--loop-accent)";
        public static readonly linkAccent: string = "var(--link-accent)";
        public static readonly uiWidgetBackground: string = "var(--ui-widget-background)";
        public static readonly uiWidgetFocus: string = "var(--ui-widget-focus)";
        public static readonly pitchBackground: string = "var(--pitch-background)";
        public static readonly tonic: string = "var(--tonic)";
        public static readonly fifthNote: string = "var(--fifth-note)";
        public static readonly whitePianoKey: string = "var(--white-piano-key)";
        public static readonly blackPianoKey: string = "var(--black-piano-key)";
        
        public static readonly pitchChannels: DictionaryArray<ChannelColors> = toNameMap([
                {
                        name: "pitch1", // cyan
                        secondaryChannel: "var(--pitch1-secondary-channel)",
                        primaryChannel:   "var(--pitch1-primary-channel)",
                        secondaryNote:    "var(--pitch1-secondary-note)",
                        primaryNote:      "var(--pitch1-primary-note)",
                }, {
                        name: "pitch2", // yellow
                        secondaryChannel: "var(--pitch2-secondary-channel)",
                        primaryChannel:   "var(--pitch2-primary-channel)",
                        secondaryNote:    "var(--pitch2-secondary-note)",
                        primaryNote:      "var(--pitch2-primary-note)",
                }, {
                        name: "pitch3", // orange
                        secondaryChannel: "var(--pitch3-secondary-channel)",
                        primaryChannel:   "var(--pitch3-primary-channel)",
                        secondaryNote:    "var(--pitch3-secondary-note)",
                        primaryNote:      "var(--pitch3-primary-note)",
                }, {
                        name: "pitch4", // green
                        secondaryChannel: "var(--pitch4-secondary-channel)",
                        primaryChannel:   "var(--pitch4-primary-channel)",
                        secondaryNote:    "var(--pitch4-secondary-note)",
                        primaryNote:      "var(--pitch4-primary-note)",
                }, {
                        name: "pitch5", // magenta
                        secondaryChannel: "var(--pitch5-secondary-channel)",
                        primaryChannel:   "var(--pitch5-primary-channel)",
                        secondaryNote:    "var(--pitch5-secondary-note)",
                        primaryNote:      "var(--pitch5-primary-note)",
                }, {
                        name: "pitch6", // blue
                        secondaryChannel: "var(--pitch6-secondary-channel)",
                        primaryChannel:   "var(--pitch6-primary-channel)",
                        secondaryNote:    "var(--pitch6-secondary-note)",
                        primaryNote:      "var(--pitch6-primary-note)",
                }, {
                        name: "pitch7", // olive
                        secondaryChannel: "var(--pitch7-secondary-channel)",
                        primaryChannel:   "var(--pitch7-primary-channel)",
                        secondaryNote:    "var(--pitch7-secondary-note)",
                        primaryNote:      "var(--pitch7-primary-note)",
                }, {
                        name: "pitch8", // red
                        secondaryChannel: "var(--pitch8-secondary-channel)",
                        primaryChannel:   "var(--pitch8-primary-channel)",
                        secondaryNote:    "var(--pitch8-secondary-note)",
                        primaryNote:      "var(--pitch8-primary-note)",
                }, {
                        name: "pitch9", // teal
                        secondaryChannel: "var(--pitch9-secondary-channel)",
                        primaryChannel:   "var(--pitch9-primary-channel)",
                        secondaryNote:    "var(--pitch9-secondary-note)",
                        primaryNote:      "var(--pitch9-primary-note)",
                }, {
                        name: "pitch10", // purple
                        secondaryChannel: "var(--pitch10-secondary-channel)",
                        primaryChannel:   "var(--pitch10-primary-channel)",
                        secondaryNote:    "var(--pitch10-secondary-note)",
                        primaryNote:      "var(--pitch10-primary-note)",
                },
        ]);
        public static readonly noiseChannels: DictionaryArray<ChannelColors> = toNameMap([
                {
                        name: "noise1", // gray
                        secondaryChannel: "var(--noise1-secondary-channel)",
                        primaryChannel:   "var(--noise1-primary-channel)",
                        secondaryNote:    "var(--noise1-secondary-note)",
                        primaryNote:      "var(--noise1-primary-note)",
                }, {
                        name: "noise2", // brown
                        secondaryChannel: "var(--noise2-secondary-channel)",
                        primaryChannel:   "var(--noise2-primary-channel)",
                        secondaryNote:    "var(--noise2-secondary-note)",
                        primaryNote:      "var(--noise2-primary-note)",
                }, {
                        name: "noise3", // azure
                        secondaryChannel: "var(--noise3-secondary-channel)",
                        primaryChannel:   "var(--noise3-primary-channel)",
                        secondaryNote:    "var(--noise3-secondary-note)",
                        primaryNote:      "var(--noise3-primary-note)",
                }, {
                        name: "noise4", // purple
                        secondaryChannel: "var(--noise4-secondary-channel)",
                        primaryChannel:   "var(--noise4-primary-channel)",
                        secondaryNote:    "var(--noise4-secondary-note)",
                        primaryNote:      "var(--noise4-primary-note)",
                }, {
                        name: "noise5", // sage
                        secondaryChannel: "var(--noise5-secondary-channel)",
                        primaryChannel:   "var(--noise5-primary-channel)",
                        secondaryNote:    "var(--noise5-secondary-note)",
                        primaryNote:      "var(--noise5-primary-note)",
                },
        ]);
        
        public static getChannelColor(song: Song, channel: number): ChannelColors {
                return channel < song.pitchChannelCount
                        ? ColorConfig.pitchChannels[channel % ColorConfig.pitchChannels.length]
                        : ColorConfig.noiseChannels[(channel - song.pitchChannelCount) % ColorConfig.noiseChannels.length];
        }
        
        private static readonly _styleElement: HTMLStyleElement = document.head.appendChild(HTML.style({type: "text/css"}));
        
        public static setTheme(name: string): void {
                let theme: string = this.themes[name];
                if (theme == undefined) theme = this.themes["dark classic"];
                this._styleElement.textContent = theme;
                
                const themeColor = <HTMLMetaElement> document.querySelector("meta[name='theme-color']");
                if (themeColor != null) {
                        themeColor.setAttribute("content", getComputedStyle(document.documentElement).getPropertyValue('--ui-widget-background'));
                }
        }
}
