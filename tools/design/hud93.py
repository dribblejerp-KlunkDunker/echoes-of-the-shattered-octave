# Phase 93 flight-card mock, drawn in code (no random numbers: hashed noise from position)
from PIL import Image, ImageDraw, ImageFont
import math
W,H=1280,720
im=Image.new('RGB',(W,H)); d=ImageDraw.Draw(im)
def h(x,y):
    n=(x*374761393+y*668265263)&0xffffffff; n=(n^(n>>13))*1274126177&0xffffffff; return ((n^(n>>16))&0xffff)/65535
# dusk sky, lilac to slate
for y in range(H):
    t=y/H; c=(int(58+40*t),int(54+30*t),int(78+18*t)); d.line([(0,y),(W,y)],fill=c)
# cloud bands
for b,(yy,col) in enumerate([(250,(96,90,112)),(330,(110,104,124)),(410,(124,118,136))]):
    for x in range(0,W,4):
        off=int(18*math.sin(x/90+b)+10*h(x//40,b))
        d.rectangle([x,yy+off,x+4,yy+off+60+b*10],fill=col)
font=lambda s: ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf',s)
fb=lambda s: ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf',s)
# the courier-cutter: lead-grey hull, four drift-tanks in a cage, brass horn on the bow, gun forward, grapnel-thrower aft
cx,cy=600,200
d.polygon([(cx-150,cy),(cx+130,cy),(cx+170,cy-18),(cx+150,cy+22),(cx-140,cy+26)],fill=(92,96,104),outline=(40,42,48))
d.rectangle([cx-70,cy-58,cx+50,cy-4],outline=(50,52,58),width=3)
for i in range(4):
    x=cx-58+i*28; d.ellipse([x,cy-52,x+22,cy-10],fill=(70,110,160),outline=(30,40,60))
d.polygon([(cx+150,cy-6),(cx+205,cy-34),(cx+214,cy+10),(cx+152,cy+6)],fill=(196,150,70),outline=(110,80,30))  # the horn
d.line([(cx+120,cy-8),(cx+175,cy-30)],fill=(30,30,34),width=5)  # long gun on its swivel
d.line([(cx-140,cy-2),(cx-175,cy-26)],fill=(30,30,34),width=4)  # grapnel-thrower aft
for i in range(6): d.text((cx-110+i*30,cy+4),'·',fill=(200,200,210))
# the Kestrel's rail and deck in the foreground
d.polygon([(0,600),(W,560),(W,H),(0,H)],fill=(84,60,38))
for x in range(0,W,46): d.rectangle([x,560+int((W-x)/W*40)-60,x+8,610],fill=(64,44,26))
d.line([(0,548),(W,508)],fill=(104,76,48),width=10)
# HUD panel (left)
P=(18,18,320,520); d.rectangle(P,fill=(20,18,22),outline=(170,140,80),width=2)
d.text((34,26),'THE KESTREL',font=fb(20),fill=(226,200,140))
# height
d.text((34,62),'Height',font=font(15),fill=(220,210,190))
x0,y0,y1=40,90,330
d.rectangle([x0,y0,x0+26,y1],outline=(170,140,80))
bands=[('ceiling — tanks sing sour',900),('cloud base',600),('trees and roofs',120),('the deck',0)]
mx=1000
for name,ft in bands:
    yy=y1-(y1-y0)*ft/mx; d.line([(x0,yy),(x0+40,yy)],fill=(150,130,90)); d.text((x0+46,yy-9),f'{ft} ft  {name}',font=font(12),fill=(190,180,160))
cur=640; yy=y1-(y1-y0)*cur/mx; d.polygon([(x0+28,yy),(x0+40,yy-7),(x0+40,yy+7)],fill=(240,210,120)); d.text((x0-4,yy-30),'640',font=fb(14),fill=(240,210,120))
# lift
d.text((34,346),'Lift',font=font(15),fill=(220,210,190))
for i,(st,col) in enumerate([('sound',(90,150,200)),('sound',(90,150,200)),('weeping',(70,90,170)),('sour',(150,140,90))]):
    x=40+i*66; d.rectangle([x,372,x+52,412],fill=col,outline=(30,30,40)); d.text((x+2,416),f'No. {i+1}',font=font(11),fill=(200,190,170)); d.text((x+2,430),st,font=font(11),fill=(200,190,170))
    if st=='weeping':
        for k in range(6): d.ellipse([x+30+k*3,360-k*6,x+36+k*3,366-k*6],fill=(80,110,200))
d.text((40,452),'carrying 17 souls · water 1 day',font=font(12),fill=(190,180,160))
d.rectangle([40,472,300,484],outline=(170,140,80)); d.rectangle([41,473,41+int(258*0.99),483],fill=(170,120,70))
d.line([(41+int(258*0.95),468),(41+int(258*0.97),488)],fill=(240,240,240),width=2); d.text((40,490),'weight 104% of lift — sinking slowly',font=font(12),fill=(220,170,140))
# noise and horn (right panel)
Q=(W-340,18,W-18,250); d.rectangle(Q,fill=(20,18,22),outline=(170,140,80),width=2)
d.text((W-324,26),'Noise',font=fb(18),fill=(226,200,140))
srcs=[('the crates (half packed)',0.45),('tank No. 4, sour',0.2),('voices',0.05),('mist',-0.25)]
y=58
for name,v in srcs:
    d.text((W-322,y),name,font=font(12),fill=(200,190,170))
    bx=W-130; w=int(abs(v)*200)
    d.rectangle([bx,y+2,bx+w,y+12],fill=(200,120,80) if v>0 else (120,150,190)); y+=22
d.text((W-324,y+6),'The horn',font=fb(18),fill=(226,200,140))
states=['swivelling','pausing','turned','coming']
for i,s in enumerate(states):
    x=W-322+i*78; on=(i==1)
    d.rounded_rectangle([x,y+36,x+72,y+64],radius=6,fill=(196,150,70) if on else (40,36,40),outline=(170,140,80))
    d.text((x+6,y+42),s,font=font(12),fill=(20,18,22) if on else (180,170,150))
d.text((W-322,y+72),'It has stopped swivelling.',font=font(12),fill=(230,200,150))
# stations bar
S=['The wheel: "Into the cloud."','Tank-cradle: patch No. 3','Hold: pack the crates','Rail: two grapnels','Lamps: dark']
x=340
for s in S:
    tw=d.textlength(s,font=font(13)); d.rounded_rectangle([x,664,x+tw+20,696],radius=6,fill=(26,22,24),outline=(170,140,80)); d.text((x+10,671),s,font=font(13),fill=(220,205,170)); x+=tw+30
d.text((340,632),'Phase 93 flight card — a mock for the owner\'s ruling [PROPOSED]',font=font(13),fill=(230,220,200))
im.save('/home/claude/echoes-of-the-shattered-octave/screenshots/p93/hud-mock.jpg',quality=88)
