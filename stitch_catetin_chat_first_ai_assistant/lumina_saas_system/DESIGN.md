---
name: Lumina SaaS System
colors:
  surface: '#fdf7ff'
  surface-dim: '#ded8e0'
  surface-bright: '#fdf7ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f8f2fa'
  surface-container: '#f2ecf4'
  surface-container-high: '#ece6ee'
  surface-container-highest: '#e6e0e9'
  on-surface: '#1d1b20'
  on-surface-variant: '#494551'
  inverse-surface: '#322f35'
  inverse-on-surface: '#f5eff7'
  outline: '#7a7582'
  outline-variant: '#cbc4d2'
  surface-tint: '#6750a4'
  primary: '#4f378a'
  on-primary: '#ffffff'
  primary-container: '#6750a4'
  on-primary-container: '#e0d2ff'
  inverse-primary: '#cfbcff'
  secondary: '#63597c'
  on-secondary: '#ffffff'
  secondary-container: '#e1d4fd'
  on-secondary-container: '#645a7d'
  tertiary: '#765b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#c9a74d'
  on-tertiary-container: '#503d00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#cfbcff'
  on-primary-fixed: '#22005d'
  on-primary-fixed-variant: '#4f378a'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#cdc0e9'
  on-secondary-fixed: '#1f1635'
  on-secondary-fixed-variant: '#4b4263'
  tertiary-fixed: '#ffdf93'
  tertiary-fixed-dim: '#e7c365'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#594400'
  background: '#fdf7ff'
  on-background: '#1d1b20'
  surface-variant: '#e6e0e9'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-margin: 24px
  stack-gap-lg: 32px
  stack-gap-md: 24px
  stack-gap-sm: 16px
  card-padding: 24px
  inline-gap: 12px
---

## Brand & Style

The design system is built on a "Clarity & Depth" philosophy, targeting modern professionals who manage dual-natured data: professional POS operations and personal management. The brand personality is sophisticated yet approachable, utilizing a **Glassmorphic** and **Modern SaaS** aesthetic.

The UI evokes a sense of organized calm through the use of:
- **Atmospheric Depth:** Multi-layered surfaces with soft background blurs that simulate physical distance.
- **Precision Typography:** A focus on high legibility for dense data visualizations.
- **Dynamic Context:** Distinct visual "modes" (Blue for POS, Purple for Personal) that allow users to instantly recognize their current workspace context.
- **Tactile Softness:** Large radius corners and subtle mesh gradients that move away from rigid, legacy enterprise software into a fluid, user-centric experience.

## Colors

The system employs a dual-brand color strategy. Each workspace (POS and Personal) has a dedicated primary color and a corresponding pastel background tint to provide immediate environmental feedback.

- **POS Context:** Utilizes `#1A73E8` (Blue) as the primary action color. Backgrounds should lean toward the cool `#F0F5FF` spectrum.
- **Personal Context:** Utilizes `#6200EE` (Purple) as the primary action color. Backgrounds shift to the warmer `#F7F2FF` spectrum.
- **Glass Elements:** Containers use a semi-transparent white base with a 1px solid white border at 40% opacity to create the "glass" edge effect.
- **Data Viz:** Use high-contrast vibrant shades (Teal, Orange, Rose) against the neutral surfaces for clear metric differentiation.

## Typography

The typography system prioritizes clarity and a technical "SaaS" feel. 
- **Geist** is used for headlines to provide a sharp, modern geometric look that feels precise. 
- **Inter** is used for body copy and UI labels for its exceptional readability and neutral character.
- **Data Focus:** Large numeric displays (e.g., balance or total sales) should use `display-lg` with tightened letter spacing to create a strong visual anchor.
- **Hierarchy:** Use font-weight rather than color for hierarchy whenever possible, keeping text colors within the primary neutral shades to ensure accessibility.

## Layout & Spacing

The layout utilizes a **fluid grid** with significant whitespace to prevent information density fatigue. 

- **Desktop:** 12-column grid with 24px gutters.
- **Mobile:** Single column with 24px side margins.
- **Content Blocks:** Use a "Stack" philosophy where primary sections are separated by `stack-gap-lg` (32px). 
- **Glass Containers:** All glass containers must have internal padding of at least 24px to ensure content does not touch the fine borders, maintaining the "floating" illusion.

## Elevation & Depth

Depth is the primary communicator of hierarchy in this design system. It is achieved through three specific layers:

1.  **Level 0 (Background):** Subtle mesh gradients using workspace-specific colors (e.g., a faint purple cloud in the corner of the Personal workspace).
2.  **Level 1 (Glass Containers):** Semi-transparent white `#FFFFFF` at 60-80% opacity with a `20px` background blur. These surfaces feature a `1px` inner-stroke border in `glass_border`.
3.  **Level 2 (Floating Elements):** Actionable cards and buttons. These use an ambient shadow: `0px 10px 30px rgba(0, 0, 0, 0.04)`.
4.  **Level 3 (Active Overlays):** Modals and dropdowns. Use a deeper shadow: `0px 20px 50px rgba(0, 0, 0, 0.1)`.

## Shapes

The shape language is extremely soft and approachable. 
- **Main Cards:** Use `rounded-xl` (24px) for all primary data containers.
- **Interactive Elements:** Buttons and input fields use `rounded-lg` (16px) to create a clear visual distinction from the containers they sit within.
- **Chips & Tags:** Use fully rounded (pill-shaped) borders for status indicators and categorical chips.

## Components

### Buttons
Primary buttons use the workspace accent gradients (Blue or Purple) with white text. They should have a subtle inner glow on the top edge to simulate 3D volume. Secondary buttons use the glass style (blurred background, fine border).

### Cards
Cards are the core of the UI. They should always have a 24px corner radius. In a POS context, the header of the card may include a subtle blue indicator line on the left edge.

### Input Fields
Inputs should be glass-styled but with a higher opacity (90%) for text clarity. On focus, the border color should transition to the primary workspace color (Blue or Purple).

### Progress Bars & Data Viz
Progress bars should be chunky (8px+ height) with fully rounded caps. Use vibrant, high-contrast colors (e.g., Vibrant Orange `#FF8A00` or Teal `#00BFA5`) to ensure they pop against the soft background gradients.

### Navigation Bar
The mobile navigation bar should be a floating glass dock with `24px` padding from the bottom edge of the screen, featuring `20px` background blur and icons that change to the workspace primary color when active.