# C64 Font Installation (Optional)

For the most authentic C64 experience, you can download and install a real C64 font.

## Recommended Fonts:

1. **C64 Pro Mono** (Best option)
   - Download from: https://style64.org/file/C64_Pro_Mono-STYLE.ttf
   - Or search: "C64 Pro Mono font download"

2. **C64 TrueType**
   - Search: "Commodore 64 TrueType font"

## Installation:

1. Download the `.ttf` or `.woff` font file
2. Place it in this directory (`chat/static/chat/fonts/`)
3. Update `c64.css` to reference the font:

```css
@font-face {
    font-family: 'C64';
    src: url('C64_Pro_Mono-STYLE.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
}
```

4. The CSS already uses fallback fonts (Courier New, Consolas) which provide a similar monospace look.

## Current Setup:

The theme currently uses system monospace fonts with pixel-perfect rendering disabled to achieve a retro look. This works well without requiring external font downloads.
