# Patches a local copy of the demo's built bundle for the hero fly-over (never the warehouse repo itself):
# the big warehouse, full detail at any distance, no camera damping, 3D up to 3x with no auto resolution.
# usage: python3 patch-demo-bundle.py <copy>/assets/index-*.js [--same-size] [--keep-damping]
# `--same-size` keeps the demo's own warehouse (the hero with the app's panels around the map).
# `--keep-damping` keeps the camera's easing, for the real-time recordings (steps and tiles), where the mouse drives it.
import re
import sys

path = sys.argv[1]
s = open(path).read()


def sub(name, pattern, repl):
    global s
    s, n = re.subn(pattern, repl, s)
    if n != 1:
        sys.exit(f'{name}: expected one match, found {n}')
    print('ok', name)


# The site seeds the 'medium' warehouse; 'large' with four bands each side is about three times its area.
if '--same-size' not in sys.argv:
    sub('large warehouse', r'=(\w+)\(`medium`\)', r'=\1(`large`)')
    sub('four bands', r'large:\{varied:!0,x0:', 'large:{varied:!0,bands:4,x0:')
# Shelf boxes: near detail (every carton) at any distance; box tape and labels too; robots never simplified.
sub('box detail', r'(\w+)=(\w+)<110\?0:\2<380\?1:2', r'\1=\2<1e9?0:\2<380?1:2')
sub('fine detail', r'fineDetail&&\((\w+)\.visible=(\w+)<140\)', r'fineDetail&&(\1.visible=\2<1e9)')
# Rack steelwork too: beams, braces and bolts stay at any distance (the demo drops them far away).
sub('rack parts', r'(\w+)===0&&(\w+)<100:(\w+)===`brace`\?\2<260:\3!==`beam`\|\|\2<380', r'\1===0:\3===`brace`?!0:!0')
sub('robot detail', r'distanceTo\((\w+)\.g\.position\)>150', r'distanceTo(\1.g.position)>1e9')
# Frame-by-frame capture: no camera damping, 3D up to 3x, no resolution governor.
if '--keep-damping' not in sys.argv:
    sub('no damping', r'\.enableDamping=!0', '.enableDamping=!1')
sub('3x', r'Math\.min\(devicePixelRatio,1\.5\)', 'Math.min(devicePixelRatio,3)')
sub('no governor', r'function (\w+)\((\w+)\)\{let (\w+)=(\w+)\.frame\(\2,(\w+)\.getPixelRatio\(\),(\w+)\);\3!==\5\.getPixelRatio\(\)&&\5\.setPixelRatio\(\3\)\}',
    r'function \1(\2){}')
open(path, 'w').write(s)
