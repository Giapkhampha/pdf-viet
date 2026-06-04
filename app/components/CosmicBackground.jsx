/**
 * Nền vũ trụ: gradient nebula + dots sao + 2 nebula clouds bay nhẹ.
 * Component decorative, đặt `absolute inset-0` trong parent relative.
 */
export default function CosmicBackground({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {/* Gradient nền tổng */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-[#0b0420] to-neutral-950" />

      {/* Nebula tím lớn trái */}
      <div
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full opacity-25 blur-3xl animate-drift-x"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.6) 0%, rgba(139,92,246,0) 70%)",
        }}
      />
      {/* Nebula hồng lớn phải */}
      <div
        className="absolute -bottom-32 -right-32 w-[700px] h-[700px] rounded-full opacity-25 blur-3xl animate-drift-x"
        style={{
          background:
            "radial-gradient(circle, rgba(236,72,153,0.5) 0%, rgba(236,72,153,0) 70%)",
          animationDelay: "2s",
        }}
      />
      {/* Nebula xanh giữa */}
      <div
        className="absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(99,102,241,0.5) 0%, rgba(99,102,241,0) 70%)",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Sao tĩnh - layer 1 */}
      <div className="absolute inset-0 cosmic-stars opacity-60" />
      {/* Sao layer 2 - offset để mật độ dày hơn */}
      <div
        className="absolute inset-0 cosmic-stars opacity-40"
        style={{ backgroundPosition: "50px 80px" }}
      />

      {/* Vài ngôi sao "twinkle" nhấp nháy */}
      <span className="absolute top-[12%] left-[18%] w-1 h-1 rounded-full bg-white animate-twinkle" />
      <span
        className="absolute top-[22%] right-[14%] w-1.5 h-1.5 rounded-full bg-white animate-twinkle"
        style={{ animationDelay: "0.7s" }}
      />
      <span
        className="absolute bottom-[28%] left-[8%] w-1 h-1 rounded-full bg-amber-200 animate-twinkle"
        style={{ animationDelay: "1.2s" }}
      />
      <span
        className="absolute bottom-[18%] right-[22%] w-1 h-1 rounded-full bg-emerald-200 animate-twinkle"
        style={{ animationDelay: "0.3s" }}
      />
      <span
        className="absolute top-[45%] left-[42%] w-1.5 h-1.5 rounded-full bg-violet-200 animate-twinkle"
        style={{ animationDelay: "1.8s" }}
      />
    </div>
  );
}
