"use client";

import React from "react";
import Image from "next/image";

interface AIProviderLogoProps {
  provider: string;
  size?: number;
  containerSize?: number;
  style?: React.CSSProperties;
}

export default function AIProviderLogo({
  provider,
  size = 20,
  containerSize = 36,
  style = {},
}: AIProviderLogoProps) {
  const normProvider = provider.toLowerCase().trim();

  // Determine logo source
  let logoSrc = "/favicon.ico"; // Default to favicon for custom/unknown providers

  if (normProvider.includes("openai") || normProvider.includes("chatgpt")) {
    logoSrc = "/logo/providers/openai.png";
  } else if (normProvider.includes("gemini")) {
    logoSrc = "/logo/providers/gemini.png";
  } else if (
    normProvider.includes("claude") ||
    normProvider.includes("anthropic")
  ) {
    logoSrc = "/logo/providers/anthropic.png";
  } else if (normProvider.includes("ollama")) {
    logoSrc = "/logo/providers/ollama.png";
  } else if (normProvider.includes("deepseek")) {
    logoSrc = "/logo/providers/deepseek.png";
  } else if (normProvider.includes("groq")) {
    logoSrc = "/logo/providers/groq.png";
  } else if (normProvider.includes("whisper")) {
    logoSrc = "/logo/providers/whisper.png";
  } else if (normProvider.includes("google")) {
    logoSrc = "/logo/providers/google.png";
  } else if (normProvider.includes("openrouter")) {
    logoSrc = "/logo/providers/openrouter.png";
  } else if (normProvider === "catatin" || normProvider === "custom") {
    logoSrc = "/favicon.ico";
  }

  return (
    <div
      style={{
        position: "relative",
        width: containerSize,
        height: containerSize,
        borderRadius: "50%",
        background: "white", // Use white background so transparent logos look solid
        border: `1px solid rgba(203, 196, 210, 0.2)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.08)",
        overflow: "hidden", // Ensure image stays inside circle
        ...style,
      }}
    >
      <Image
        src={logoSrc}
        alt={`${provider} logo`}
        fill
        style={{ objectFit: "cover" }}
        sizes={`${containerSize}px`}
      />
    </div>
  );
}
