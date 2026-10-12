import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Calculator, ChevronRight, ChevronLeft, X, Copy, Check, RotateCcw } from 'lucide-react';
import { ToastType } from '../types';

interface FloatingCalculatorProps {
  showToast?: (text: string, type: ToastType) => void;
  isHackerTheme?: boolean;
}

export const FloatingCalculator: React.FC<FloatingCalculatorProps> = ({
  showToast,
  isHackerTheme = false,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [display, setDisplay] = useState<string>('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState<boolean>(false);
  const [historyText, setHistoryText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [activeButtonId, setActiveButtonId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Flash button briefly for tactile feedback on keyboard/numpad presses
  const flashButton = useCallback((id: string) => {
    setActiveButtonId(id);
    setTimeout(() => {
      setActiveButtonId((curr) => (curr === id ? null : curr));
    }, 140);
  }, []);

  // Precision helper to avoid IEEE floating point errors like 0.1 + 0.2 = 0.30000000000000004
  const roundAccurately = (num: number, decimalPlaces = 10): number => {
    return parseFloat(num.toFixed(decimalPlaces));
  };

  const handleDigit = useCallback(
    (digit: string) => {
      if (waitingForNewValue) {
        setDisplay(digit);
        setWaitingForNewValue(false);
      } else {
        if (display === '0' && digit !== '0') {
          setDisplay(digit);
        } else if (display !== '0') {
          if (display.replace(/[^0-9]/g, '').length < 14) {
            setDisplay((prev) => prev + digit);
          }
        }
      }
    },
    [display, waitingForNewValue]
  );

  const handleDecimal = useCallback(() => {
    if (waitingForNewValue) {
      setDisplay('0.');
      setWaitingForNewValue(false);
    } else if (!display.includes('.')) {
      setDisplay((prev) => prev + '.');
    }
  }, [display, waitingForNewValue]);

  const handleClear = useCallback(() => {
    setDisplay('0');
    setPrevValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
    setHistoryText('');
  }, []);

  const handleBackspace = useCallback(() => {
    if (waitingForNewValue) return;
    if (display === 'Error') {
      setDisplay('0');
      return;
    }
    if (display.length > 1) {
      const next = display.slice(0, -1);
      setDisplay(next === '-' || next === '' ? '0' : next);
    } else {
      setDisplay('0');
    }
  }, [display, waitingForNewValue]);

  const handleToggleSign = useCallback(() => {
    if (display === '0' || display === 'Error') return;
    setDisplay((prev) => (prev.startsWith('-') ? prev.slice(1) : '-' + prev));
  }, [display]);

  const handlePercentage = useCallback(() => {
    if (display === 'Error') return;
    const current = parseFloat(display);
    if (!isNaN(current)) {
      const result = roundAccurately(current / 100);
      setDisplay(result.toString());
    }
  }, [display]);

  const calculate = (a: number, b: number, op: string): number | 'Error' => {
    switch (op) {
      case '+':
        return roundAccurately(a + b);
      case '−':
      case '-':
        return roundAccurately(a - b);
      case '×':
      case '*':
        return roundAccurately(a * b);
      case '÷':
      case '/':
        if (b === 0) return 'Error';
        return roundAccurately(a / b);
      default:
        return b;
    }
  };

  const handleOperation = useCallback(
    (nextOp: string) => {
      if (display === 'Error') return;
      const inputValue = parseFloat(display);

      if (prevValue === null) {
        setPrevValue(inputValue);
        setHistoryText(`${inputValue} ${nextOp}`);
      } else if (operation) {
        if (waitingForNewValue) {
          // Just update operation
          setOperation(nextOp);
          setHistoryText(`${prevValue} ${nextOp}`);
          return;
        }
        const result = calculate(prevValue, inputValue, operation);
        if (result === 'Error') {
          setDisplay('Error');
          setPrevValue(null);
          setOperation(null);
          setHistoryText('');
          setWaitingForNewValue(true);
          return;
        }
        setPrevValue(result);
        setDisplay(result.toString());
        setHistoryText(`${result} ${nextOp}`);
      }

      setWaitingForNewValue(true);
      setOperation(nextOp);
    },
    [display, prevValue, operation, waitingForNewValue]
  );

  const handleEquals = useCallback(() => {
    if (display === 'Error') return;
    if (operation === null || prevValue === null) return;

    const inputValue = parseFloat(display);
    const result = calculate(prevValue, inputValue, operation);

    if (result === 'Error') {
      setDisplay('Error');
      setHistoryText('');
    } else {
      setHistoryText(`${prevValue} ${operation} ${inputValue} =`);
      setDisplay(result.toString());
    }

    setPrevValue(null);
    setOperation(null);
    setWaitingForNewValue(true);
  }, [display, operation, prevValue]);

  const handleCopy = async () => {
    if (display === 'Error') return;
    try {
      await navigator.clipboard.writeText(display);
      setCopied(true);
      if (showToast) {
        showToast(`Copied ${display} to clipboard!`, 'success');
      }
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  // Keyboard and Numpad Listener
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      // Ignore keystrokes when user is typing inside an input, textarea, or contentEditable
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      const code = e.code;
      const key = e.key;

      // Numpad 0..9 and standard top row 0..9
      if (code === 'Numpad0' || (!e.shiftKey && key === '0')) {
        e.preventDefault();
        flashButton('btn-0');
        handleDigit('0');
      } else if (code === 'Numpad1' || (!e.shiftKey && key === '1')) {
        e.preventDefault();
        flashButton('btn-1');
        handleDigit('1');
      } else if (code === 'Numpad2' || (!e.shiftKey && key === '2')) {
        e.preventDefault();
        flashButton('btn-2');
        handleDigit('2');
      } else if (code === 'Numpad3' || (!e.shiftKey && key === '3')) {
        e.preventDefault();
        flashButton('btn-3');
        handleDigit('3');
      } else if (code === 'Numpad4' || (!e.shiftKey && key === '4')) {
        e.preventDefault();
        flashButton('btn-4');
        handleDigit('4');
      } else if (code === 'Numpad5' || (!e.shiftKey && key === '5')) {
        e.preventDefault();
        flashButton('btn-5');
        handleDigit('5');
      } else if (code === 'Numpad6' || (!e.shiftKey && key === '6')) {
        e.preventDefault();
        flashButton('btn-6');
        handleDigit('6');
      } else if (code === 'Numpad7' || (!e.shiftKey && key === '7')) {
        e.preventDefault();
        flashButton('btn-7');
        handleDigit('7');
      } else if (code === 'Numpad8' || (!e.shiftKey && key === '8')) {
        e.preventDefault();
        flashButton('btn-8');
        handleDigit('8');
      } else if (code === 'Numpad9' || (!e.shiftKey && key === '9')) {
        e.preventDefault();
        flashButton('btn-9');
        handleDigit('9');
      }
      // Decimal point: NumpadDecimal or '.' or ','
      else if (code === 'NumpadDecimal' || key === '.' || key === ',') {
        e.preventDefault();
        flashButton('btn-dot');
        handleDecimal();
      }
      // Numpad & Keyboard Addition
      else if (code === 'NumpadAdd' || key === '+') {
        e.preventDefault();
        flashButton('btn-add');
        handleOperation('+');
      }
      // Numpad & Keyboard Subtraction
      else if (code === 'NumpadSubtract' || key === '-' || key === '−') {
        e.preventDefault();
        flashButton('btn-sub');
        handleOperation('−');
      }
      // Numpad & Keyboard Multiplication
      else if (code === 'NumpadMultiply' || key === '*' || key.toLowerCase() === 'x') {
        e.preventDefault();
        flashButton('btn-mul');
        handleOperation('×');
      }
      // Numpad & Keyboard Division
      else if (code === 'NumpadDivide' || key === '/') {
        e.preventDefault();
        flashButton('btn-div');
        handleOperation('÷');
      }
      // Equals: NumpadEnter, Enter, '='
      else if (code === 'NumpadEnter' || key === 'Enter' || key === '=') {
        e.preventDefault();
        flashButton('btn-eq');
        handleEquals();
      }
      // Backspace / Delete
      else if (key === 'Backspace' || key === 'Delete' || code === 'NumpadBackspace') {
        e.preventDefault();
        flashButton('btn-bksp');
        handleBackspace();
      }
      // Clear: 'c', 'C', or NumpadClear
      else if (key.toLowerCase() === 'c' || code === 'NumpadClear' || key === 'Clear') {
        e.preventDefault();
        flashButton('btn-clear');
        handleClear();
      }
      // Percentage
      else if (key === '%') {
        e.preventDefault();
        flashButton('btn-pct');
        handlePercentage();
      }
      // Escape -> fold/hide calculator
      else if (key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    isOpen,
    flashButton,
    handleDigit,
    handleDecimal,
    handleOperation,
    handleEquals,
    handleBackspace,
    handleClear,
    handlePercentage,
  ]);

  // Click outside to close optionally when open
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    // Delay slightly to prevent the toggle click itself from closing immediately
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleOutsideClick);
    }, 120);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Focus container on open for smooth accessibility
  useEffect(() => {
    if (isOpen && containerRef.current) {
      containerRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      id="folding-calc-container"
      tabIndex={-1}
      className={`fixed left-0 top-[35%] -translate-y-1/2 z-50 select-none outline-none ${
        isOpen ? 'is-open' : 'is-closed'
      }`}
      aria-label="Folding Basic Calculator"
    >
      {/* Prominent, Larger Folding Tab Handle anchored flush to the screen/panel edge */}
      <button
        type="button"
        id="folding-calc-tab-btn"
        className="folding-calc-tab absolute left-full top-1/2 -translate-y-1/2 flex items-center gap-2 px-4 py-3.5 sm:px-5 sm:py-4 bg-[#23262d] hover:bg-[#2d323d] text-neutral-200 hover:text-white border border-l-0 border-neutral-600 rounded-r-2xl shadow-2xl transition-all cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        onClick={() => setIsOpen((prev) => !prev)}
        title={isOpen ? 'Hide / Fold Calculator (Esc)' : 'Open Calculator (Click to unfold)'}
        aria-expanded={isOpen}
      >
        <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 group-hover:bg-blue-500/30 flex items-center justify-center transition-colors">
          <Calculator className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
        </div>
        <span className="text-sm font-bold tracking-wider uppercase font-mono pr-0.5">
          {isOpen ? 'Fold' : 'Calc'}
        </span>
        {isOpen ? (
          <ChevronLeft className="w-5 h-5 text-neutral-400 group-hover:-translate-x-0.5 transition-transform ml-0.5" />
        ) : (
          <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:translate-x-0.5 transition-transform ml-0.5" />
        )}
      </button>

      {/* Main Calculator Body with 3D Door / Origami Folding Animation */}
      <div className="folding-calc-panel w-[300px] sm:w-[320px] bg-[#1a1c22] border border-l-0 border-neutral-700 rounded-r-2xl shadow-2xl p-4 flex flex-col gap-3 backdrop-blur-md">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Calculator className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-neutral-200 tracking-wide">
              {isHackerTheme ? 'CALC_EXE v1.0' : 'Basic Calculator'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              title="Reset Calculator (C)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition-colors"
              title="Fold & Hide (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Digital Display */}
        <div className="calc-display relative flex flex-col justify-end p-3 bg-[#0d0f12] rounded-xl border border-neutral-800 min-h-[76px] overflow-hidden">
          {/* Expression / Operation History */}
          <div className="text-right text-[11px] font-mono text-neutral-400 tracking-wide h-4 truncate">
            {historyText || '\u00A0'}
          </div>

          {/* Current Input / Result */}
          <div className="flex items-baseline justify-between gap-2 mt-1">
            <button
              type="button"
              onClick={handleCopy}
              className="p-1 rounded text-neutral-500 hover:text-white hover:bg-neutral-800/80 transition-all opacity-70 hover:opacity-100 flex items-center gap-1 text-[10px]"
              title="Copy result to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400 font-sans">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span className="font-sans">Copy</span>
                </>
              )}
            </button>

            <div
              className={`font-mono text-right font-bold tracking-tight text-white select-text truncate ${
                display.length > 10 ? 'text-xl' : 'text-2xl'
              }`}
            >
              {display}
            </div>
          </div>
        </div>

        {/* Keypad Grid with responsive flash states */}
        <div className="grid grid-cols-4 gap-2">
          {/* Row 1 */}
          <button
            type="button"
            id="btn-clear"
            onClick={handleClear}
            className={`calc-btn p-2.5 rounded-lg bg-[#272a33] hover:bg-[#343844] active:scale-95 text-rose-400 font-bold text-sm transition-all shadow-sm ${
              activeButtonId === 'btn-clear' ? 'calc-btn-flash' : ''
            }`}
          >
            {display !== '0' || prevValue !== null ? 'C' : 'AC'}
          </button>
          <button
            type="button"
            id="btn-sign"
            onClick={handleToggleSign}
            className={`calc-btn p-2.5 rounded-lg bg-[#272a33] hover:bg-[#343844] active:scale-95 text-neutral-200 font-medium text-sm transition-all shadow-sm ${
              activeButtonId === 'btn-sign' ? 'calc-btn-flash' : ''
            }`}
          >
            ±
          </button>
          <button
            type="button"
            id="btn-pct"
            onClick={handlePercentage}
            className={`calc-btn p-2.5 rounded-lg bg-[#272a33] hover:bg-[#343844] active:scale-95 text-neutral-200 font-medium text-sm transition-all shadow-sm ${
              activeButtonId === 'btn-pct' ? 'calc-btn-flash' : ''
            }`}
          >
            %
          </button>
          <button
            type="button"
            id="btn-div"
            onClick={() => handleOperation('÷')}
            className={`calc-btn calc-btn-op p-2.5 rounded-lg font-bold text-base transition-all shadow-sm active:scale-95 ${
              activeButtonId === 'btn-div' ? 'calc-btn-flash' : ''
            } ${
              operation === '÷' && waitingForNewValue
                ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400'
            }`}
          >
            ÷
          </button>

          {/* Row 2 */}
          <button
            type="button"
            id="btn-7"
            onClick={() => handleDigit('7')}
            className={`calc-btn p-2.5 rounded-lg bg-[#22252d] hover:bg-[#2e323d] active:scale-95 text-white font-semibold text-base transition-all shadow-sm ${
              activeButtonId === 'btn-7' ? 'calc-btn-flash' : ''
            }`}
          >
            7
          </button>
          <button
            type="button"
            id="btn-8"
            onClick={() => handleDigit('8')}
            className={`calc-btn p-2.5 rounded-lg bg-[#22252d] hover:bg-[#2e323d] active:scale-95 text-white font-semibold text-base transition-all shadow-sm ${
              activeButtonId === 'btn-8' ? 'calc-btn-flash' : ''
            }`}
          >
            8
          </button>
          <button
            type="button"
            id="btn-9"
            onClick={() => handleDigit('9')}
            className={`calc-btn p-2.5 rounded-lg bg-[#22252d] hover:bg-[#2e323d] active:scale-95 text-white font-semibold text-base transition-all shadow-sm ${
              activeButtonId === 'btn-9' ? 'calc-btn-flash' : ''
            }`}
          >
            9
          </button>
          <button
            type="button"
            id="btn-mul"
            onClick={() => handleOperation('×')}
            className={`calc-btn calc-btn-op p-2.5 rounded-lg font-bold text-base transition-all shadow-sm active:scale-95 ${
              activeButtonId === 'btn-mul' ? 'calc-btn-flash' : ''
            } ${
              operation === '×' && waitingForNewValue
                ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400'
            }`}
          >
            ×
          </button>

          {/* Row 3 */}
          <button
            type="button"
            id="btn-4"
            onClick={() => handleDigit('4')}
            className={`calc-btn p-2.5 rounded-lg bg-[#22252d] hover:bg-[#2e323d] active:scale-95 text-white font-semibold text-base transition-all shadow-sm ${
              activeButtonId === 'btn-4' ? 'calc-btn-flash' : ''
            }`}
          >
            4
          </button>
          <button
            type="button"
            id="btn-5"
            onClick={() => handleDigit('5')}
            className={`calc-btn p-2.5 rounded-lg bg-[#22252d] hover:bg-[#2e323d] active:scale-95 text-white font-semibold text-base transition-all shadow-sm ${
              activeButtonId === 'btn-5' ? 'calc-btn-flash' : ''
            }`}
          >
            5
          </button>
          <button
            type="button"
            id="btn-6"
            onClick={() => handleDigit('6')}
            className={`calc-btn p-2.5 rounded-lg bg-[#22252d] hover:bg-[#2e323d] active:scale-95 text-white font-semibold text-base transition-all shadow-sm ${
              activeButtonId === 'btn-6' ? 'calc-btn-flash' : ''
            }`}
          >
            6
          </button>
          <button
            type="button"
            id="btn-sub"
            onClick={() => handleOperation('−')}
            className={`calc-btn calc-btn-op p-2.5 rounded-lg font-bold text-base transition-all shadow-sm active:scale-95 ${
              activeButtonId === 'btn-sub' ? 'calc-btn-flash' : ''
            } ${
              operation === '−' && waitingForNewValue
                ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400'
            }`}
          >
            −
          </button>

          {/* Row 4 */}
          <button
            type="button"
            id="btn-1"
            onClick={() => handleDigit('1')}
            className={`calc-btn p-2.5 rounded-lg bg-[#22252d] hover:bg-[#2e323d] active:scale-95 text-white font-semibold text-base transition-all shadow-sm ${
              activeButtonId === 'btn-1' ? 'calc-btn-flash' : ''
            }`}
          >
            1
          </button>
          <button
            type="button"
            id="btn-2"
            onClick={() => handleDigit('2')}
            className={`calc-btn p-2.5 rounded-lg bg-[#22252d] hover:bg-[#2e323d] active:scale-95 text-white font-semibold text-base transition-all shadow-sm ${
              activeButtonId === 'btn-2' ? 'calc-btn-flash' : ''
            }`}
          >
            2
          </button>
          <button
            type="button"
            id="btn-3"
            onClick={() => handleDigit('3')}
            className={`calc-btn p-2.5 rounded-lg bg-[#22252d] hover:bg-[#2e323d] active:scale-95 text-white font-semibold text-base transition-all shadow-sm ${
              activeButtonId === 'btn-3' ? 'calc-btn-flash' : ''
            }`}
          >
            3
          </button>
          <button
            type="button"
            id="btn-add"
            onClick={() => handleOperation('+')}
            className={`calc-btn calc-btn-op p-2.5 rounded-lg font-bold text-base transition-all shadow-sm active:scale-95 ${
              activeButtonId === 'btn-add' ? 'calc-btn-flash' : ''
            } ${
              operation === '+' && waitingForNewValue
                ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400'
            }`}
          >
            +
          </button>

          {/* Row 5 */}
          <button
            type="button"
            id="btn-0"
            onClick={() => handleDigit('0')}
            className={`calc-btn p-2.5 rounded-lg bg-[#22252d] hover:bg-[#2e323d] active:scale-95 text-white font-semibold text-base transition-all shadow-sm ${
              activeButtonId === 'btn-0' ? 'calc-btn-flash' : ''
            }`}
          >
            0
          </button>
          <button
            type="button"
            id="btn-dot"
            onClick={handleDecimal}
            className={`calc-btn p-2.5 rounded-lg bg-[#22252d] hover:bg-[#2e323d] active:scale-95 text-white font-semibold text-base transition-all shadow-sm ${
              activeButtonId === 'btn-dot' ? 'calc-btn-flash' : ''
            }`}
          >
            .
          </button>
          <button
            type="button"
            id="btn-bksp"
            onClick={handleBackspace}
            className={`calc-btn p-2.5 rounded-lg bg-[#272a33] hover:bg-[#343844] active:scale-95 text-neutral-300 font-medium text-sm transition-all shadow-sm flex items-center justify-center ${
              activeButtonId === 'btn-bksp' ? 'calc-btn-flash' : ''
            }`}
            title="Backspace (⌫)"
          >
            ⌫
          </button>
          <button
            type="button"
            id="btn-eq"
            onClick={handleEquals}
            className={`calc-btn calc-btn-equals p-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-lg transition-all shadow-md shadow-emerald-900/30 ${
              activeButtonId === 'btn-eq' ? 'calc-btn-flash ring-2 ring-emerald-300' : ''
            }`}
          >
            =
          </button>
        </div>

        {/* Footer tip */}
        <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1.5 border-t border-neutral-800/80 px-1 font-mono">
          <span>Standard Calculator</span>
          <span>Esc to fold</span>
        </div>
      </div>
    </div>
  );
};
