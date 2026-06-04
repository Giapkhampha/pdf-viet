"use client";

import { useRef } from "react";

/**
 * Canvas vẽ chữ ký bằng chuột hoặc cảm ứng.
 * onSave nhận dataURL PNG để parent nhúng vào PDF.
 */
export default function SignaturePad({ onSave }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches?.[0] || e;
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  };

  const start = (e) => {
    drawing.current = true;
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getPos(e, canvasRef.current);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  const draw = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#f5f5f5"; // light line on dark canvas
    const { x, y } = getPos(e, canvasRef.current);
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  const stop = () => {
    drawing.current = false;
  };
  const clear = () => canvasRef.current.getContext("2d").clearRect(0, 0, 400, 120);
  const save = () => onSave(canvasRef.current.toDataURL("image/png"));

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
      <p className="text-sm font-medium text-neutral-200 mb-2">
        Vẽ chữ ký của bạn (chuột hoặc cảm ứng)
      </p>
      <canvas
        ref={canvasRef}
        width={400}
        height={120}
        className="border border-neutral-800 rounded-lg w-full touch-none bg-neutral-950 cursor-crosshair"
        onMouseDown={start}
        onMouseMove={draw}
        onMouseUp={stop}
        onMouseLeave={stop}
        onTouchStart={start}
        onTouchMove={draw}
        onTouchEnd={stop}
      />
      <div className="flex gap-2 mt-3">
        <button
          type="button"
          onClick={clear}
          className="px-4 py-1.5 rounded-lg border border-neutral-700 text-sm text-neutral-300 hover:border-neutral-500 transition-colors"
        >
          Xoá vẽ lại
        </button>
        <button
          type="button"
          onClick={save}
          className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-sm font-semibold transition-colors"
        >
          Dùng chữ ký này
        </button>
      </div>
    </div>
  );
}
