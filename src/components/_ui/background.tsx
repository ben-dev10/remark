import React from "react";

/*
 * Presets
 */
type PresetKey<T extends Record<string, string>> = keyof T | (string & {});
type BackgroundSizeKeywords =
  | "auto"
  | "cover"
  | "contain"
  | "initial"
  | "inherit"
  | "unset"
  | "revert";
type CSSBackgroundSize = BackgroundSizeKeywords | (string & {});

// Preset gradients
const gradientPresets = {
  crimson: "linear-gradient(135deg, #dc143c 0%, #8b0000 100%)",
  ocean: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  sunset: "linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)",
  forest: "linear-gradient(135deg, #134e5e 0%, #71b280 100%)",
  midnight: "linear-gradient(135deg, #232526 0%, #414345 100%)",
  // credit: pattern-craft
  gradientHorizonGlow:
    "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(251, 191, 36, 0.25), transparent 70%)",
  cosmicAurora:
    "radial-gradient(ellipse at 20% 30%, rgba(56, 189, 248, 0.4) 0%, transparent 60%), radial-gradient(ellipse at 80% 70%, rgba(139, 92, 246, 0.3) 0%, transparent 70%),radial-gradient(ellipse at 60% 20%, rgba(236, 72, 153, 0.25) 0%, transparent 50%), radial-gradient(ellipse at 40% 80%, rgba(34, 197, 94, 0.2) 0%, transparent 65%)",
  auroraDreams: `radial-gradient(ellipse 85% 65% at 8% 8%, rgba(175, 109, 255, 0.42), transparent 60%), radial-gradient(ellipse 75% 60% at 75% 35%, rgba(255, 235, 170, 0.55), transparent 62%), radial-gradient(ellipse 70% 60% at 15% 80%, rgba(255, 100, 180, 0.40), transparent 62%),
  radial-gradient(ellipse 70% 60% at 92% 92%, rgba(120, 190, 255, 0.45), transparent 62%), linear-gradient(180deg, #f7eaff 0%, #fde2ea 100%)`,
  dreamyPink: `radial-gradient(circle at 30% 70%, rgba(173, 216, 230, 0.35), transparent 60%), radial-gradient(circle at 70% 30%, rgba(255, 182, 193, 0.4), transparent 60%)`,
  flurryBlue: `radial-gradient(circle at 25% 61%, hsla(298,0%,100%,1) 0%,transparent 55.31899567992806%),radial-gradient(circle at 42% 84%, hsla(298,0%,100%,1) 0%,transparent 55.31899567992806%),radial-gradient(circle at 13% 58%, hsla(298,100%,66%,0.34) 0%,transparent 45.77892876736944%),radial-gradient(circle at 53% 90%, hsla(163,100%,66%,0.34) 0%,transparent 45.77892876736944%),radial-gradient(circle at 23% 79%, hsla(224,100%,66%,1) 0%,transparent 74%)`,
} as const;

// Preset textures
const texturePresets = {
  noise: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
} as const;

// Preset patterns
const patternPresets = {
  gridLinesDark: `linear-gradient(to right, #262626 1px, transparent 1px),linear-gradient(to bottom, #262626 1px, transparent 1px)` /* bgSize: 20px 20px */,
  gridLinesLight: `linear-gradient(to right, #cccccc 1px, transparent 1px),linear-gradient(to bottom, #cccccc 1px, transparent 1px)` /* bgSize: 20px 20px */,
  verticalLinesDark: `linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)`,
  verticalLinesLight: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
  hatchLines: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 11px)` /* bgSize: cover */,
  stripedDark: `repeating-linear-gradient(45deg, #000 0px, #111 2px, #000 4px, #222 6px)` /* bgSize: cover */,
  circuitBoardLight: `repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(75, 85, 99, 0.08) 19px, rgba(75, 85, 99, 0.08) 20px, transparent 20px, transparent 39px, rgba(75, 85, 99, 0.08) 39px, rgba(75, 85, 99, 0.08) 40px),
      repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(75, 85, 99, 0.08) 19px, rgba(75, 85, 99, 0.08) 20px, transparent 20px, transparent 39px, rgba(75, 85, 99, 0.08) 39px, rgba(75, 85, 99, 0.08) 40px),
      radial-gradient(circle at 20px 20px, rgba(55, 65, 81, 0.12) 2px, transparent 2px),
      radial-gradient(circle at 40px 40px, rgba(55, 65, 81, 0.12) 2px, transparent 2px)` /* bgSize: 40px 40px, 40px 40px, 40px 40px, 40px 40px */,
  topFadeGrid: `linear-gradient(to right, #e2e8f0 1px, transparent 1px),linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)`,
} as const;

