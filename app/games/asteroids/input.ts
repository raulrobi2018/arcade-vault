import type { Keys } from "./entities";

const GAME_KEYS = new Set([
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "Space",
]);

export type Input = {
    keys: Keys;
    pressed: (code: string) => boolean; // true una sola vez por pulsación
    destroy: () => void;
};

function isEditable(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) return false;
    const tag = target.tagName;
    return tag === "INPUT" || tag === "TEXTAREA";
}

export function createInput(): Input {
    const keys: Keys = {};
    const justPressed: Keys = {};

    const onKeyDown = (e: KeyboardEvent) => {
        if (isEditable(e.target)) return;
        if (GAME_KEYS.has(e.code)) e.preventDefault();
        if (!keys[e.code]) justPressed[e.code] = true;
        keys[e.code] = true;
    };

    const onKeyUp = (e: KeyboardEvent) => {
        if (isEditable(e.target)) return;
        if (GAME_KEYS.has(e.code)) e.preventDefault();
        keys[e.code] = false;
    };

    const clear = () => {
        for (const code of Object.keys(keys)) keys[code] = false;
        for (const code of Object.keys(justPressed)) justPressed[code] = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", clear);

    return {
        keys,
        pressed(code) {
            const val = !!justPressed[code];
            justPressed[code] = false;
            return val;
        },
        destroy() {
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("keyup", onKeyUp);
            window.removeEventListener("blur", clear);
        },
    };
}
