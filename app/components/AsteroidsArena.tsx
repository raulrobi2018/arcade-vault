"use client";

import { useEffect, useRef } from "react";
import {
    createAsteroids,
    type AsteroidsHandle,
    type AsteroidsStats,
} from "@/app/games/asteroids/engine";

type Props = {
    paused: boolean;
    runId: number; // cambiarlo recrea el motor (partida nueva)
    onStats: (stats: AsteroidsStats) => void;
    onGameOver: (finalScore: number) => void;
};

export function AsteroidsArena({ paused, runId, onStats, onGameOver }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const handleRef = useRef<AsteroidsHandle | null>(null);
    const pausedRef = useRef(paused);
    const callbacksRef = useRef({ onStats, onGameOver });

    useEffect(() => {
        pausedRef.current = paused;
        callbacksRef.current = { onStats, onGameOver };
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const handle = createAsteroids(canvas, {
            onStats: (s) => callbacksRef.current.onStats(s),
            onGameOver: (score) => callbacksRef.current.onGameOver(score),
        });
        handleRef.current = handle;
        if (pausedRef.current) handle.pause();
        return () => {
            handle.destroy();
            handleRef.current = null;
        };
    }, [runId]);

    useEffect(() => {
        if (paused) handleRef.current?.pause();
        else handleRef.current?.resume();
    }, [paused]);

    return (
        <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="absolute inset-0 h-full w-full"
        />
    );
}
