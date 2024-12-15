<div align="center">
    <h3>Minecraft Pack Animation Tool</h3>
    <span>The tool that makes it easier to create an animated texture image</span>
</div>

## Quick Examples

(WIP)

```sh
./mc-pack-animation-tool -b background.png -g animation.gif -w 200 -p 100,50 -c 1,3
```

This command generates an animated texture image using the following parameters:

- **`-b background.png`**: Specifies the background image file (`background.png`) to be used.
- **`-g animation.gif`**: Adds the animation file (`animation.gif`) on top of the background.
- **`-w 200`**: Sets the width of the animation in pixels.
- **`-p 100,50`**: Positions the animation at coordinates (100, 50) in the (x, y) format.
- **`-c 2,4`**: Applies the animation to the 3rd and 5th zones (using 0-based indexing).

The output will be an animated texture image combining `background.png` and `animation.gif`, precisely configured as described.
