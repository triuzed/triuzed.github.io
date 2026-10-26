// Copyright (c) John Nesky and contributing authors, distributed under the MIT license, see accompanying the LICENSE.md file.
// Восстановлено вручную: интерфейсный файл не порождает JS и отсутствует в sourcemap оригинальной сборки.

export interface Prompt {
	readonly container: HTMLElement;
	cleanUp(): void;
}
