/**
 * BATTLE LEAGUE: 30s vertical promo (1080x1920 @ 30fps = 900 frames)
 *
 * SETUP
 *  1. Put your icon at  public/app_icon.png  (Remotion's staticFile reads from /public).
 *  2. Register in your index.ts:
 *       import {registerRoot} from "remotion";
 *       import {RemotionRoot} from "./BattleLeagueAd";
 *       registerRoot(RemotionRoot);
 *  3. Preview: npx remotion studio   |   Render: npx remotion render BattleLeagueAd out/battle-league.mp4
 *
 * No other assets or packages needed. All UI is inline-styled, so Tailwind is not required.
 * Optional: add Poppins (matches your app) via @remotion/google-fonts/Poppins and put it first in FONT.
 *
 * TIMELINE (frames @30fps)
 *   0-180   Hook    : neon background, icon drops in, PLAY. COMPETE. EARN.
 *   180-450 Feature : icon -> top-left, phone slides up, cursor taps Free Fire -> JOINED
 *   450-720 Reward  : wallet dashboard, counter $0 -> $150, particles, "Instant Cash Rewards"
 *   720-900 Outro   : phone scales down, Play Store badge, "Download Battle League"
 */

import React from "react";
import {
  AbsoluteFill,
  Composition,
  Easing,
  Img,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

/* ------------------------------------------------------------------ */
/* THEME: pulled from the app icon (orange / blue / black) and the     */
/* home screen (navy surfaces, blue-to-violet balance card, amber pill) */
/* ------------------------------------------------------------------ */
const C = {
  bg: "#070A18",
  surface: "#0B1020",
  card: "#151B35",
  border: "#232B4D",
  muted: "#8B93B8",
  white: "#FFFFFF",
  blue: "#5B7CFA",
  violet: "#8B5CF6",
  amber: "#FFB020",
  orange: "#FF8A1F",
  iconOrange: "#E8651A",
  iconBlue: "#3B82F6",
  green: "#3DFFA2",
};

const FONT = `'Poppins', 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif`;
const APP_NAME = "Battle League";
const PLAYER = "Bijay";
const PACKAGE = "co.median.android.odrxkjp";
const ICON_SRC = staticFile("app_icon.png");

// Phase boundaries (frames)
const T_FEATURE = 180;
const T_REWARD = 450;
const T_OUTRO = 720;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/* ------------------------------------------------------------------ */
/* BACKGROUND                                                          */
/* ------------------------------------------------------------------ */
const Background: React.FC<{ frame: number }> = ({ frame }) => {
  const pulse = 0.5 + 0.5 * Math.sin(frame / 14);
  const pulse2 = 0.5 + 0.5 * Math.sin(frame / 19 + 2);
  const grid = (frame * 0.6) % 80;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.bg} 0%, #0A0F26 55%, #0C0A22 100%)` }}>
      {/* moving grid */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(91,124,250,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(91,124,250,0.07) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          backgroundPosition: `0px ${grid}px`,
          maskImage: "radial-gradient(ellipse at 50% 45%, black 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 45%, black 20%, transparent 75%)",
        }}
      />
      {/* neon glows */}
      <div
        style={{
          position: "absolute",
          left: -300,
          top: 200,
          width: 1000,
          height: 1000,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.orange} 0%, transparent 65%)`,
          opacity: 0.22 + pulse * 0.22,
          filter: "blur(40px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -350,
          top: 900,
          width: 1100,
          height: 1100,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.violet} 0%, transparent 65%)`,
          opacity: 0.2 + pulse2 * 0.25,
          filter: "blur(40px)",
        }}
      />
      {/* diagonal speed streaks */}
      {Array.from({ length: 7 }).map((_, i) => {
        const x = ((frame * (5 + i) + i * 260) % 1700) - 300;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: 160 + i * 250,
              width: 360,
              height: 3,
              transform: "rotate(-24deg)",
              background: `linear-gradient(90deg, transparent, ${i % 2 ? C.blue : C.amber}, transparent)`,
              opacity: 0.35,
            }}
          />
        );
      })}
      {/* vignette */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* PARTICLES (coins + sparks)                                          */
/* ------------------------------------------------------------------ */
const Particles: React.FC<{ frame: number; opacity: number; count?: number }> = ({ frame, opacity, count = 34 }) => {
  if (opacity <= 0.01) return null;
  const colors = [C.amber, C.orange, C.blue, C.violet, C.white];
  return (
    <AbsoluteFill style={{ opacity, pointerEvents: "none" }}>
      {Array.from({ length: count }).map((_, i) => {
        const x = random(`x${i}`) * 1080;
        const speed = 3 + random(`s${i}`) * 6;
        const size = 10 + random(`z${i}`) * 30;
        const phase = random(`p${i}`) * 2200;
        const y = 2050 - ((frame * speed + phase) % 2200);
        const sway = Math.sin((frame + i * 13) / 14) * 34;
        const isCoin = i % 3 === 0 && size > 20;
        const color = colors[i % colors.length];
        if (isCoin) {
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x + sway,
                top: y,
                width: size * 1.6,
                height: size * 1.6,
                borderRadius: "50%",
                background: `radial-gradient(circle at 35% 30%, #FFE08A, ${C.amber} 55%, ${C.orange})`,
                boxShadow: `0 0 24px ${C.amber}`,
                color: "#7A3E00",
                fontWeight: 800,
                fontSize: size,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `scaleX(${Math.cos(frame / 6 + i)})`,
                fontFamily: FONT,
              }}
            >
              $
            </div>
          );
        }
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + sway,
              top: y,
              width: size * 0.5,
              height: size * 0.5,
              borderRadius: "50%",
              background: color,
              boxShadow: `0 0 ${size}px ${color}`,
              opacity: 0.85,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* CAPTION (top headline during feature / reward / outro)              */
/* ------------------------------------------------------------------ */
const Caption: React.FC<{
  frame: number;
  fps: number;
  start: number;
  end?: number;
  title: string;
  sub?: string;
  size?: number;
  gradient?: string;
}> = ({ frame, fps, start, end, title, sub, size = 84, gradient }) => {
  if (frame < start) return null;
  const inP = spring({ frame: frame - start, fps, config: { damping: 14, stiffness: 120 } });
  const out = end === undefined ? 0 : interpolate(frame, [end - 12, end], [0, 1], clamp);
  if (out >= 1) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: 215,
        left: 0,
        width: 1080,
        textAlign: "center",
        opacity: inP * (1 - out),
        transform: `translateY(${(1 - inP) * 60 - out * 40}px) scale(${0.9 + 0.1 * inP})`,
        fontFamily: FONT,
      }}
    >
      <div
        style={{
          fontSize: size,
          fontWeight: 900,
          fontStyle: "italic",
          letterSpacing: -2,
          lineHeight: 1.05,
          color: C.white,
          ...(gradient
            ? {
                background: gradient,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                WebkitTextFillColor: "transparent",
              }
            : {}),
          filter: "drop-shadow(0 6px 24px rgba(0,0,0,0.6))",
        }}
      >
        {title}
      </div>
      {sub && (
        <div style={{ marginTop: 10, fontSize: 34, fontWeight: 500, color: C.muted }}>{sub}</div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* SMALL ICONS                                                         */
/* ------------------------------------------------------------------ */
const Svg: React.FC<{ d: React.ReactNode; size?: number; color: string; fill?: string }> = ({ d, size = 24, color, fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

const NavIcon: React.FC<{ kind: string; color: string; active: boolean }> = ({ kind, color, active }) => {
  const fill = active ? color : "none";
  switch (kind) {
    case "Home":
      return <Svg color={color} fill={fill} d={<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />} />;
    case "Matches":
      return <Svg color={color} fill={fill} d={<><rect x="2" y="7" width="20" height="11" rx="5" /><path d="M7 10v5M4.5 12.5h5" stroke={active ? C.surface : color} /><circle cx="16" cy="11.5" r="1" /><circle cx="18.5" cy="14" r="1" /></>} />;
    case "Wallet":
      return <Svg color={color} fill={fill} d={<><rect x="3" y="6" width="18" height="14" rx="3" /><path d="M3 10h18" stroke={active ? C.surface : color} /><path d="M6 6l9-3 1 3" /></>} />;
    case "Rank":
      return <Svg color={color} fill={fill} d={<><path d="M7 4h10v5a5 5 0 0 1-10 0V4z" /><path d="M4 5h3M17 5h3M12 14v4M8 20h8" /></>} />;
    default:
      return <Svg color={color} fill={fill} d={<><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z" /></>} />;
  }
};

/* ------------------------------------------------------------------ */
/* PHONE FRAME (screen is 390 x 844 design px)                         */
/* ------------------------------------------------------------------ */
const PhoneFrame: React.FC<{ children: React.ReactNode; glow: number }> = ({ children, glow }) => (
  <div
    style={{
      width: 414,
      height: 868,
      borderRadius: 62,
      padding: 12,
      boxSizing: "border-box",
      background: "linear-gradient(145deg, #2A3050, #0C0F1C 40%, #1A2040)",
      border: "3px solid #343C63",
      boxShadow: `0 0 ${40 + glow * 60}px rgba(255,138,31,${0.25 + glow * 0.35}), 0 0 120px rgba(139,92,246,0.35), 0 40px 80px rgba(0,0,0,0.6)`,
      position: "relative",
    }}
  >
    <div
      style={{
        position: "relative",
        width: 390,
        height: 844,
        borderRadius: 48,
        overflow: "hidden",
        background: C.surface,
      }}
    >
      {children}
      {/* punch-hole camera */}
      <div style={{ position: "absolute", top: 12, left: 195 - 8, width: 16, height: 16, borderRadius: 8, background: "#000", zIndex: 50 }} />
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* SCREEN PARTS                                                        */
/* ------------------------------------------------------------------ */
const Header: React.FC<{ pill: string; pillPop: number }> = ({ pill, pillPop }) => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 84,
      padding: "30px 14px 0",
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: `1px solid ${C.border}`,
      background: C.surface,
      zIndex: 10,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 44, height: 44, borderRadius: 13, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <Img src={ICON_SRC} style={{ width: 40, height: 40, objectFit: "contain" }} />
      </div>
      <div style={{ lineHeight: 1.1 }}>
        <div style={{ fontSize: 11, color: C.muted }}>Welcome</div>
        <div style={{ fontSize: 17, fontWeight: 700, color: C.white }}>{PLAYER}</div>
      </div>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          padding: "7px 14px",
          borderRadius: 20,
          background: `linear-gradient(90deg, ${C.amber}, ${C.orange})`,
          color: "#1A1200",
          fontWeight: 800,
          fontSize: 14,
          display: "flex",
          alignItems: "center",
          gap: 6,
          transform: `scale(${pillPop})`,
          boxShadow: pillPop > 1.01 ? `0 0 18px ${C.amber}` : "none",
        }}
      >
        <Svg size={15} color="#1A1200" d={<><rect x="3" y="6" width="18" height="14" rx="3" /></>} />
        {pill}
      </div>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: C.card, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Svg size={19} color={C.white} d={<><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" /></>} />
      </div>
    </div>
  </div>
);

const BottomNav: React.FC<{ active: number }> = ({ active }) => {
  const items = ["Home", "Matches", "Wallet", "Rank", "Me"];
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 72,
        background: C.surface,
        borderTop: `1px solid ${C.border}`,
        display: "flex",
        zIndex: 10,
      }}
    >
      {items.map((it, i) => {
        const on = i === active;
        const col = on ? C.amber : C.muted;
        return (
          <div key={it} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, position: "relative" }}>
            {on && <div style={{ position: "absolute", top: 0, width: 36, height: 3, borderRadius: 2, background: C.orange, boxShadow: `0 0 10px ${C.orange}` }} />}
            <NavIcon kind={it} color={col} active={on} />
            <div style={{ fontSize: 11, fontWeight: 600, color: col }}>{it}</div>
          </div>
        );
      })}
    </div>
  );
};

const GameCard: React.FC<{ name: string; left: number; art: string; joined: number; frame: number }> = ({ name, left, art, joined, frame }) => {
  const pulse = 0.5 + 0.5 * Math.sin(frame / 5);
  return (
    <div
      style={{
        position: "absolute",
        left,
        top: 274,
        width: 114,
        height: 112,
        borderRadius: 20,
        overflow: "hidden",
        background: C.card,
        border: `${joined > 0.5 ? 2 : 1}px solid ${joined > 0.5 ? C.amber : C.border}`,
        boxShadow: joined > 0.01 ? `0 0 ${14 + pulse * 16}px ${C.amber}` : "none",
        transform: `scale(${1 + joined * 0.06})`,
      }}
    >
      <div style={{ height: 80, background: art, position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(115deg, rgba(255,255,255,0.18) 0 6px, transparent 6px 18px)" }} />
        <div style={{ position: "absolute", right: -18, top: -18, width: 70, height: 70, borderRadius: "50%", background: "rgba(255,255,255,0.45)", filter: "blur(10px)" }} />
        {joined > 0.01 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(7,10,24,0.72)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              opacity: joined,
              transform: `scale(${0.6 + 0.4 * joined})`,
            }}
          >
            <div style={{ width: 30, height: 30, borderRadius: 15, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 18px ${C.green}` }}>
              <Svg size={18} color="#04261A" d={<path d="M5 12l5 5 9-10" />} />
            </div>
            <div style={{ marginTop: 4, fontSize: 12, fontWeight: 800, color: C.green, letterSpacing: 1, textShadow: `0 0 10px ${C.green}` }}>JOINED</div>
          </div>
        )}
      </div>
      <div style={{ height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: C.white }}>{name}</div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* HOME SCREEN LAYER                                                   */
/* ------------------------------------------------------------------ */
const HomeLayer: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  // Cursor timing (global frames)
  const CUR_IN = 255;
  const CUR_ARRIVE = 318;
  const TAP = 322;
  const joined = spring({ frame: frame - (TAP + 6), fps, config: { damping: 12, stiffness: 140 } });
  const matchP = spring({ frame: frame - (TAP + 14), fps, config: { damping: 14, stiffness: 110 } });
  const ease = Easing.inOut(Easing.cubic);
  const cx = interpolate(frame, [CUR_IN, CUR_ARRIVE], [300, 78], { ...clamp, easing: ease });
  const cy = interpolate(frame, [CUR_IN, CUR_ARRIVE], [620, 336], { ...clamp, easing: ease });
  const press = interpolate(frame, [TAP - 2, TAP + 2, TAP + 8], [1, 0.78, 1], clamp);
  const ripple = interpolate(frame, [TAP, TAP + 24], [0, 1], clamp);
  const cursorOpacity = interpolate(frame, [CUR_IN, CUR_IN + 8, TAP + 40, TAP + 55], [0, 1, 1, 0], clamp);

  const cardIn = spring({ frame: frame - 205, fps, config: { damping: 16, stiffness: 90 } });
  const gamesIn = spring({ frame: frame - 220, fps, config: { damping: 16, stiffness: 90 } });

  return (
    <AbsoluteFill style={{ background: C.surface }}>
      {/* balance card */}
      <div
        style={{
          position: "absolute",
          top: 96,
          left: 14,
          right: 14,
          height: 128,
          borderRadius: 26,
          background: `linear-gradient(135deg, ${C.blue}, ${C.violet})`,
          overflow: "hidden",
          opacity: cardIn,
          transform: `translateY(${(1 - cardIn) * 30}px)`,
        }}
      >
        <div style={{ position: "absolute", right: -40, top: -40, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.14)" }} />
        <div style={{ padding: "14px 18px 0", color: "rgba(255,255,255,0.8)", fontSize: 12 }}>Total Balance</div>
        <div style={{ padding: "0 18px", color: C.white, fontSize: 32, fontWeight: 800, lineHeight: 1.1 }}>Rs 1010</div>
        <div style={{ position: "absolute", left: 18, right: 18, bottom: 14, display: "flex", gap: 10 }}>
          <div style={{ flex: 1, height: 38, borderRadius: 14, background: C.white, color: "#2A3A9A", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <span style={{ width: 16, height: 16, borderRadius: 8, background: "#2A3A9A", color: "#fff", fontSize: 13, lineHeight: "16px", textAlign: "center" }}>+</span>
            Add Money
          </div>
          <div style={{ flex: 1, height: 38, borderRadius: 14, background: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.85)", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>Withdraw</div>
        </div>
      </div>

      {/* choose a game */}
      <div style={{ position: "absolute", top: 240, left: 14, color: C.white, fontSize: 18, fontWeight: 700, opacity: gamesIn }}>Choose a Game</div>
      <div style={{ opacity: gamesIn, transform: `translateY(${(1 - gamesIn) * 30}px)` }}>
        <GameCard name="Free Fire" left={14} art={`linear-gradient(135deg, #FFD25A, ${C.orange} 60%, #E8451A)`} joined={joined} frame={frame} />
        <GameCard name="Mlbb" left={138} art="linear-gradient(135deg, #8FB8FF, #3B5BDB 60%, #1E2A78)" joined={0} frame={frame} />
      </div>

      {/* my matches */}
      <div style={{ position: "absolute", top: 404, left: 14, right: 14, display: "flex", justifyContent: "space-between", alignItems: "baseline", opacity: gamesIn }}>
        <div style={{ color: C.white, fontSize: 18, fontWeight: 700 }}>My Matches</div>
        <div style={{ color: C.muted, fontSize: 12 }}>joined</div>
      </div>

      {/* empty state fades as the match is joined */}
      <div style={{ position: "absolute", top: 520, left: 0, right: 0, textAlign: "center", opacity: gamesIn * (1 - joined), color: C.muted, fontSize: 13 }}>
        <div style={{ width: 40, height: 40, margin: "0 auto 10px", borderRadius: 20, border: `2px solid ${C.muted}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Svg size={22} color={C.muted} d={<><path d="M8 14s1.5 2 4 2 4-2 4-2" /><path d="M9 9h.01M15 9h.01" /></>} />
        </div>
        No active matches right now.
      </div>

      {/* joined match card */}
      {matchP > 0.01 && (
        <div
          style={{
            position: "absolute",
            top: 440,
            left: 14,
            right: 14,
            height: 96,
            borderRadius: 22,
            background: `linear-gradient(135deg, ${C.card}, #1B2347)`,
            border: `1.5px solid ${C.green}`,
            boxShadow: `0 0 ${16 + 10 * Math.sin(frame / 5)}px rgba(61,255,162,0.55)`,
            display: "flex",
            alignItems: "center",
            padding: "0 14px",
            gap: 12,
            opacity: matchP,
            transform: `translateY(${(1 - matchP) * 40}px) scale(${0.92 + 0.08 * matchP})`,
          }}
        >
          <div style={{ width: 62, height: 62, borderRadius: 16, background: `linear-gradient(135deg, #FFD25A, ${C.orange})`, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ color: C.white, fontSize: 15, fontWeight: 700 }}>Free Fire Squad Match</div>
            <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>Today 8:00 PM</div>
            <div style={{ color: C.amber, fontSize: 12, fontWeight: 700, marginTop: 2 }}>Prize pool Rs 5000</div>
          </div>
          <div style={{ padding: "6px 12px", borderRadius: 14, background: "rgba(61,255,162,0.15)", border: `1px solid ${C.green}`, color: C.green, fontSize: 12, fontWeight: 800, textShadow: `0 0 8px ${C.green}` }}>
            JOINED
          </div>
        </div>
      )}

      {/* neon cursor */}
      <div style={{ position: "absolute", left: cx, top: cy, opacity: cursorOpacity, zIndex: 40, pointerEvents: "none" }}>
        {ripple > 0 && ripple < 1 && (
          <div
            style={{
              position: "absolute",
              left: -30 + 0,
              top: -30,
              width: 60,
              height: 60,
              borderRadius: "50%",
              border: `3px solid ${C.amber}`,
              boxShadow: `0 0 20px ${C.amber}`,
              transform: `scale(${0.3 + ripple * 1.6})`,
              opacity: 1 - ripple,
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            left: -16,
            top: -16,
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "rgba(255,176,32,0.25)",
            border: `2px solid ${C.amber}`,
            boxShadow: `0 0 18px ${C.amber}, inset 0 0 10px ${C.amber}`,
            transform: `scale(${press})`,
          }}
        />
        <svg width="30" height="34" viewBox="0 0 24 28" style={{ position: "absolute", left: -2, top: -2, transform: `scale(${press})`, filter: `drop-shadow(0 0 8px ${C.amber})` }}>
          <path d="M3 2l16 11-7 1.5L8.5 22z" fill="#fff" stroke="#1A1200" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* DASHBOARD SCREEN LAYER (earnings)                                   */
/* ------------------------------------------------------------------ */
const DashboardLayer: React.FC<{ frame: number; fps: number; count: number; done: number }> = ({ frame, fps, count, done }) => {
  const bars = [30, 52, 38, 70, 46, 88, 64];
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const rewards = [
    { t: "Free Fire Squad", s: "Winner", v: "+$75", at: 505, c: C.orange },
    { t: "MLBB Duo", s: "2nd place", v: "+$50", at: 535, c: C.blue },
    { t: "Daily Bonus", s: "Streak reward", v: "+$25", at: 565, c: C.violet },
  ];
  const cardIn = spring({ frame: frame - 455, fps, config: { damping: 15, stiffness: 100 } });
  const pop = 1 + done * 0.08 * Math.sin(Math.min(1, done) * Math.PI);
  const withdrawGlow = 0.5 + 0.5 * Math.sin(frame / 6);

  return (
    <AbsoluteFill style={{ background: C.surface }}>
      <div
        style={{
          position: "absolute",
          top: 96,
          left: 14,
          right: 14,
          height: 190,
          borderRadius: 28,
          background: `linear-gradient(135deg, ${C.blue}, ${C.violet})`,
          overflow: "hidden",
          opacity: cardIn,
          transform: `translateY(${(1 - cardIn) * 30}px)`,
          boxShadow: `0 0 ${20 + done * 30}px rgba(139,92,246,${0.3 + done * 0.4})`,
        }}
      >
        <div style={{ position: "absolute", right: -50, top: -50, width: 190, height: 190, borderRadius: "50%", background: "rgba(255,255,255,0.14)" }} />
        <div style={{ padding: "18px 20px 0", color: "rgba(255,255,255,0.85)", fontSize: 13 }}>Total Earnings</div>
        <div style={{ padding: "0 20px", color: C.white, fontSize: 62, fontWeight: 800, lineHeight: 1.1, transform: `scale(${pop})`, transformOrigin: "left center", textShadow: done > 0 ? "0 0 24px rgba(255,255,255,0.6)" : "none" }}>
          ${count}
        </div>
        <div style={{ position: "absolute", left: 20, right: 20, bottom: 16, display: "flex", gap: 10 }}>
          <div style={{ flex: 1, height: 42, borderRadius: 15, background: "rgba(255,255,255,0.2)", color: "#fff", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>Add Money</div>
          <div
            style={{
              flex: 1,
              height: 42,
              borderRadius: 15,
              background: C.white,
              color: "#2A3A9A",
              fontWeight: 800,
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: done > 0.5 ? `0 0 ${10 + withdrawGlow * 16}px #fff` : "none",
            }}
          >
            Withdraw
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", top: 304, left: 16, color: C.white, fontSize: 17, fontWeight: 700 }}>This Week</div>
      <div style={{ position: "absolute", top: 336, left: 14, right: 14, height: 118, borderRadius: 22, background: C.card, border: `1px solid ${C.border}`, display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "12px 18px 10px" }}>
        {bars.map((h, i) => {
          const g = spring({ frame: frame - (485 + i * 4), fps, config: { damping: 12, stiffness: 120 } });
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div
                style={{
                  width: 28,
                  height: h * g,
                  borderRadius: 9,
                  background: i === 5 ? `linear-gradient(180deg, ${C.amber}, ${C.orange})` : `linear-gradient(180deg, ${C.blue}, ${C.violet})`,
                  boxShadow: i === 5 ? `0 0 14px ${C.orange}` : "none",
                }}
              />
              <div style={{ fontSize: 10, color: C.muted }}>{days[i]}</div>
            </div>
          );
        })}
      </div>

      <div style={{ position: "absolute", top: 470, left: 16, color: C.white, fontSize: 17, fontWeight: 700 }}>Recent Rewards</div>
      {rewards.map((r, i) => {
        const p = spring({ frame: frame - r.at, fps, config: { damping: 14, stiffness: 110 } });
        return (
          <div
            key={r.t}
            style={{
              position: "absolute",
              top: 504 + i * 76,
              left: 14,
              right: 14,
              height: 64,
              borderRadius: 20,
              background: C.card,
              border: `1px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              padding: "0 14px",
              gap: 12,
              opacity: p,
              transform: `translateX(${(1 - p) * 120}px)`,
            }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${r.c}, ${C.surface})`, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ color: C.white, fontSize: 14, fontWeight: 700 }}>{r.t}</div>
              <div style={{ color: C.muted, fontSize: 11 }}>{r.s}</div>
            </div>
            <div style={{ color: C.green, fontSize: 17, fontWeight: 800, textShadow: `0 0 10px rgba(61,255,162,0.6)` }}>{r.v}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* PLAY STORE BADGE (pure SVG/CSS)                                     */
/* ------------------------------------------------------------------ */
const PlayBadge: React.FC<{ frame: number; fps: number; start: number }> = ({ frame, fps, start }) => {
  const p = spring({ frame: frame - start, fps, config: { damping: 11, stiffness: 120 } });
  if (frame < start) return null;
  const shine = interpolate((frame - start) % 70, [0, 70], [-200, 700]);
  const glow = 0.5 + 0.5 * Math.sin(frame / 8);
  return (
    <div
      style={{
        position: "absolute",
        left: 270,
        top: 1450,
        width: 540,
        height: 150,
        borderRadius: 30,
        background: "#000",
        border: "3px solid #A8A8B3",
        boxShadow: `0 0 ${24 + glow * 30}px rgba(255,138,31,${0.4 + glow * 0.3}), 0 20px 50px rgba(0,0,0,0.6)`,
        display: "flex",
        alignItems: "center",
        gap: 22,
        padding: "0 34px",
        boxSizing: "border-box",
        overflow: "hidden",
        opacity: p,
        transform: `translateY(${(1 - p) * 120}px) scale(${0.8 + 0.2 * p})`,
        fontFamily: FONT,
      }}
    >
      <svg width="76" height="82" viewBox="0 0 24 26">
        <polygon points="1,1 13,13 1,25" fill="#00C3FF" />
        <polygon points="1,1 18,10 13,13" fill="#00E676" />
        <polygon points="18,10 23,13 18,16 13,13" fill="#FFD400" />
        <polygon points="1,25 18,16 13,13" fill="#FF3D57" />
      </svg>
      <div style={{ color: "#fff", lineHeight: 1 }}>
        <div style={{ fontSize: 24, fontWeight: 500, letterSpacing: 2 }}>GET IT ON</div>
        <div style={{ fontSize: 56, fontWeight: 600, marginTop: 6, letterSpacing: -1 }}>Google Play</div>
      </div>
      <div style={{ position: "absolute", top: -20, bottom: -20, left: shine, width: 70, transform: "skewX(-20deg)", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)" }} />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* MAIN COMPOSITION                                                    */
/* ------------------------------------------------------------------ */
export const BattleLeagueAd: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  /* ---- App icon: drop (hook) -> shrink to top-left (feature) ---- */
  const drop = spring({ frame, fps, config: { damping: 8, stiffness: 90, mass: 1.1 } });
  const toCorner = spring({ frame: frame - (T_FEATURE - 5), fps, config: { damping: 17, stiffness: 100 } });
  const iconSize = interpolate(toCorner, [0, 1], [460, 130]);
  const iconCx = interpolate(toCorner, [0, 1], [540, 125]);
  const iconCy = interpolate(toCorner, [0, 1], [700, 135]);
  const iconPulse = 1 + 0.025 * Math.sin(frame / 7) * (1 - toCorner);
  const iconGlow = 0.5 + 0.5 * Math.sin(frame / 10);

  /* ---- Hook words ---- */
  const hookOut = interpolate(frame, [160, 185], [0, 1], clamp);
  const words = [
    { t: "PLAY.", at: 45, top: 1010, grad: `linear-gradient(90deg, #fff, #D8E0FF)` },
    { t: "COMPETE.", at: 75, top: 1190, grad: `linear-gradient(90deg, ${C.blue}, ${C.violet})` },
    { t: "EARN.", at: 105, top: 1370, grad: `linear-gradient(90deg, ${C.amber}, ${C.orange})` },
  ];

  /* ---- Phone ---- */
  const phoneIn = spring({ frame: frame - (T_FEATURE + 5), fps, config: { damping: 16, stiffness: 80 } });
  const phoneY = (1 - phoneIn) * 1750;
  const toOutro = interpolate(frame, [T_OUTRO, T_OUTRO + 40], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const phoneScale = interpolate(toOutro, [0, 1], [1.45, 1.15]);
  const phoneFloat = Math.sin(frame / 25) * 6;
  const glow = interpolate(frame, [T_REWARD, T_REWARD + 30], [0, 1], clamp) * (0.5 + 0.5 * Math.sin(frame / 8));

  /* ---- Screen transition + counter ---- */
  const tr = interpolate(frame, [T_REWARD, T_REWARD + 28], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const countP = interpolate(frame, [T_REWARD + 15, T_REWARD + 160], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const count = Math.round(150 * countP);
  const done = interpolate(frame, [T_REWARD + 160, T_REWARD + 175], [0, 1], clamp);
  const pillPop = frame > T_REWARD + 15 && frame < T_REWARD + 175 ? 1 + 0.06 * Math.abs(Math.sin(frame / 2)) : 1;
  const pillText = frame >= T_REWARD + 15 ? `$${count}` : "Rs 1010";
  const navActive = frame >= T_REWARD + 14 ? 2 : 0;

  /* ---- Particles ---- */
  const particleOpacity =
    interpolate(frame, [T_REWARD, T_REWARD + 20, T_OUTRO + 20, T_OUTRO + 50], [0, 1, 1, 0.35], clamp) +
    interpolate(frame, [0, 30, 150, 180], [0, 0.25, 0.25, 0], clamp);

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: FONT, overflow: "hidden" }}>
      <Background frame={frame} />
      <Particles frame={frame} opacity={Math.min(1, particleOpacity)} />

      {/* HOOK TEXT */}
      {words.map((w) => {
        const p = spring({ frame: frame - w.at, fps, config: { damping: 9, stiffness: 140 } });
        if (frame < w.at || hookOut >= 1) return null;
        return (
          <div
            key={w.t}
            style={{
              position: "absolute",
              top: w.top,
              left: 0,
              width: 1080,
              textAlign: "center",
              fontSize: 180,
              fontWeight: 900,
              fontStyle: "italic",
              letterSpacing: -6,
              lineHeight: 1,
              background: w.grad,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 8px 30px rgba(0,0,0,0.7))",
              opacity: (1 - hookOut) * Math.min(1, p * 2),
              transform: `scale(${0.3 + 0.7 * p}) translateY(${hookOut * -60}px) rotate(${(1 - p) * -4}deg)`,
            }}
          >
            {w.t}
          </div>
        );
      })}

      {/* APP ICON */}
      <div
        style={{
          position: "absolute",
          left: iconCx - iconSize / 2,
          top: iconCy - iconSize / 2,
          width: iconSize,
          height: iconSize,
          transform: `translateY(${(1 - drop) * -1100}px) rotate(${(1 - drop) * -14}deg) scale(${iconPulse})`,
          zIndex: 20,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: -iconSize * 0.25,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${C.orange} 0%, ${C.violet} 45%, transparent 70%)`,
            opacity: (0.35 + iconGlow * 0.35) * (1 - toCorner * 0.5),
            filter: "blur(30px)",
          }}
        />
        <Img src={ICON_SRC} style={{ position: "relative", width: "100%", height: "100%", objectFit: "contain", filter: `drop-shadow(0 0 ${20 + iconGlow * 20}px rgba(255,138,31,0.8))` }} />
      </div>

      {/* APP NAME next to the corner icon */}
      {frame > T_FEATURE && (
        <div
          style={{
            position: "absolute",
            left: 215,
            top: 95,
            opacity: toCorner,
            transform: `translateX(${(1 - toCorner) * -40}px)`,
            color: C.white,
            fontSize: 44,
            fontWeight: 900,
            fontStyle: "italic",
            letterSpacing: -1,
            lineHeight: 1,
            filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.6))",
          }}
        >
          {APP_NAME}
          <div style={{ fontSize: 22, fontWeight: 500, fontStyle: "normal", color: C.muted, marginTop: 6, letterSpacing: 0 }}>Free Fire and MLBB tournaments</div>
        </div>
      )}

      {/* CAPTIONS */}
      <Caption frame={frame} fps={fps} start={T_FEATURE + 20} end={T_REWARD} title="Join in one tap" sub="Pick your game. Pick your match." gradient={`linear-gradient(90deg, #fff, ${C.amber})`} />
      <Caption frame={frame} fps={fps} start={T_REWARD + 5} end={T_OUTRO} title="Instant Cash Rewards" sub="Win matches. Withdraw your earnings." gradient={`linear-gradient(90deg, ${C.amber}, ${C.orange})`} />
      <Caption frame={frame} fps={fps} start={T_OUTRO + 10} title={`Download ${APP_NAME}`} size={76} gradient={`linear-gradient(90deg, #fff, ${C.amber})`} />

      {/* PHONE */}
      {phoneIn > 0.001 && (
        <div
          style={{
            position: "absolute",
            left: 540 - 207,
            top: 380,
            width: 414,
            height: 868,
            transformOrigin: "50% 0%",
            transform: `translateY(${phoneY + phoneFloat * phoneIn}px) scale(${phoneScale})`,
            zIndex: 15,
          }}
        >
          <PhoneFrame glow={glow}>
            <Header pill={pillText} pillPop={pillPop} />
            {/* home layer exits left, dashboard enters from right */}
            <div style={{ position: "absolute", inset: 0, transform: `translateX(${-tr * 120}px)`, opacity: 1 - tr }}>
              <HomeLayer frame={frame} fps={fps} />
            </div>
            {tr > 0 && (
              <div style={{ position: "absolute", inset: 0, transform: `translateX(${(1 - tr) * 390}px)`, opacity: tr }}>
                <DashboardLayer frame={frame} fps={fps} count={count} done={done} />
              </div>
            )}
            <BottomNav active={navActive} />
          </PhoneFrame>
        </div>
      )}

      {/* OUTRO */}
      <PlayBadge frame={frame} fps={fps} start={T_OUTRO + 28} />
      {frame >= T_OUTRO + 50 && (
        <div
          style={{
            position: "absolute",
            top: 1640,
            left: 0,
            width: 1080,
            textAlign: "center",
            color: C.muted,
            fontSize: 34,
            fontWeight: 500,
            letterSpacing: 1,
            opacity: interpolate(frame, [T_OUTRO + 50, T_OUTRO + 68], [0, 1], clamp),
            transform: `translateY(${interpolate(frame, [T_OUTRO + 50, T_OUTRO + 68], [20, 0], clamp)}px)`,
            fontFamily: "'SF Mono', 'Roboto Mono', Menlo, Consolas, monospace",
          }}
        >
          {PACKAGE}
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* ROOT: register this in your index.ts with registerRoot()            */
/* ------------------------------------------------------------------ */
export const RemotionRoot: React.FC = () => (
  <Composition id="BattleLeagueAd" component={BattleLeagueAd} durationInFrames={900} fps={30} width={1080} height={1920} />
);