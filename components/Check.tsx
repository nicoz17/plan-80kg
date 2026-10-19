"use client";

import { IcCheck } from "./Icons";

export function Check({
  on,
  onToggle,
  disabled,
  children,
}: {
  on: boolean;
  onToggle: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <li
      className={`check-item ${on ? "on" : ""}`}
      role="checkbox"
      aria-checked={on}
      tabIndex={0}
      onClick={() => !disabled && onToggle()}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      <span className="box" aria-hidden="true">
        {on && <IcCheck className="ic" />}
      </span>
      {children}
    </li>
  );
}
