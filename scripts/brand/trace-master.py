"""
Traces brand/reference/lpdr-logo.png into the layered master SVG at brand/lpdr-master.svg.

Not part of the app build. Needs the potrace CLI (brew install potrace) and Python with
pillow, numpy and scipy. Run from the repo root:

  python3 scripts/brand/trace-master.py

Every layer is traced from the same bitmap, so the layers line up exactly with the source.
Ink layers that were cut apart (ear from head, iris from eye ring, paws from body) overlap by a
couple of pixels so no hairline seam shows where they meet.
"""

import re
import subprocess
import tempfile
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'brand/reference/lpdr-logo.png'
OUT = ROOT / 'brand/lpdr-master.svg'

UP = 4  # trace at 4x so edges keep their sub-pixel antialiasing
OVERLAP = 2  # px (source scale) a cut layer reaches under its neighbour

gray = np.asarray(Image.open(SOURCE).convert('L')).astype(np.float32)
H, W = gray.shape
ink = gray < 128
paper = ~ink

big = np.asarray(Image.fromarray(gray.astype(np.uint8)).resize((W * UP, H * UP), Image.LANCZOS)).astype(np.float32)
# a touch of blur so the threshold follows the drawn edge, not the compression noise along it
big = nd.gaussian_filter(big, 1.6)
ink_big = big < 128


def disk(r):
    y, x = np.ogrid[-r : r + 1, -r : r + 1]
    return x * x + y * y <= r * r


def grow(mask, r):
    return nd.binary_dilation(mask, disk(r)) if r > 0 else mask


def shrink(mask, r):
    return nd.binary_erosion(mask, disk(r)) if r > 0 else mask


def up(mask):
    """Upscale a mask to the 4x bitmap with smooth edges, so a cut through the ink traces as a curve, not a staircase."""
    return nd.gaussian_filter(np.repeat(np.repeat(mask, UP, 0), UP, 1).astype(np.float32), UP * 0.7) > 0.5


def circle(cx, cy, r):
    yy, xx = np.mgrid[0:H, 0:W]
    return (xx - cx) ** 2 + (yy - cy) ** 2 <= r * r


ink_lab, _ = nd.label(ink)
paper_lab, _ = nd.label(paper)


def ink_comp(x, y):
    assert ink[y, x], f'ink seed ({x}, {y}) is on paper'
    return ink_lab == ink_lab[y, x]


def paper_comp(x, y):
    assert paper[y, x], f'paper seed ({x}, {y}) is on ink'
    return paper_lab == paper_lab[y, x]


# ── Segmentation (source pixel coordinates) ─────────────────────────────

main = ink_comp(700, 700)  # head, body, left ear, ground
ear_right = ink_comp(1050, 450)
butterfly_and_face = ink_comp(880, 300)  # butterfly touches the nose, nose runs into the smile
yy, xx = np.mgrid[0:H, 0:W]

# Wordmark: every component below the ground line
wordmark = ink & (yy >= 745)
little_paws = wordmark & (yy < 965)
dachshund_rescue = wordmark & (yy >= 965)
main &= yy < 745

# Left ear joins the head only above the tip of its white inner stripe. Cut it there.
cut = np.zeros_like(main)
for t in np.linspace(0, 1, 200):
    x = int(round(529 + (516 - 529) * t))
    y = int(round(237 + (214 - 237) * t))
    cut[y - 1 : y + 2, x - 1 : x + 2] = True
ear_left_lab, _ = nd.label(main & ~cut)
ear_left = ear_left_lab == ear_left_lab[500, 330]
ear_left = grow(ear_left, 3) & main  # take back the cut pixels

# Butterfly vs nose/mouth: the butterfly's foot touches the top of the nose at y≈262
butterfly = butterfly_and_face & (yy < 266)
nose_region = ((xx - 876) / 64.0) ** 2 + ((yy - 306) / 50.0) ** 2 <= 1
# Above y=266 only the nose may overlap the butterfly. The mouth layer used to keep a copy of the wings' lower edge there,
# which stayed still on the nose while the wings fluttered.
face_features = butterfly_and_face & (yy >= 258) & ((yy >= 266) | nose_region)
# Two bits of the butterfly's feet were left in the nose layer: a peg standing on the nose top and the tip of the right foot.
# They belong to the butterfly, so the peg is dropped (the body already covers it) and the tip goes to the body.
face_features &= ~((xx >= 877) & (xx <= 888) & (yy < 261))
foot_bits, n_bits = nd.label(face_features, structure=np.ones((3, 3)))
for k in range(1, n_bits + 1):
    if (foot_bits == k).sum() < 60:
        butterfly |= foot_bits == k
        face_features &= foot_bits != k
