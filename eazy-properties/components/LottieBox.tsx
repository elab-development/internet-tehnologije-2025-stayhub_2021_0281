"use client";

import Lottie from "lottie-react";

type LottieBoxProps = {
  animationData: object;
  small?: boolean;
};

export default function LottieBox({ animationData, small = false }: LottieBoxProps) {
  // Ova komponenta prikazuje Lottie animaciju.
  return (
    <Lottie
      animationData={animationData}
      loop
      className={small ? "lottie-small" : "lottie-box"}
    />
  );
}