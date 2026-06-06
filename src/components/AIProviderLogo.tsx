"use client";

import React from "react";

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
  style = {}
}: AIProviderLogoProps) {
  const normProvider = provider.toLowerCase().trim();

  // Get brand colors and SVGs
  let bg = "var(--surface-container-highest)";
  let border = "rgba(203, 196, 210, 0.2)";
  let color = "var(--primary)";
  let svgContent = null;

  switch (normProvider) {
    case "catetin":
      bg = "linear-gradient(135deg, #6750A4, #4F378B)";
      border = "rgba(79, 55, 138, 0.3)";
      color = "#ffffff";
      svgContent = (
        // Custom Rocket Logo
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.5 16.5c-1.5 1.5-2.5 3.5-2.5 5.5C4 22 6 21 7.5 19.5" />
          <path d="M12 2C12 2 12.5 8.5 18 12C12.5 15.5 12 22 12 22C12 22 11.5 15.5 6 12C11.5 8.5 12 2 12 2Z" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
        </svg>
      );
      break;

    case "openai":
      bg = "linear-gradient(135deg, #10A37F, #0E8F6F)";
      border = "rgba(16, 163, 127, 0.3)";
      color = "#ffffff";
      svgContent = (
        // OpenAI Spiral Logo
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M21.3 10.2c.1-.5 0-1-.3-1.4c-.3-.4-.7-.6-1.2-.7c-.1 0-.2 0-.2 0v-1.7c0-.8-.5-1.5-1.3-1.8c-.3-.1-.6-.1-.9 0L15.3 3.3C14.7 2.8 14 2.6 13.2 2.8c-.4.1-.8.3-1.1.6V1.7c0-.9-.7-1.6-1.6-1.7C10-.1 9.5.1 9.1.4L6.9 1.7C6.3 2.1 5.8 2.7 5.7 3.5L3.8 4.6C3.3 4.9 3 5.4 2.9 6c-.1.6.1 1.1.4 1.6l1.2.7C4.4 8.9 4.2 9.6 4.4 10.3c.1.4.3.8.6 1.1L3.2 12.5c-.7.4-1.1 1.1-1.2 1.9s.3 1.6.9 2l2.2 1.3c.3.2.6.3.9.3c.2 0 .5-.1.7-.2l1.5.9c.5.3 1 .3 1.5.1c.4-.2.8-.5 1-.9v1.7c0 .9.7 1.6 1.6 1.7c.5.1 1-.1 1.4-.4l2.2-1.3c.6-.4 1.1-1 1.2-1.8l1.9-1.1c.5-.3.8-.8.9-1.4c.1-.6-.1-1.1-.4-1.6l-1.2-.7c.1-.6.3-1.3.1-2L21.3 10.2z" />
        </svg>
      );
      break;

    case "gemini":
      bg = "linear-gradient(135deg, #1A73E8, #8E24AA)";
      border = "rgba(26, 115, 232, 0.3)";
      color = "#ffffff";
      svgContent = (
        // Google Gemini Sparkle Logo
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C12 2 12.5 8.5 18 12C12.5 15.5 12 22 12 22C12 22 11.5 15.5 6 12C11.5 8.5 12 2 12 2Z" />
          <path d="M17 6C17 6 17.2 9.2 19.8 11C17.2 12.8 17 16 17 16C17 16 16.8 12.8 14.2 11C16.8 9.2 17 6 17 6Z" opacity="0.8" />
        </svg>
      );
      break;

    case "claude":
      bg = "linear-gradient(135deg, #D97756, #C25E3B)";
      border = "rgba(217, 119, 86, 0.3)";
      color = "#ffffff";
      svgContent = (
        // Stylized crown/hand for Claude
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M4.5 19.5h15v-2h-15v2zm2-4h11V6.5l-2.5 3-3-4.5-3 4.5-2.5-3v9z" />
        </svg>
      );
      break;

    case "ollama":
      bg = "linear-gradient(135deg, #111111, #222222)";
      border = "rgba(255, 255, 255, 0.1)";
      color = "#ffffff";
      svgContent = (
        // Stylized Llama Head
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18h6" />
          <path d="M10 22h4" />
          <path d="M8 6h2l1-4h2l1 4h2" />
          <path d="M9 10a3 3 0 0 1 6 0v8H9v-8z" />
        </svg>
      );
      break;

    case "deepseek":
      bg = "linear-gradient(135deg, #1C64F2, #104DBF)";
      border = "rgba(28, 100, 242, 0.3)";
      color = "#ffffff";
      svgContent = (
        // DeepSeek stylized D sphere
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12a4 4 0 1 1 8 0 4 4 0 0 1-8 0z" strokeWidth="2.5" />
          <path d="M12 2v6M12 16v6M2 12h6M16 12h6" />
        </svg>
      );
      break;

    case "whisper":
      bg = "linear-gradient(135deg, #5C6BC0, #3F51B5)";
      border = "rgba(92, 107, 192, 0.3)";
      color = "#ffffff";
      svgContent = (
        // Soundwaves for Whisper audio model
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M17 5v14M22 9v6M7 5v14M2 9v6" />
        </svg>
      );
      break;

    case "google":
      bg = "#ffffff";
      border = "rgba(0, 0, 0, 0.1)";
      svgContent = (
        // High-Fidelity Google Logo
        <svg viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
        </svg>
      );
      break;

    default:
      // Custom generic CPU/chip representation
      bg = "linear-gradient(135deg, #7E57C2, #5E35B1)";
      border = "rgba(126, 87, 194, 0.3)";
      color = "#ffffff";
      svgContent = (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
          <rect x="9" y="9" width="6" height="6" />
          <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3" />
        </svg>
      );
      break;
  }

  return (
    <div
      style={{
        width: containerSize,
        height: containerSize,
        borderRadius: "50%",
        background: bg,
        border: `1px solid ${border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: color,
        flexShrink: 0,
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.08)",
        ...style
      }}
    >
      <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {svgContent}
      </div>
    </div>
  );
}