/*
 * Components
 */
interface BaseBackgroundProps {
  className?: string;
  style?: React.CSSProperties;
  zIndex?: number;
}

interface GradientProps extends BaseBackgroundProps {
  gradient?: PresetKey<typeof gradientPresets>;
  opacity?: number;
  blendMode?: React.CSSProperties["mixBlendMode"];
}

const Gradient: React.FC<GradientProps> = ({
  gradient = "crimson",
  opacity = 1,
  blendMode,
  className = "",
  zIndex = 1,
  style = {},
}) => {
  const bg =
    gradientPresets[gradient as keyof typeof gradientPresets] || gradient;

  return (
    <div
      className={`gradient-background-graphic pointer-events-none absolute inset-0 ${className}`}
      style={{
        background: bg,
        opacity,
        mixBlendMode: blendMode,
        zIndex: zIndex,
        ...style,
      }}
      aria-hidden="true"
    />
  );
};

interface TextureProps extends BaseBackgroundProps {
  texture?: PresetKey<typeof texturePresets>;
  opacity?: number;
  blendMode?: React.CSSProperties["mixBlendMode"];
  size?: CSSBackgroundSize;
}

const Texture: React.FC<TextureProps> = ({
  texture = "noise",
  opacity = 1,
  blendMode = "overlay",
  size = "cover",
  className = "",
  zIndex = 3,
  style = {},
}) => {
  const bg = texturePresets[texture as keyof typeof texturePresets] || texture;

  return (
    <div
      className={`texture--background-graphic pointer-events-none absolute inset-0 ${className}`}
      style={{
        backgroundImage: bg,
        backgroundSize: size, // auto | contain | cover | <number>px
        opacity,
        mixBlendMode: blendMode,
        zIndex: zIndex,
        ...style,
      }}
      aria-hidden="true"
    />
  );
};

interface ImgProps extends BaseBackgroundProps {
  pattern?: PresetKey<typeof patternPresets>;
  opacity?: number;
  blendMode?: React.CSSProperties["mixBlendMode"];
  size?: CSSBackgroundSize;
}

const Img: React.FC<ImgProps> = ({
  pattern = "grid-lines-1",
  opacity,
  blendMode,
  size = "cover",
  className = "",
  zIndex = 2,
  style = {},
}) => {
  const bg = patternPresets[pattern as keyof typeof patternPresets] || pattern;

  return (
    <div
      className={`img--background-graphic pointer-events-none absolute inset-0 ${className}`}
      style={{
        backgroundImage: bg,
        backgroundSize: size,
        opacity,
        mixBlendMode: blendMode,
        zIndex: zIndex,
        ...style,
      }}
      aria-hidden="true"
    />
  );
};

interface LayerProps extends BaseBackgroundProps {
  opacity?: number;
  children?: React.ReactNode;
  styles?: React.CSSProperties | undefined;
}

const Layer: React.FC<LayerProps> = ({
  children,
  opacity,
  zIndex,
  className,
  styles,
}) => {
  return (
    <div
      aria-hidden="true"
      className={`layer--background-graphic pointer-events-none ${className}`}
      style={{ opacity: opacity, zIndex: zIndex, ...styles }}
    >
      {children}
    </div>
  );
};

interface BackgroundProps extends BaseBackgroundProps {
  children?: React.ReactNode;
}

const BackgroundRoot: React.FC<BackgroundProps> = ({
  children,
  className = "",
  style = {},
}) => {
  return (
    <div
      className={`background-graphics pointer-events-none absolute inset-0 ${className}`}
      style={style}
      aria-hidden="true"
    >
      {children}
    </div>
  );
};

const Background = Object.assign(BackgroundRoot, {
  Gradient,
  Texture,
  Img,
  Layer,
});

export default Background;
