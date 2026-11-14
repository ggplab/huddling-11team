# Figma racing assets

Source: https://www.figma.com/design/BdKxgMVSZi3BnovHsktZrx/ (Page 1). Exported 2026-11-14.

- `racing/`: 19 individual racing props, PNG, named by visible contents. Figma node IDs are in `figma-node-map.json`.
- `scenes/`: 11 images, including four character progression sheets, two stadium backgrounds, three ranking cards and two Korean start graphics. `stadium-track-side-background.png` is node 2:1772; other node IDs are in `figma-node-map.json`.
- `penguins/png/`: all 20 role-and-level characters. Some PNGs were rendered from Figma SVG exports. `penguins/svg/` contains all 20 character SVGs.
- `source/`: original sprite sheet used by the racing props.
- `code-previews/`: PNG previews of `live_feed` and `ranking_box`, not executable source code.
- `manifest.json`: paths, dimensions and Figma node IDs for the penguins. Racing and scene node maps are in their folders.

Character canvas sizes vary; align them explicitly in code. Some raster images include opaque white backgrounds. The racing props preserve the source crop; the speaker light is clipped at the left edge and the orange cone has a small dark line at the right edge.