nose = face_features & nose_region
mouth = face_features & ~shrink(nose_region, OVERLAP)

# Butterfly body (head, antennae, thorax, legs) vs wings. Everything that stays still on the nose belongs to the body,
# including both feet; the wing root beside the hinge belongs to the wings so it moves with them
poly_img = Image.new('1', (W, H), 0)
ImageDraw.Draw(poly_img).polygon(
    [(812, 160), (868, 160), (886, 205), (889, 236), (913, 251), (930, 258), (932, 270), (860, 270), (858, 232), (812, 204)], fill=1
)
body_poly = np.asarray(poly_img).astype(bool)
butterfly_body = butterfly & body_poly
butterfly_wings = butterfly & ~shrink(body_poly, OVERLAP)
wing_panels = np.zeros_like(paper)
for lab in np.unique(paper_lab[paper & (yy < 246) & (xx > 860)]):
    comp = paper_lab == lab
    ys, xs = np.nonzero(comp)
    if ys.min() > 40 and xs.min() > 860 and ys.max() < 246 and comp.sum() > 100:
        wing_panels |= comp


def fit_iris(cx, cy, r_min, r_max):
    """Fit a circle to where the iris meets the white of the eye, casting rays out from the catchlight."""
    pts = []
    for a in np.linspace(0, 2 * np.pi, 720, endpoint=False):
        seen_ink = False
        for r in np.arange(4, r_max + 15, 0.5):
            x, y = cx + r * np.cos(a), cy + r * np.sin(a)
            xi, yi = int(round(x)), int(round(y))
            if ink[yi, xi]:
                seen_ink = True
            elif seen_ink:
                pts.append((x, y))
                break
    p = np.array(pts)
    # RANSAC: rays that ran into the coat or the brow land all over the place, the sclera edge is one
    # consistent arc, so keep the circle the most edge points agree with
    rng = np.random.default_rng(1)
    best, best_n = None, 0
    for _ in range(4000):
        a, b, c = p[rng.choice(len(p), 3, replace=False)]
        A = np.array([[2 * (b - a)[0], 2 * (b - a)[1]], [2 * (c - a)[0], 2 * (c - a)[1]]])
        if abs(np.linalg.det(A)) < 1e-6:
            continue
        ux, uy = np.linalg.solve(A, [b @ b - a @ a, c @ c - a @ a])
        r = np.hypot(*(a - (ux, uy)))
        if not r_min < r < r_max:
            continue
        n = (np.abs(np.hypot(p[:, 0] - ux, p[:, 1] - uy) - r) < 1.2).sum()
        if n > best_n:
            best, best_n = (ux, uy, r), n
    ux, uy, r = best
    p = p[np.abs(np.hypot(p[:, 0] - ux, p[:, 1] - uy) - r) < 1.2]
    A = np.c_[2 * p[:, 0], 2 * p[:, 1], np.ones(len(p))]
    ux, uy, c = np.linalg.lstsq(A, (p**2).sum(1), rcond=None)[0]
    return ux, uy, np.sqrt(c + ux * ux + uy * uy)


eyes = {}
for side, (gx, gy), r_min, r_max, sclera_r in [('left', (656, 292), 30, 60, 30), ('right', (803, 222), 20, 45, 13)]:
    ix, iy, ir = fit_iris(gx, gy, r_min, r_max)
    iris_disk = circle(ix, iy, ir)
    catchlight = paper_comp(gx, gy)
    iris = ink & grow(iris_disk, OVERLAP) & main
    # the white of the eye: paper hugging the iris
    sclera = paper & circle(ix, iy, ir + sclera_r) & ~catchlight
    if side == 'right':
        sclera &= xx < ix + 6  # the right eye opens straight onto the face on its far side; only the crescent is eye-white
    sclera_lab, _ = nd.label(sclera)
    keep = np.zeros_like(sclera)
    for lab in np.unique(sclera_lab[grow(iris_disk, 3) & sclera]):
        if lab:
            keep |= sclera_lab == lab
    sclera = keep
    eyelid = nd.binary_fill_holes(grow(sclera | iris_disk, 3))
    eyes[side] = dict(iris=iris, iris_disk=iris_disk, catchlight=catchlight, sclera=sclera, eyelid=eyelid, fit=(ix, iy, ir))
    print(f'eye {side}: iris centre ({ix:.1f}, {iy:.1f}) r {ir:.1f}')

