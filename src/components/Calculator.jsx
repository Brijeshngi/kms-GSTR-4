import { useState, useEffect, useCallback } from "react";
import { evaluate } from "mathjs";

function Calculator() {
  const [input, setInput] = useState("");

  const handleClick = useCallback(
    (value) => {
      if (value === "=") {
        try {
          const result = evaluate(input);
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
      const key = e?.key || "";
      if (/^[0-9+\-*/.]$/.test(key)) {
        setInput((prev) => prev + key);
      } else if (key === "Enter") {
        handleClick("=");
      } else if (key === "Backspace") {
        setInput((prev) => prev.slice(0, -1));
      } else if (key.toLowerCase?.() === "c") {
        // ✅ safe check
        handleClick("C");
      }
    },
    [handleClick]
  );

  const handleCopy = () => {
    if (input !== "") {
      navigator.clipboard.writeText(input);
      alert("Copied to clipboard!");
    }
  };

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

  const getButtonClass = (btn) => {
    if (btn === "=") return "btn-success";
    if (btn === "C") return "btn-danger";
    if (["+", "-", "*", "/"].includes(btn)) return "btn-warning";
    return "btn-primary";
  };

  return (
    <div>
      <input
        type="text"
        className="form-control mb-3 text-end fs-4 fw-bold"
        value={input}
        readOnly
      />
      <div className="d-grid gap-2">
        {[0, 4, 8, 12].map((start, rowIndex) => (
          <div className="row" key={rowIndex}>
            {buttons.slice(start, start + 4).map((btn) => (
              <div className="col" key={btn}>
                <button
                  className={`btn ${getButtonClass(
                    btn
                  )} w-100 mb-2 fw-semibold`}
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
              className="btn btn-info w-100 mb-2 fw-semibold"
              onClick={handleCopy}
            >
              Copy
            </button>
          </div>
          <div className="col">
            <button
              className="btn btn-dark w-100 mb-2 fw-semibold"
              onClick={() => setInput("")}
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Calculator;
