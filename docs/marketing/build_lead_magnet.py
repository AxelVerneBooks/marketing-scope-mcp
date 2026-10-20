#!/usr/bin/env python3
"""marketing-scope-mcp lead magnet — one-page offer scoring checklist (US Letter).

Deterministic: python3 build_lead_magnet.py -> lead-magnet-offer-scoring-checklist.pdf
Sister layout to Track C's sources-scoring checklist.
"""
from reportlab.lib.pagesizes import LETTER
from reportlab.pdfgen import canvas
from reportlab.pdfbase.pdfmetrics import stringWidth

W, H = LETTER  # 612 x 792
CREAM = (0.96, 0.94, 0.89)
INK = (0.12, 0.16, 0.22)
SLATE = (0.22, 0.28, 0.35)
GREEN = (0.25, 0.48, 0.38)

OUT = "docs/marketing/lead-magnet-offer-scoring-checklist.pdf"


def wrapped(c, text, x, y, maxw, font="Helvetica", size=9.5, leading=12.5):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if stringWidth(t, font, size) <= maxw:
            cur = t
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    for ln in lines:
        c.setFont(font, size)
        c.setFillColorRGB(*INK)
        c.drawString(x, y, ln)
        y -= leading
    return y


c = canvas.Canvas(OUT, pagesize=LETTER)
c.setTitle("Campaign Pre-Flight — the one-page offer scoring checklist")
c.setAuthor("marketing-scope-mcp")

# background
c.setFillColorRGB(*CREAM)
c.rect(0, 0, W, H, stroke=0, fill=1)

# header band
c.setFillColorRGB(*INK)
c.rect(0, H - 92, W, 92, stroke=0, fill=1)
c.setFillColorRGB(1, 1, 1)
c.setFont("Helvetica-Bold", 21)
c.drawString(40, H - 44, "CAMPAIGN PRE-FLIGHT")
c.setFont("Helvetica", 10.5)
c.setFillColorRGB(0.85, 0.87, 0.9)
c.drawString(40, H - 62, "Score any offer 0–100 in under a minute — the rubric marketing-scope-mcp runs mechanically.")
# version stamp
c.setFont("Helvetica-Bold", 10.5)
c.drawRightString(W - 40, H - 44, "rubric v1 · server 0.1.0")

# the pipeline line
y = H - 118
c.setFillColorRGB(*SLATE)
c.setFont("Helvetica-Bold", 11)
c.drawString(40, y, "The loop:  plan_campaign  →  score_offer  →  build_plan  →  check_plan")
y -= 8
c.setFont("Helvetica", 9)
c.drawString(40, y - 10, "Gate rule: build_plan rejects any offer never scored. check_plan fails any tactic missing a scored-offer citation [On] or a success metric.")

# five dimensions table
y -= 34
rows = [
    ("offer clarity", "20", "Has a price (or an explicit free). Names the concrete deliverable. No vague words."),
    ("audience specificity", "24", "Named segment you could picture. Speaks second person. ≥1 specific stat or bracket."),
    ("differentiation", "20", "Says what it is instead of (only/first/unlike). Names the mechanism why it works."),
    ("proof & risk reversal", "20", "Guarantee, testimonial, or countable proof. Track record or publication credit."),
    ("call to action", "16", "Actionable verb (start/join/get). Urgency or deadline if it's real."),
]
c.setFillColorRGB(*INK)
c.rect(40, y - len(rows) * 15 - 26, W - 80, 18, stroke=0, fill=1)
c.setFillColorRGB(1, 1, 1)
c.setFont("Helvetica-Bold", 9.5)
c.drawString(48, y - len(rows) * 15 - 21, "DIMENSION")
c.drawString(195, y - len(rows) * 15 - 21, "WEIGHT")
c.drawString(240, y - len(rows) * 15 - 21, "SCORES POINTS WHEN...")
# rows drawn BELOW the header band, marching upward from the header line
crow = y - len(rows) * 15 - 34
for name, wt, desc in rows:
    c.setFillColorRGB(*INK)
    c.setFont("Helvetica-Bold", 9.5)
    c.drawString(48, crow, name)
    c.setFont("Helvetica", 9.5)
    c.drawString(195, crow, "/ " + wt)
    y2 = wrapped(c, desc, 240, crow, W - 285, size=8.7, leading=10.5)
    crow = min(crow, y2) - 4.5
y = crow - 8

# grade bands
c.setFillColorRGB(*SLATE)
c.setFont("Helvetica-Bold", 10)
c.drawString(40, y, "Grades:   A ≥ 80    B ≥ 65    C ≥ 45    D < 45")
y -= 16
wrapped(c, "Kill rules: every scored offer below 45/100 → STOP, rework the offer before spending anything on traffic.  "
           "One week of no traction with an A/B offer live → re-plan instead of raising spend.  "
           "CPA above 1/3 of first-order profit for 7+ days → kill the channel.", 40, y, W - 80, size=9, leading=11.5)
y -= 30

# flags panel
c.setFillColorRGB(*CREAM)
c.setFillColorRGB(*INK)
c.setFont("Helvetica-Bold", 10)
c.drawString(40, y, "The flags are the to-do list:")
y -= 13
for flag, meaning in [
    ("no-price", "no price token found — the offer literally doesn't state the cost"),
    ("no-proof", "no guarantee, testimonial, or countable evidence"),
    ("unclear-audience", "no named segment; the offer could be for anyone (so it's for no one)"),
    ("no-cta", "no actionable verb — the reader isn't told what to do"),
    ("no-concrete-deliverable", "no deliverable word (guide/kit/ledger/session…); is anything actually for sale?"),
]:
    c.setFillColorRGB(*GREEN)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(52, y, flag)
    wrapped(c, meaning, 190, y, W - 235, size=9, leading=11)
    y -= 14
y -= 6

# campaign shell + gate
c.setFillColorRGB(*INK)
c.setFont("Helvetica-Bold", 10)
c.drawString(40, y, "The plan gate (one tactic per line):")
y -= 13
y2 = wrapped(c, "[O1] Send 3-email welcome sequence to list introducing [O1]; metric: 35% open / 3% CTR      ← PASSES "
           "(cites a scored offer AND names a metric)", 46, y, W - 90, size=9, leading=11.5)
y = min(y, y2) - 2
y2 = wrapped(c, "Blast retargeting at everyone on the internet      ← FAILS: no [On] citation, no metric "
           "(check_plan returns the orphan list — never a silent pass)", 46, y, W - 90, size=9, leading=11.5)
y = min(y, y2) - 2
y -= 22

# footer
c.setStrokeColorRGB(*SLATE)
c.setLineWidth(1)
c.line(40, 64, W - 40, 64)
y = 50
wrapped(c, "Free one-pager from marketing-scope-mcp — plan/score/build/check pipeline that refuses unscored offers "
           "and metric-less tactics before a dollar moves. github.com/AxelVerneBooks/marketing-scope-mcp · registry: "
           "io.github.AxelVerneBooks/marketing-scope-mcp (v0.1.0, active). Want the machine? $9 Starter kit → alohahilo.gumroad.com",
        40, y, W - 80, size=8, leading=10)

c.save()
print("wrote", OUT)