# Paws: the white pad plus its ink outline and toe lines
paws = {}
for side, (px, py) in [('left', (530, 660)), ('right', (860, 640))]:
    pad = paper_comp(px, py)
    region = nd.binary_fill_holes(nd.binary_closing(grow(pad, 11), disk(6)))
    paws[side] = dict(ink=ink & region & main, pad=pad, region=region)

# Ground line: the tapered stroke beyond the body on either side, so compositions can shorten it
ground_band = (yy >= 668) & main
GROUND_CUT = (455, 990)
ground_left = ground_band & (xx < GROUND_CUT[0])
ground_right = ground_band & (xx > GROUND_CUT[1])

# What is left is the head and body
body = main.copy()
# like the ground pieces, the ear leaves the body entirely except where it joins the head; shrinking it would leave a ring of
# body ink around the whole ear that stays still when the ear twitches
body &= ~(ear_left & ~grow(cut, 8))
# the ground pieces are removed outright except for a strip at the seam; shrinking them would leave an outline of each taper behind
body &= ~(ground_left & (xx < GROUND_CUT[0] - OVERLAP))
body &= ~(ground_right & (xx > GROUND_CUT[1] + OVERLAP))
for e in eyes.values():
    body &= ~e['iris_disk']  # whole disk, not a shrunk one: a ring left behind would stay still when the pupil moves
for p in paws.values():
    body &= ~shrink(p['region'], OVERLAP)

# ── Tracing ─────────────────────────────────────────────────────────────

# speckle size, corner threshold, curve tolerance (in 4x pixels), output precision
POTRACE = ['-t', '8', '-a', '1.0', '-O', '1.5', '-u', '20']
NUM = re.compile(r'-?\d*\.?\d+(?:e-?\d+)?')


def trace(mask):
    """Potrace the ink inside a source-scale mask and return SVG path data in source pixel units."""
    # grown by a pixel so the mask edge sits in the white and the ink edge is what gets traced
    return trace_bits(ink_big & up(grow(mask, 1)))


def to_absolute(d, tx, ty, sx, sy):
    tokens = re.findall(r'[MmLlCcZz]|' + NUM.pattern, d)
    out, i, cmd = [], 0, None
    cx = cy = sx0 = sy0 = 0.0

    def pt(x, y):
        return f'{(tx + x * sx) / UP:.2f} {(ty + y * sy) / UP:.2f}'

    while i < len(tokens):
        t = tokens[i]
        if t in 'MmLlCcZz':
            cmd = t
            i += 1
            if t in 'Zz':
                out.append('Z')
                cx, cy = sx0, sy0
            continue
        n = [float(v) for v in tokens[i : i + (6 if cmd in 'Cc' else 2)]]
        i += len(n)
        rel = cmd.islower()
        if cmd in 'Mm':
            cx, cy = (cx + n[0], cy + n[1]) if rel else (n[0], n[1])
            sx0, sy0 = cx, cy
            out.append('M' + pt(cx, cy))
            cmd = 'l' if rel else 'L'
        elif cmd in 'Ll':
            cx, cy = (cx + n[0], cy + n[1]) if rel else (n[0], n[1])
            out.append('L' + pt(cx, cy))
        else:
            p = [(cx + n[k], cy + n[k + 1]) if rel else (n[k], n[k + 1]) for k in (0, 2, 4)]
            out.append('C' + ' '.join(pt(*q) for q in p))
            cx, cy = p[2]
    return ''.join(out)


def trace_paper(mask):
    """Trace a white region as a filled shape (the inverse of the ink)."""
    bits = ~ink_big & up(grow(mask, 1)) | up(shrink(mask, 2))
    return trace_bits(bits)


