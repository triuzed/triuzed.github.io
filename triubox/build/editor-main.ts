// Точка входа бандла beepbox_editor.js.
// Повторяет список экспортов оригинального бандла BeepBox 4.2.2,
// чтобы не сломать внешние интеграции (synth_example.html и др.).

// style.ts — side-effect модуль (инжектирует главный CSS). В оригинальной
// сборке BeepBox все модули добавлялись списком, а esbuild собирает только
// граф импортов, поэтому подключаем его явно.
import "../editor/style.js";

export { ChangePreset } from "../editor/changes.js";
export { ColorConfig } from "../editor/ColorConfig.js";
export { EditorConfig } from "../editor/EditorConfig.js";
export { ExportPrompt } from "../editor/ExportPrompt.js";
export { SongDocument } from "../editor/SongDocument.js";
export { SongEditor } from "../editor/SongEditor.js";
export {
        Channel,
        Config,
        DynamicBiquadFilter,
        FilterCoefficients,
        FrequencyResponse,
        Instrument,
        Note,
        Pattern,
        Song,
        Synth,
        fastFourierTransform,
        forwardRealFourierTransform,
        inverseRealFourierTransform,
} from "../synth/synth.js";
