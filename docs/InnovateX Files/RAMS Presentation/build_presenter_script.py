"""Build the Word rehearsal script from the exhibit's own chapter cues."""

import json
from pathlib import Path
import subprocess

from docx import Document
from docx.enum.style import WD_STYLE_TYPE
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


ROOT = Path(__file__).resolve().parent
OUT = ROOT / "public" / "presenters"


def add_script_style(doc, name, size, *, bold=False, after=3, before=0):
    style = doc.styles.add_style(name, WD_STYLE_TYPE.PARAGRAPH)
    style.base_style = doc.styles["Normal"]
    style.font.size = Pt(size)
    style.font.bold = bold
    style.paragraph_format.space_before = Pt(before)
    style.paragraph_format.space_after = Pt(after)
    return style


def add_rows(doc, rows):
    for action, line in rows:
        doc.add_paragraph(action, "Stage cue")
        doc.add_paragraph(line, "Spoken line")


def main():
    cues = json.loads((ROOT / "src/presenter-cues.json").read_text(encoding="utf-8"))
    # Read the selected chapter, presenter and stopwatch ranges from the website.
    command = """import {acts, program} from './src/program.js';
      const route = compact => Object.fromEntries(program(compact).map(c =>
        [c.id, {title:c.title, speaker:acts[c.actIndex].speaker, timing:c.timing}]));
      console.log(JSON.stringify({full:route(false), finals:route(true)}));"""
    routes = json.loads(subprocess.check_output(
        ["node", "--input-type=module", "-e", command], cwd=ROOT, encoding="utf-8"
    ))
    doc = Document()
    section = doc.sections[0]
    section.page_width, section.page_height = Inches(8.27), Inches(11.69)
    section.left_margin, section.right_margin = Inches(.86), Inches(.84)
    section.top_margin, section.bottom_margin = Inches(.77), Inches(.76)
    section.header_distance, section.footer_distance = Inches(.34), Inches(.35)
    normal = doc.styles["Normal"]
    normal.font.name = "Calibri"
    normal.font.size = Pt(12)
    normal.font.color.rgb = RGBColor.from_string("111111")
    normal.paragraph_format.line_spacing = 1.10
    for name, size in [("Title", 25), ("Heading 1", 22), ("Heading 2", 16)]:
        style = doc.styles[name]
        style.font.name, style.font.size = "Calibri", Pt(size)
        style.font.bold = True
        style.font.color.rgb = RGBColor.from_string("000000")
        style.paragraph_format.space_before = Pt(7 if name == "Heading 2" else 0)
        style.paragraph_format.space_after = Pt(3)
        style.paragraph_format.keep_with_next = True
        for border in style.element.xpath("./w:pPr/w:pBdr"):
            border.getparent().remove(border)
    speaker = add_script_style(doc, "Speaker and time", 11, bold=True, after=7)
    speaker.paragraph_format.keep_with_next = True
    stage = add_script_style(doc, "Stage cue", 10.5, bold=True, after=1, before=3)
    stage.paragraph_format.keep_with_next = True
    spoken = add_script_style(doc, "Spoken line", 12, after=6)
    spoken.paragraph_format.keep_together = True
    read = add_script_style(doc, "Reading note", 10.5, after=9)
    read.font.italic = True
    head = section.header.paragraphs[0]
    head.add_run("RAMS   /   ROAD ACCIDENT MONITORING SYSTEM").font.size = Pt(8.5)
    foot = section.footer.paragraphs[0]
    foot.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    foot.add_run("InnovateX 2026     /     Presenter script     /     ").font.size = Pt(9)
    field = OxmlElement("w:fldSimple")
    field.set(qn("w:instr"), "PAGE")
    foot._p.append(field)
    doc.core_properties.title = "RAMS presenter script"
    doc.core_properties.subject = "Five presenters, timed spoken lines and exhibit controls"

    def page(title, introduction=None):
        first = len(doc.paragraphs) == 0
        p = doc.add_paragraph(title, "Title" if first else "Heading 1")
        p.paragraph_format.page_break_before = not first
        if introduction:
            doc.add_paragraph(introduction, "Reading note")

    def chapter(key, route):
        record = routes[route][key]
        doc.add_heading(record["title"], level=2)
        doc.add_paragraph(f'{record["speaker"]}    /    {record["timing"]}', "Speaker and time")
        add_rows(doc, cues["chapters"][key][route])

    finals_pages = [
        ("RAMS presenter script", ["overview", "team", "problem", "scenarios"]),
        ("Finals talk   /   Motion and hardware", ["calibration", "assistant", "hardware"]),
        ("Finals talk   /   From radio to response", ["relay", "desktop", "validation", "impact"]),
    ]
    for index, (title, ids) in enumerate(finals_pages):
        page(title, "Six-minute finals talk. Bold lines are operator cues. Read the words beneath them aloud. Choose Finals talk before opening the overview. Times are elapsed from the start of the talk. The full exhibit and additional controls follow." if index == 0 else None)
        for key in ids:
            chapter(key, "finals")
    page("Four-minute prototype demonstration",
         "Live demonstration plan. Use a team-controlled receiver, station and fictional test profile. Rehearse with the exact phone and carrier you will take to the venue. Start the clock after the research talk.")
    add_rows(doc, [
        ("0:00–0:45   Show the fabricated carrier and the paired Android phone. Point out the receiver beside the station.",
         "This is the SuperMini carrier we built. The phone supplies the motion readings and location. Look at the connection state on the phone, then at the receiver connected to the station."),
        ("0:45–1:30   Open AI Guard. Find SAFETY SIMULATION LAB. Show the station’s latest event before tapping Severe Crash once.",
         "This control injects a test alarm. It lets us demonstrate the reporting path without asking anyone to fall. The preset describes the scenario. We will read the values that actually reach the station."),
        ("1:30–2:45   Show the phone alarm, then switch to the live station. Look for a new event matching the test device and time.",
         "The phone has raised an alarm. Its local record tells us the test started. We look for a separate new record here to establish whether the receiver delivered it."),
        ("2:45–3:35   If received, open the new event and read its displayed device, time and position status. If it is absent, keep the actual screen visible.",
         "If received: “Here is the new report for our test device. This is the time and location status recorded by the station.” If absent: “The phone raised the test alarm. We have not confirmed receipt at this station.”"),
        ("3:35–4:00   Point back to the source phone and receiving station. Hand over to questions.",
         "This shows what we observed on this equipment today. A field trial needs many labeled events and many transmissions to estimate detection and delivery performance."),
    ])
    page("Five-minute research defense", "Any officially registered student researcher may answer. Choose the relevant evidence and leave time for the panel’s follow-up.")
    add_rows(doc, [
        ("Why use motion rules on a phone?",
         "The rider already carries the sensors. The phone can evaluate a motion window without an internet request. We can inspect which threshold fired and reproduce a wrong subtype on the same inputs."),
        ("What does the replay establish?",
         "On precomputed features from 121 generated fixtures, the classifier matched 33 accident flags and 88 benign flags. All eleven falls received the severe-collision label and all eleven potholes received the wind-flutter label. We need independent, labeled field sessions to estimate real-world performance."),
        ("If a judge cites 94% sensitivity and specificity from the earlier manuscript, which evidence supports today's slide?",
         "The earlier manuscript reports a different set of 100 trials. We do not have the trial-level logs for those percentages in this evidence package. The results shown today come from the reproducible 121-fixture replay."),
        ("Does tapping Severe Crash test detection?",
         "It injects an alarm. A matching new station record shows the alert traveled on this setup. We evaluate the motion decision separately using labeled sensor inputs."),
        ("Did RAMS learn new weights each time someone dismissed an alarm?",
         "Dismissing an alarm records the action and requests cancellation. The application has a separate profile-learning function. The dismissal handler does not call it."),
        ("What did generative AI contribute to development?",
         "Gemini in Antigravity helped implement motion rules, communications and station software. Antigravity sessions wrote and ran the scripts for synthetic motion fixtures, text command variants and assistant Q&A. Claude and ChatGPT assisted the custom PCB work. Codex helped check the evidence and prepare the exhibit. We can show the code, fixtures and compiled replay behind the reported counts."),
        ("How would you protect participants and judge feasibility?",
         "Use consenting participants, test identifiers and controlled motions. Limit access to identifiable locations and agree on a retention period before collection. Measure missed events, false reports, radio coverage and battery runtime before deployment."),
    ])
    pages = [
        ("Full exhibit   /   Research brief", ["overview", "team", "problem"]),
        ("Full exhibit   /   On the road", ["pairing", "scenarios"]),
        ("Full exhibit   /   The rider and the phone", ["mobile", "detection"]),
        ("Full exhibit   /   Motion evidence", ["datasets", "calibration"]),
        ("Full exhibit   /   Assistant and circuit boards", ["assistant", "hardware"]),
        ("Full exhibit   /   The radio handoff", ["relay"]),
        ("Full exhibit   /   The rescue desk", ["desktop", "validation"]),
        ("Full exhibit   /   Closing and demonstration", ["impact"]),
    ]
    for index, (title, ids) in enumerate(pages):
        page(title, "Choose Full exhibit for the 17-minute 30-second walkthrough. Each speaker can keep this script open on a second screen. Use the additional controls after the walkthrough for questions." if index == 0 else None)
        for key in ids:
            chapter(key, "full")
    page("Other controls and questions", "Use these lines when revisiting a chapter. They sit outside the timed script.")
    doc.add_heading("Navigation", level=2)
    add_rows(doc, cues["navigation"])
    for title, ids in [
        ("Road controls and evidence questions", ["overview", "problem", "pairing", "scenarios", "validation", "impact"]),
        ("Motion atlas controls", ["datasets"]),
        ("Calibration and station controls", ["calibration", "hardware", "relay", "desktop"]),
    ]:
        page(title)
        for key in ids:
            if cues["chapters"][key]["more"]:
                doc.add_heading(routes["full"][key]["title"], level=2)
                add_rows(doc, cues["chapters"][key]["more"])
    OUT.mkdir(parents=True, exist_ok=True)
    doc.save(OUT / "RAMS Presenter Script.docx")


if __name__ == "__main__":
    main()