def trace_bits(bits):
    if not bits.any():
        return ''
    with tempfile.TemporaryDirectory() as tmp:
        pbm = Path(tmp) / 'in.pbm'
        svg = Path(tmp) / 'out.svg'
        Image.fromarray(~bits).save(pbm)  # PIL writes True as white; potrace traces black
        subprocess.run(['potrace', str(pbm), '-s', '--flat', *POTRACE, '-o', str(svg)], check=True)
        text = svg.read_text()
    m = re.search(r'translate\(([\d.]+),([\d.]+)\) scale\(([\d.]+),(-?[\d.]+)\)', text)
    tx, ty, sx, sy = map(float, m.groups())
    d = ' '.join(re.findall(r' d="([^"]+)"', text))
    return to_absolute(d, tx, ty, sx, sy)


def path(id_, d, cls):
    return f'<path id="{id_}" class="{cls}" d="{d}"/>'


def eye_group(side):
    e = eyes[side]
    ix, iy, ir = e['fit']
    sclera_d = trace_paper(e['sclera'])
    # the opening the pupil may move within: the whites of the eye and the iris disk at rest
    clip = f'<clipPath id="lpdr-eye-{side}-opening"><path d="{sclera_d}"/><circle cx="{ix:.2f}" cy="{iy:.2f}" r="{ir + 1.5:.2f}"/></clipPath>'
    return f'''<g id="lpdr-eye-{side}" data-layer="eye">
      {clip}
      {path(f'lpdr-sclera-{side}', sclera_d, 'lpdr-sclera')}
      <g clip-path="url(#lpdr-eye-{side}-opening)">
      <g id="lpdr-pupil-{side}" data-layer="pupil" data-cx="{ix:.2f}" data-cy="{iy:.2f}" data-r="{ir:.2f}">
        {path(f'lpdr-iris-{side}', trace(e['iris']), 'lpdr-iris')}
        {path(f'lpdr-catchlight-{side}', trace_paper(e['catchlight']), 'lpdr-glint')}
      </g>
      </g>
      {path(f'lpdr-eyelid-{side}', trace_bits(up(e['eyelid'])), 'lpdr-ink lpdr-eyelid')}
    </g>'''


def paw_group(side):
    p = paws[side]
    return f'''<g id="lpdr-paw-{side}" data-layer="paw">
      {path(f'lpdr-paw-{side}-pad', trace_paper(p['pad']), 'lpdr-paper')}
      {path(f'lpdr-paw-{side}-ink', trace(p['ink']), 'lpdr-ink')}
    </g>'''


def bbox(mask):
    ys, xs = np.nonzero(mask)
    return f'{xs.min()} {ys.min()} {xs.max() + 1 - xs.min()} {ys.max() + 1 - ys.min()}'


figure_mask = (main | ear_right | face_features) & ~ground_left & ~ground_right

# Bounding box of the character (everything above the wordmark)
char_ys, char_xs = np.nonzero(ink & (yy < 745))
CX0, CY0, CX1, CY1 = char_xs.min(), char_ys.min(), char_xs.max() + 1, char_ys.max() + 1
word_ys, word_xs = np.nonzero(wordmark)
WX0, WY0, WX1, WY1 = word_xs.min(), word_ys.min(), word_xs.max() + 1, word_ys.max() + 1
lp_ys, lp_xs = np.nonzero(little_paws)
dr_ys, dr_xs = np.nonzero(dachshund_rescue)
print('character bbox', CX0, CY0, CX1, CY1)
print('wordmark bbox', WX0, WY0, WX1, WY1)

