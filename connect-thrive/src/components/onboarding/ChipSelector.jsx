import React from "react";
import styles from "./ChipSelector.module.css";

/**
 * @param {string[]}  options       - All available options
 * @param {string[]}  selected      - Currently selected values
 * @param {function}  onToggle      - (value) => void
 * @param {number}    max           - Max selections allowed
 * @param {string}    accentClass   - CSS module class for selected colour
 */
export default function ChipSelector({
  options = [],
  selected = [],
  onToggle,
  max = 99,
  accentClass = "accentCyan",
}) {
  return (
    <div className={styles.chips}>
      {options.map((opt) => {
        const isSelected = selected.includes(opt);
        const isDisabled = !isSelected && selected.length >= max;
        return (
          <button
            key={opt}
            type="button"
            disabled={isDisabled}
            onClick={() => onToggle(opt)}
            className={[
              styles.chip,
              isSelected ? styles[accentClass] : "",
              isDisabled ? styles.disabled : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}