"use client";

import { useRef } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";

export function ScrollImpactSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (containerRef.current) {
      containerRef.current.style.setProperty('--p', latest.toFixed(4));
    }
  });

  return (
    <section ref={containerRef} suppressHydrationWarning className="reveal-panel" style={{ '--p': 0 } as any}>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap');

        .reveal-panel {
          --mud-950:#221c13;
          --mud-800:#3c3220;
          --mud-600:#6b5a3e;
          --mud-400:#93815c;
          --clean-50:#f4f9ef;
          --clean-100:#e6f3df;
          --civic-blue:#2f9e5e;
          --civic-teal:#1f7a4d;
          --leaf-bright:#8fd35c;
          --leaf-deep:#1b4d3e;
          --ink:#16202b;
          
          position:relative;
          height:280vh;
          font-family: 'Inter', sans-serif;
          background: var(--clean-50);
        }

        .reveal-sticky {
          position:sticky;
          top:0;
          height:100vh;
          overflow:hidden;
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          padding:0 6vw;
          text-align:center;
          background:
            radial-gradient(120% 140% at 20% 15%,
              color-mix(in srgb, var(--mud-800) calc((1 - var(--p)) * 100%), var(--civic-blue) calc(var(--p) * 100%)) 0%,
              color-mix(in srgb, var(--mud-950) calc((1 - var(--p)) * 100%), var(--clean-50) calc(var(--p) * 100%)) 70%);
        }

        .grain-overlay{
          position:absolute;
          inset:0;
          pointer-events:none;
          opacity:calc(0.35 * (1 - var(--p)));
          mix-blend-mode:overlay;
          background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
          background-size:180px 180px;
        }

        .drip-overlay{
          position:absolute;
          inset:0;
          pointer-events:none;
          opacity:calc(0.5 * (1 - var(--p)));
          background:repeating-linear-gradient(
            100deg,
            transparent 0px,
            transparent 60px,
            rgba(255,255,255,0.05) 61px,
            transparent 64px
          );
        }

        .canopy-overlay{
          position:absolute;
          inset:0;
          pointer-events:none;
          opacity:calc(var(--p) * 0.55);
          background:
            radial-gradient(60px 60px at 12% 20%, rgba(143,211,92,.35), transparent 70%),
            radial-gradient(90px 90px at 85% 15%, rgba(31,122,77,.30), transparent 70%),
            radial-gradient(70px 70px at 25% 85%, rgba(143,211,92,.28), transparent 70%),
            radial-gradient(100px 100px at 78% 80%, rgba(27,77,62,.30), transparent 70%);
          mix-blend-mode:multiply;
        }

        .leaf-accent{
          position:absolute;
          z-index:2;
          pointer-events:none;
          opacity: calc(max(0, (var(--p) - 0.75)) * 4);
          transform: scale(calc(0.6 + var(--p) * 0.4));
        }
        .leaf-accent svg{ display:block; }
        .leaf-accent.tl{ top:12%; left:8%; }
        .leaf-accent.br{ bottom:14%; right:9%; transform-origin:center; }

        .eyebrow{
          position:relative;
          z-index:2;
          font-family:'Inter',sans-serif;
          font-size:12px;
          font-weight:600;
          letter-spacing:.22em;
          text-transform:uppercase;
          margin-bottom:28px;
          color: color-mix(in srgb, var(--mud-400) calc((1 - var(--p)) * 100%), var(--civic-teal) calc(var(--p) * 100%));
        }

        .text-stack{
          position:relative;
          z-index:2;
          max-width:920px;
        }

        .text-stack p{
          margin:0;
          font-family: 'Fraunces', 'Georgia', serif;
          font-weight:500;
          font-size:clamp(28px, 5vw, 58px);
          line-height:1.18;
          letter-spacing:-0.01em;
        }

        .clean-text,
        .dirty-text{
          position:relative;
        }
        
        .dirty-text{
          position:absolute;
          inset:0;
          color:var(--mud-400);
          text-shadow:
            1px 1px 0 rgba(0,0,0,.25),
            -1px 0 0 rgba(255,255,255,.06);
          filter: blur(calc(var(--p) * 2px)) saturate(calc(1 - var(--p) * 0.4));
          clip-path: inset(0 0 0 calc(var(--p) * 100%));
          -webkit-clip-path: inset(0 0 0 calc(var(--p) * 100%));
        }
        
        .clean-text{
          background-image: linear-gradient(115deg,
            var(--leaf-deep) 0%,
            var(--civic-teal) 35%,
            var(--leaf-bright) 60%,
            var(--civic-teal) 100%);
          background-size:220% 100%;
          background-position: calc((1 - var(--p)) * 100%) 0;
          -webkit-background-clip:text;
          background-clip:text;
          color:transparent;
          filter: drop-shadow(0 1px 0 rgba(0,0,0,.04));
          clip-path: inset(0 calc((1 - var(--p)) * 100%) 0 0);
          -webkit-clip-path: inset(0 calc((1 - var(--p)) * 100%) 0 0);
        }

        .wipe-line{
          position:absolute;
          top:50%;
          left:calc(var(--p) * 100%);
          transform:translate(-50%,-50%);
          width:2px;
          height:140px;
          background:rgba(255,255,255,.55);
          z-index:3;
          box-shadow:0 0 12px rgba(0,0,0,.15);
        }
        .wipe-handle{
          position:absolute;
          top:50%;
          left:calc(var(--p) * 100%);
          transform:translate(-50%,-50%);
          width:34px;
          height:34px;
          border-radius:50%;
          background:#fff;
          z-index:4;
          display:flex;
          align-items:center;
          justify-content:center;
          box-shadow:0 4px 14px rgba(0,0,0,.18);
        }
        .wipe-handle::before,
        .wipe-handle::after{
          content:'';
          display:block;
          width:2px;
          height:12px;
          background: color-mix(in srgb, var(--mud-600) calc((1 - var(--p)) * 100%), var(--civic-blue) calc(var(--p) * 100%));
          margin:0 2px;
          border-radius:1px;
        }

        .sub{
          position:relative;
          z-index:2;
          margin-top:36px;
          font-family:'Inter',sans-serif;
          font-size:15px;
          font-weight:500;
          color: color-mix(in srgb, var(--mud-400) calc((1 - var(--p)) * 100%), var(--civic-blue) calc(var(--p) * 100%));
          opacity: calc(0.4 + var(--p) * 0.6);
        }

        @media (prefers-reduced-motion: reduce){
          .reveal-panel{height:100vh;}
          .reveal-sticky{position:relative;}
          .dirty-text{display:none;}
          .clean-text{clip-path:none;-webkit-clip-path:none;color:var(--ink);}
          .wipe-line,.wipe-handle{display:none;}
          .reveal-sticky{background:linear-gradient(160deg, var(--leaf-deep), var(--clean-50));}
          .clean-text{color:var(--civic-teal); background:none; -webkit-text-fill-color:initial;}
        }
        @media (max-width:640px){
          .text-stack p{font-size:26px;}
          .wipe-handle{width:26px;height:26px;}
        }
      `}} />

      <div className="reveal-sticky">
        <div className="grain-overlay"></div>
        <div className="drip-overlay"></div>
        <div className="canopy-overlay"></div>
        <div className="leaf-accent tl">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
            <path d="M12 21C7 18 4 13.5 4 9.2 4 5.8 7.2 3 11 3c1.6 4.6 5 7.7 5 12 0 3.3-1.8 5.2-4 6z"
                  fill="#1f7a4d" opacity="0.85"/>
            <path d="M12 21V7" stroke="#f4f9ef" strokeWidth="1" opacity="0.5"/>
          </svg>
        </div>
        <div className="leaf-accent br">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M12 21C7 18 4 13.5 4 9.2 4 5.8 7.2 3 11 3c1.6 4.6 5 7.7 5 12 0 3.3-1.8 5.2-4 6z"
                  fill="#8fd35c" opacity="0.85"/>
            <path d="M12 21V7" stroke="#1b4d3e" strokeWidth="1" opacity="0.5"/>
          </svg>
        </div>
        <span className="eyebrow">Civic Intelligence Platform</span>
        <div className="text-stack">
          <p className="clean-text">Every clean street, safe road, and thriving community starts with civic responsibility.</p>
          <p className="dirty-text" aria-hidden="true">Every clean street, safe road, and thriving community starts with civic responsibility.</p>
        </div>
        <div className="wipe-line"></div>
        <div className="wipe-handle"></div>
        <p className="sub">JanVoice AI — turning citizen reports into civic action.</p>
      </div>
    </section>
  );
}