# The coat's white markings are open to the background in places, so closing narrow gaps and filling holes gives the
# silhouette; it sits one pixel inside the ink edge so it never shows as a fringe
SILHOUETTE_CLOSE = 14
pad = SILHOUETTE_CLOSE * 2
kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (SILHOUETTE_CLOSE * 2 + 1,) * 2)
closed = cv2.morphologyEx(np.pad(figure_mask, pad).astype(np.uint8), cv2.MORPH_CLOSE, kernel)[pad:-pad, pad:-pad] > 0
silhouette = shrink(nd.binary_fill_holes(closed) & ~ground_left & ~ground_right & (yy < 745), 1)
silhouette_d = trace_bits(up(silhouette))
ground_left_d, ground_right_d = trace(ground_left), trace(ground_right)

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">
  <!--
    Little Paws Dachshund Rescue — master artwork.
    Traced from brand/reference/lpdr-logo.png by scripts/brand/trace-master.py. Coordinates are source pixels.
    Every composition reuses #lpdr-character and #lpdr-wordmark from this file; nothing is redrawn.

    Colour roles, each driven by a custom property of the same name set on any ancestor:
      .lpdr-ink        dachshund and type      currentColor
      .lpdr-paper      white markings          lpdr-paper, transparent
      .lpdr-sclera     whites of the eyes      lpdr-sclera, transparent
      .lpdr-iris       pupils                  lpdr-iris, currentColor
      .lpdr-glint      catchlights             lpdr-glint, transparent
      .lpdr-silhouette fill behind the coat     lpdr-paper, transparent (so markings stay light on dark)
      .lpdr-type       wordmark                lpdr-type, currentColor
      outline          lpdr-outline and lpdr-outline-width: a stroke around the silhouette, the ground line and the butterfly
      blink            lpdr-blink, 0 open to 1 closed, drives the eyelids
      ear twitch       lpdr-ear, 0 at rest to 1 flicked, swings the notched ear about where it joins the head
      gaze             lpdr-gaze-x (-1 left, 0 at the butterfly) and lpdr-gaze-y (0 at the butterfly, 1 down), shared by both pupils
      flutter          lpdr-flutter, 0 at rest to 1 fully beating, folds the wings about their hinge at the body
      .lpdr-wing       butterfly wing panels   lpdr-wing, white (set it to url(#lpdr-rainbow) for the rainbow variant)
      .lpdr-wing-sheen butterfly glint         lpdr-wing-sheen, transparent (url(#lpdr-rainbow-glint) for the rainbow variant)
  -->
  <defs>
    <style>
      .lpdr-ink {{ fill: currentColor; }}
      .lpdr-outlined {{ stroke: var(--lpdr-outline, none); stroke-width: var(--lpdr-outline-width, 0); stroke-linejoin: round; paint-order: stroke; }}
      .lpdr-outline {{ fill: var(--lpdr-outline, none); stroke: var(--lpdr-outline, none); stroke-width: var(--lpdr-outline-width, 0); stroke-linejoin: round; }}
      .lpdr-type {{ fill: var(--lpdr-type, currentColor); stroke: none; }}
      .lpdr-silhouette {{ fill: var(--lpdr-paper, transparent); stroke: var(--lpdr-outline, none); stroke-width: var(--lpdr-outline-width, 0); stroke-linejoin: round; }}
      .lpdr-paper {{ fill: var(--lpdr-paper, transparent); }}
      .lpdr-sclera {{ fill: var(--lpdr-sclera, transparent); }}
      .lpdr-iris {{ fill: var(--lpdr-iris, currentColor); }}
      .lpdr-glint {{ fill: var(--lpdr-glint, transparent); }}
      .lpdr-wings {{ transform: translate(882px, 236px) rotate(calc(var(--lpdr-flutter, 0) * -7deg)) scale(calc(1 - var(--lpdr-flutter, 0) * 0.3), calc(1 - var(--lpdr-flutter, 0) * 0.05)) translate(-882px, -236px); }}
      #lpdr-ear-left {{ transform: translate(524px, 226px) rotate(calc(var(--lpdr-ear, 0) * 1.5deg)) translate(-524px, -226px); }}
      #lpdr-pupil-left {{ transform: translate(calc(var(--lpdr-gaze-x, 0) * 9px), calc(var(--lpdr-gaze-y, 0) * 7px)); }}
      #lpdr-pupil-right {{ transform: translate(calc(var(--lpdr-gaze-x, 0) * 7.4px), calc(var(--lpdr-gaze-y, 0) * 5.7px)); }}
      .lpdr-eyelid {{ opacity: min(1, calc(var(--lpdr-blink, 0) * 1000)); transform: scaleY(var(--lpdr-blink, 0)); transform-box: fill-box; transform-origin: 50% 0; }}
      .lpdr-wing {{ fill: var(--lpdr-wing, #fff); }}
      .lpdr-wing-sheen {{ fill: var(--lpdr-wing-sheen, transparent); }}
    </style>
    <!-- the same six stops and 115° sweep as the homepage and Rainbow Bridge butterfly -->
    <linearGradient id="lpdr-rainbow" gradientUnits="userSpaceOnUse" x1="870" y1="70" x2="990" y2="250">
      <stop offset="0" stop-color="#f9a8d4"/>
      <stop offset=".2" stop-color="#fdba74"/>
      <stop offset=".4" stop-color="#fde68a"/>
      <stop offset=".6" stop-color="#86efac"/>
      <stop offset=".8" stop-color="#7dd3fc"/>
      <stop offset="1" stop-color="#c4b5fd"/>
    </linearGradient>
    <linearGradient id="lpdr-rainbow-glint" gradientUnits="userSpaceOnUse" x1="880" y1="90" x2="990" y2="200">
      <stop offset=".38" stop-color="#fff" stop-opacity="0"/>
      <stop offset=".5" stop-color="#fff" stop-opacity=".55"/>
      <stop offset=".62" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <g id="lpdr-logo" data-bbox="{bbox(ink)}">
  <g id="lpdr-character" data-bbox="{CX0} {CY0} {CX1 - CX0} {CY1 - CY0}">
    <g id="lpdr-ground-outline">
      <g id="lpdr-ground-outline-left" data-anchor-x="{GROUND_CUT[0]}">{path('lpdr-ground-left-outline', ground_left_d, 'lpdr-outline')}</g>
      <g id="lpdr-ground-outline-right" data-anchor-x="{GROUND_CUT[1]}">{path('lpdr-ground-right-outline', ground_right_d, 'lpdr-outline')}</g>
    </g>
    <g id="lpdr-figure" data-bbox="{bbox(figure_mask)}">
      {path('lpdr-silhouette', silhouette_d, 'lpdr-silhouette')}
      <g id="lpdr-ear-left" data-layer="ear">{path('lpdr-ear-left-ink', trace(ear_left), 'lpdr-ink lpdr-outlined')}</g>
      <g id="lpdr-ear-right" data-layer="ear">{path('lpdr-ear-right-ink', trace(ear_right), 'lpdr-ink')}</g>
      <g id="lpdr-body">{path('lpdr-body-ink', trace(body), 'lpdr-ink')}</g>
      {eye_group('left')}
      {eye_group('right')}
      <g id="lpdr-nose" data-layer="nose">{path('lpdr-nose-ink', trace(nose), 'lpdr-ink')}</g>
      <g id="lpdr-mouth">{path('lpdr-mouth-ink', trace(mouth), 'lpdr-ink')}</g>
      {paw_group('left')}
      {paw_group('right')}
    </g>
    <g id="lpdr-ground" data-bbox="{bbox(ground_left | ground_right)}">
      <g id="lpdr-ground-left" data-anchor-x="{GROUND_CUT[0]}">{path('lpdr-ground-left-ink', ground_left_d, 'lpdr-ink')}</g>
      <g id="lpdr-ground-right" data-anchor-x="{GROUND_CUT[1]}">{path('lpdr-ground-right-ink', ground_right_d, 'lpdr-ink')}</g>
    </g>
    <g id="lpdr-butterfly" data-layer="butterfly" data-bbox="{bbox(butterfly)}">
      <g id="lpdr-butterfly-wings" class="lpdr-wings" data-layer="wings">
        {path('lpdr-wing-panels', trace_paper(wing_panels), 'lpdr-wing')}
        {path('lpdr-wing-sheen', trace_paper(wing_panels), 'lpdr-wing-sheen')}
        {path('lpdr-wing-ink', trace(butterfly_wings), 'lpdr-ink lpdr-outlined')}
      </g>
      <g id="lpdr-butterfly-body">{path('lpdr-butterfly-body-ink', trace(butterfly_body), 'lpdr-ink lpdr-outlined')}</g>
    </g>
  </g>
  <g id="lpdr-wordmark" data-bbox="{WX0} {WY0} {WX1 - WX0} {WY1 - WY0}">
    <g id="lpdr-wordmark-name" data-bbox="{lp_xs.min()} {lp_ys.min()} {lp_xs.max() + 1 - lp_xs.min()} {lp_ys.max() + 1 - lp_ys.min()}">{path('lpdr-wordmark-name-ink', trace(little_paws), 'lpdr-ink lpdr-type')}</g>
    <g id="lpdr-wordmark-tagline" data-bbox="{dr_xs.min()} {dr_ys.min()} {dr_xs.max() + 1 - dr_xs.min()} {dr_ys.max() + 1 - dr_ys.min()}">{path('lpdr-wordmark-tagline-ink', trace(dachshund_rescue), 'lpdr-ink lpdr-type')}</g>
  </g>
  </g>
</svg>
'''

OUT.parent.mkdir(exist_ok=True)
OUT.write_text(svg)
print(f'wrote {OUT.relative_to(ROOT)} ({len(svg) // 1024} KB)')
