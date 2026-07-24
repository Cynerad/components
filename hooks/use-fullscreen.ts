import type { RefCallback } from "react";

import { useCallback, useEffect, useRef, useState } from "react";

type PrefixedDocument = {
  webkitFullscreenElement?: Element | null;
  mozFullScreenElement?: Element | null;
  msFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
  mozCancelFullScreen?: () => Promise<void>;
} & Document;

type PrefixedElement = {
  webkitRequestFullscreen?: () => Promise<void>;
  webkitEnterFullscreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
  mozRequestFullscreen?: () => Promise<void>;
} & HTMLElement;

function getFullscreenElement(): Element | null {
  const doc = document as PrefixedDocument;
  return doc.fullscreenElement ?? doc.webkitFullscreenElement ?? doc.mozFullScreenElement ?? doc.msFullscreenElement ?? null;
}

function exitFullscreen(): Promise<void> {
  const doc = document as PrefixedDocument;

  if (typeof doc.exitFullscreen === "function")
    return doc.exitFullscreen();
  if (typeof doc.msExitFullscreen === "function")
    return doc.msExitFullscreen();
  if (typeof doc.webkitExitFullscreen === "function")
    return doc.webkitExitFullscreen();
  if (typeof doc.mozCancelFullScreen === "function")
    return doc.mozCancelFullScreen();

  return Promise.resolve();
}

function enterFullScreen(element: HTMLElement): Promise<void> {
  const el = element as PrefixedElement;

  const fn
    = el.requestFullscreen ?? el.msRequestFullscreen ?? el.webkitEnterFullscreen ?? el.webkitRequestFullscreen ?? el.mozRequestFullscreen;

  return fn ? fn.call(el) : Promise.resolve();
}

const prefixes = ["", "webkit", "moz", "ms"] as const;

type FullscreenEvents = {
  onFullScreen: (event: Event) => void;
  onError: (event: Event) => void;
};

function addEvents(element: HTMLElement, events: FullscreenEvents) {
  const { onFullScreen, onError } = events;
  prefixes.forEach((prefix) => {
    element.addEventListener(`${prefix}fullscreenchange`, onFullScreen);
    element.addEventListener(`${prefix}fullscreenerror`, onError);
  });

  return () => removeEvents(element, events);
}

function removeEvents(element: HTMLElement, { onFullScreen, onError }: FullscreenEvents) {
  prefixes.forEach((prefix) => {
    element.removeEventListener(`${prefix}fullscreenchange`, onFullScreen);
    element.removeEventListener(`${prefix}fullscreenerror`, onError);
  });
}

// --- Element-scoped fullscreen ---

export type UseFullscreenElementReturnValue<T extends HTMLElement> = {
  ref: RefCallback<T | null>;
  toggle: () => Promise<void>;
  fullscreen: boolean;
};

export function useFullscreenElement<T extends HTMLElement = HTMLDivElement>(): UseFullscreenElementReturnValue<T> {
  const [fullscreen, setFullscreen] = useState(false);
  const elementRef = useRef<T | null>(null);
  const prevNodeRef = useRef<T | null>(null);

  const handleFullscreenChange = useCallback(() => {
    setFullscreen(elementRef.current === getFullscreenElement());
  }, []);

  const handleFullscreenError = useCallback(() => {
    setFullscreen(false);
  }, []);

  const toggle = useCallback(async () => {
    if (!getFullscreenElement() && elementRef.current) {
      await enterFullScreen(elementRef.current);
    }
    else {
      await exitFullscreen();
    }
  }, []);

  const refCallback: RefCallback<T | null> = useCallback((node) => {
    if (prevNodeRef.current && prevNodeRef.current !== node) {
      removeEvents(prevNodeRef.current, {
        onFullScreen: handleFullscreenChange,
        onError: handleFullscreenError,
      });
    }

    if (node) {
      addEvents(node, {
        onFullScreen: handleFullscreenChange,
        onError: handleFullscreenError,
      });
    }

    elementRef.current = node;
    prevNodeRef.current = node;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ref: refCallback, toggle, fullscreen };
}

// --- Document-scoped fullscreen ---

export type UseFullscreenDocumentReturnValue = {
  toggle: () => Promise<void>;
  fullscreen: boolean;
};

export function useFullscreenDocument(): UseFullscreenDocumentReturnValue {
  const [fullscreen, setFullscreen] = useState(false);

  const handleFullscreenChange = useCallback(() => {
    setFullscreen(getFullscreenElement() === document.documentElement);
  }, []);

  const handleFullscreenError = useCallback(() => {
    setFullscreen(false);
  }, []);

  const toggle = useCallback(async () => {
    if (!getFullscreenElement()) {
      await enterFullScreen(document.documentElement);
    }
    else {
      await exitFullscreen();
    }
  }, []);

  useEffect(() => {
    return addEvents(document.documentElement, {
      onFullScreen: handleFullscreenChange,
      onError: handleFullscreenError,
    });
  }, [handleFullscreenChange, handleFullscreenError]);

  return { toggle, fullscreen };
}
