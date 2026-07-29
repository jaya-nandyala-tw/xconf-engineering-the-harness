import { useEffect, useState } from "react";
import { useSpring, type SpringOptions } from "framer-motion";

const DEFAULT_SPRING: SpringOptions = { stiffness: 90, damping: 20, mass: 0.7 };

export function useSpringNumber(target: number, config: SpringOptions = DEFAULT_SPRING) {
  const spring = useSpring(target, config);
  const [display, setDisplay] = useState(Math.round(target));

  useEffect(() => {
    spring.set(target);
  }, [target, spring]);

  useEffect(() => spring.on("change", (v) => setDisplay(Math.round(v))), [spring]);

  return { spring, display };
}
