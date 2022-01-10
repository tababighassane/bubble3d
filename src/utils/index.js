import CannonDebugRenderer from "./CannonDebugRenderer";

export { CannonDebugRenderer };

export const clamp = (val, min = 0, max = 1) =>
  Math.max(min, Math.min(max, val));

export const map = (value, min1, max1, min2, max2) =>
  min2 + ((max2 - min2) * (value - min1)) / (max1 - min1);

export const ev = (eventName, data, once = false) => {
  const e = new CustomEvent(eventName, { detail: data }, { once });
  document.dispatchEvent(e);
};
