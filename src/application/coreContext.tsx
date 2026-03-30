import type { ParentProps } from "solid-js";
import type { Core } from "./bootstrap";
import { createContext, useContext } from "solid-js";
import { createCore } from "./bootstrap";

const CoreContext = createContext<Core>();

export const CoreProvider = (props: ParentProps) => {
  const value = createCore();
  return (
    <CoreContext.Provider value={value}>{props.children}</CoreContext.Provider>
  );
};

export const useCore = (): Core => {
  const value = useContext(CoreContext);
  if (value === undefined) {
    throw new Error("useCore must be used within a CoreProvider");
  }
  return value;
};
