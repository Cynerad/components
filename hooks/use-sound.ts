import type { HowlOptions } from "howler";

import { Howl } from "howler";
import { useCallback, useEffect, useRef, useState } from "react";

export type SpriteMap = Record<string, [number, number]>;

export type UseSoundOptions<T extends SpriteMap | undefined = undefined> = {
  volume?: number;
  playbackRate?: number;
  interrupt?: boolean;
  soundEnabled?: boolean;
  sprite?: T;
  onload?: (howl: Howl) => void;
} & Omit<HowlOptions, "src" | "sprite" | "onload">;

export type PlayOptions<T extends SpriteMap | undefined = undefined> = {
  forceSoundEnabled?: boolean;
  playbackRate?: number;
  id?: T extends SpriteMap ? keyof T : never;
};

export type SoundControls = {
  stop: (id?: number) => void;
  pause: (id?: number) => void;
  duration: number | null;
  sound: Howl | null;
  isLoading: boolean;
  isLoaded: boolean;
};

export type UseSoundReturn<T extends SpriteMap | undefined = undefined> = [(options?: PlayOptions<T>) => void, SoundControls];

export function useSound<T extends SpriteMap | undefined = undefined>(url: string, opts: UseSoundOptions<T> = {}): UseSoundReturn<T> {
  const { volume = 1, playbackRate = 1, interrupt = false, soundEnabled = true, sprite, onload, ...howlDelegated } = opts;

  const howlRef = useRef<Howl | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);

  const optsRef = useRef({ volume, playbackRate, interrupt, soundEnabled });
  useEffect(() => {
    optsRef.current = { volume, playbackRate, interrupt, soundEnabled };
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    setIsLoaded(false);
    setDuration(null);

    const howlOptions: HowlOptions = {
      src: [url],
      volume,
      rate: playbackRate,
      sprite: sprite as HowlOptions["sprite"],
      onload() {
        const howl = howlRef.current;
        if (!howl) return;
        setIsLoading(false);
        setIsLoaded(true);
        setDuration(howl.duration() * 1000);
        onload?.(howl);
      },
      onloaderror(_id, err) {
        setIsLoading(false);
        console.error(`[useSound] Failed to load "${url}":`, err);
      },
      ...howlDelegated,
    };

    howlRef.current = new Howl(howlOptions);

    return () => {
      howlRef.current?.unload();
    };
  }, [howlDelegated, onload, playbackRate, sprite, url, volume]);

  useEffect(() => {
    howlRef.current?.volume(volume);
  }, [volume]);

  useEffect(() => {
    howlRef.current?.rate(playbackRate);
  }, [playbackRate]);

  const play = useCallback((playOpts: PlayOptions<T> = {}) => {
    const { forceSoundEnabled = false, playbackRate: callPlaybackRate, id } = playOpts;

    const { soundEnabled, interrupt, volume } = optsRef.current;

    if (!forceSoundEnabled && !soundEnabled) return;

    const howl = howlRef.current;
    if (!howl) return;

    if (callPlaybackRate !== undefined) {
      howl.rate(callPlaybackRate);
    }

    if (interrupt) {
      howl.stop();
    }

    if (id) {
      howl.play(id as string);
    } else {
      howl.volume(volume);
      howl.play();
    }
  }, []);

  const stop = useCallback((id?: number) => {
    howlRef.current?.stop(id);
  }, []);

  const pause = useCallback((id?: number) => {
    howlRef.current?.pause(id);
  }, []);

  const controls: SoundControls = {
    stop,
    pause,
    duration,
    // eslint-disable-next-line react-hooks/refs
    sound: howlRef.current,
    isLoading,
    isLoaded,
  };

  return [play, controls];
}

export type LazySoundControls = {
  preload: () => void;
} & SoundControls;

export type UseSoundLazyReturn<T extends SpriteMap | undefined = undefined> = [(options?: PlayOptions<T>) => void, LazySoundControls];

export function useSoundLazy<T extends SpriteMap | undefined = undefined>(
  url: string,
  opts: UseSoundOptions<T> = {},
): UseSoundLazyReturn<T> {
  const [play, controls] = useSound<T>(url, {
    ...opts,
    preload: false,
  } as UseSoundOptions<T>);

  const preload = useCallback(() => {
    controls.sound?.load();
  }, [controls.sound]);

  return [play, { ...controls, preload }];
}
