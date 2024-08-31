export type Speed = "fast" | "medium" | "slow";

const config = {
  speed: "fast" as Speed,
  width: 20,
  height: 14,
};

export const getConfig = () => config;

export const setSpeed = (speed: Speed) => {
  config.speed = speed;
};

export const toggleSpeed = () => {
  const mapping: Record<Speed, Speed> = {
    slow: "medium",
    medium: "fast",
    fast: "slow",
  };
  config.speed = mapping[config.speed];
  return config.speed;
};

export const setWidth = (width: number) => {
  config.width = width;
};

export const setHeight = (height: number) => {
  config.height = height;
};
