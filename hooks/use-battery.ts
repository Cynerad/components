import { useEffect, useState } from "react";

type BatteryManager = {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
  addEventListener: (type: "levelchange" | "chargingchange" | "chargingtimechange" | "dischargingtimechange", listener: () => void) => void;
  removeEventListener: (
    type: "levelchange" | "chargingchange" | "chargingtimechange" | "dischargingtimechange",
    listener: () => void,
  ) => void;
} & EventTarget;

type BatteryState = {
  supported: boolean;
  loading: boolean;
  level: number | null;
  charging: boolean | null;
  chargingTime: number | null;
  dischargingTime: number | null;
};

function useBattery(): BatteryState {
  const [state, setState] = useState<BatteryState>({
    supported: true,
    loading: true,
    level: null,
    charging: null,
    chargingTime: null,
    dischargingTime: null,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const navigatorWithBattery = navigator as Navigator & {
      getBattery?: () => Promise<BatteryManager>;
    };

    if (!navigatorWithBattery.getBattery) {
      queueMicrotask(() => {
        setState((s) => ({
          ...s,
          supported: false,
          loading: false,
        }));
      });
      return;
    }

    let battery: BatteryManager | null = null;

    const updateState = () => {
      if (!battery) return;
      setState({
        supported: true,
        loading: false,
        level: battery.level,
        charging: battery.charging,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime,
      });
    };

    navigatorWithBattery.getBattery().then((b) => {
      battery = b;
      updateState();
      b.addEventListener("levelchange", updateState);
      b.addEventListener("chargingchange", updateState);
      b.addEventListener("chargingtimechange", updateState);
      b.addEventListener("dischargingtimechange", updateState);
    });

    return () => {
      if (!battery) return;
      battery.removeEventListener("levelchange", updateState);
      battery.removeEventListener("chargingchange", updateState);
      battery.removeEventListener("chargingtimechange", updateState);
      battery.removeEventListener("dischargingtimechange", updateState);
    };
  }, []);

  return state;
}

export default useBattery;
