#!/bin/bash
# Builds a depth map (white = near, black = far) for a product photo on the plain #EFEFEF background.
#   1. mask  = pixels darker than the grey background (bag, straps, rope, contact shadow).
#              The lit floor is lighter than the background, so it is never mistaken for the bag.
#   2. body  = distance from the mask edge -> rounded "pillow" shape, so the bag has volume
#   3. floor = gentle gradient, nearer towards the bottom of the photo (the surface the bag stands on)
# usage: make-depth.sh name threshold% [fill|nofill]
#   reads  <img dir>/name.webp, writes <img dir>/depth/name-depth.png (+ name-mask.png for checking)
#   fill   = fill holes inside the bag (bright highlights); nofill keeps them (e.g. floor seen through rope loops)
#   IMG_DIR overrides the image folder (default: assets/img next to this tools folder)
set -e
cd "${IMG_DIR:-$(dirname "$0")/../assets/img}"
n="$1"; th="${2:-8}"; fill="${3:-fill}"
W=512
mkdir -p depth
# 1. mask: how much darker than the background grey (239) each pixel is, thresholded and cleaned up
magick "$n.webp" -resize ${W}x${W}! -colorspace Gray -negate -evaluate Subtract 6.27% \
  -threshold "$th%" -morphology Close Disk:4 -morphology Open Disk:2 "depth/$n-raw.png"
if [ "$fill" = "fill" ]; then
  # fill holes: flood the background from the border; everything the flood can't reach is bag
  magick "depth/$n-raw.png" -bordercolor black -border 1 -fill gray50 -draw "color 0,0 floodfill" -shave 1x1 \
    -fill white +opaque gray50 -fill black -opaque gray50 -morphology Close Disk:4 "depth/$n-mask.png"
else
  magick "depth/$n-raw.png" -morphology Close Disk:5 "depth/$n-mask.png"
fi
# 2. body: euclidean distance inside the mask, normalised, eased into a rounded profile
magick "depth/$n-mask.png" -morphology Distance Euclidean:4,100\! -auto-level -evaluate Pow 0.55 "depth/$n-body.png"
# 3. floor gradient (far at the horizon, a little nearer at the bottom)
magick -size ${W}x${W} gradient:black-'gray(70)' "depth/$n-floor.png"
# combine: bag = 0.35 + 0.65 * body (always in front of the floor), floor elsewhere; soften edges
magick "depth/$n-floor.png" \( "depth/$n-body.png" -evaluate Multiply 0.65 -evaluate Add 35% \) "depth/$n-mask.png" -composite \
  -blur 0x3 -depth 8 -strip "depth/$n-depth.png"
rm -f "depth/$n-raw.png" "depth/$n-body.png" "depth/$n-floor.png"
magick "depth/$n-mask.png" -format "$n mask: bag covers %[fx:round(mean*100)]%% of the photo\n" info:
# delete the preview mask (only useful while checking a new photo)
rm -f "depth/$n-mask.png"
