import sys, os
from PIL import Image, ImageDraw
d, outp = sys.argv[1], sys.argv[2]
fs = sorted(f for f in os.listdir(d) if f.endswith('.jpg'))
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 3
w, h = 640, 360
rows = (len(fs) + cols - 1) // cols
S = Image.new('RGB', (cols * w, rows * (h + 26)), 'white'); D = ImageDraw.Draw(S)
for i, f in enumerate(fs):
    im = Image.open(os.path.join(d, f)).resize((w, h)); x, y = (i % cols) * w, (i // cols) * (h + 26)
    S.paste(im, (x, y + 26)); D.text((x + 6, y + 6), f, fill='black')
S.save(outp, quality=88)
