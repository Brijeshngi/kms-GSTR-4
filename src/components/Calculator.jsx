import { useState, useEffect, useCallback } from "react";
import { evaluate } from "mathjs"; // ✅ Safe alternative to eval

function Calculator() {
  const [input, setInput] = useState("");

  const handleClick = useCallback(
    (value) => {
      if (value === "=") {
        try {
          const result = evaluate(input); // ✅ Safe evaluation
          setInput(result.toString());
        } catch {
          setInput("Error");
        }
      } else if (value === "C") {
        setInput("");
      } else {
        setInput((prev) => prev + value);
      }
    },
    [input]
  );

  const handleKeyPress = useCallback(
    (e) => {
      const key = e.key;
      if (/^[0-9+\-*/.]$/.test(key)) {
        setInput((prev) => prev + key);
      } else if (key === "Enter") {
        handleClick("=");
      } else if (key === "Backspace") {
        setInput((prev) => prev.slice(0, -1));
      } else if (key.toLowerCase() === "c") {
        handleClick("C");
      }
    },
    [handleClick]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  const buttons = [
    "7",
    "8",
    "9",
    "/",
    "4",
    "5",
    "6",
    "*",
    "1",
    "2",
    "3",
    "-",
    "0",
    ".",
    "=",
    "+",
    "C",
  ];

  return (
    <div>
      <input type="text" className="form-control mb-2" value={input} readOnly />
      <div className="d-grid gap-2">
        {[0, 4, 8, 12].map((start, rowIndex) => (
          <div className="row" key={rowIndex}>
            {buttons.slice(start, start + 4).map((btn) => (
              <div className="col" key={btn}>
                <button
                  className="btn btn-outline-primary w-100 mb-2"
                  onClick={() => handleClick(btn)}
                >
                  {btn}
                </button>
              </div>
            ))}
          </div>
        ))}
        <div className="row">
          <div className="col">
            <button
              className="btn btn-danger w-100"
              onClick={() => handleClick("C")}
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Calculator;
