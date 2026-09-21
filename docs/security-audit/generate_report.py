#!/usr/bin/env python3
"""Gera docs/security-audit/relatorio-auditoria-seguranca.pdf a partir de findings-data.json.

Uso:
    cd docs/security-audit
    python3 -m venv .venv && source .venv/bin/activate
    pip install -r requirements.txt
    python3 generate_report.py

Reexecutar este script após editar findings-data.json regenera o PDF do zero.
"""
import json
import os
import textwrap

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    Image,
    KeepTogether,
    PageBreak,
    Paragraph,
    Preformatted,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "findings-data.json")
ASSETS_DIR = os.path.join(BASE_DIR, "assets")
OUTPUT_PATH = os.path.join(BASE_DIR, "relatorio-auditoria-seguranca.pdf")

# --------------------------------------------------------------------------
# Paleta hexadecimal do relatório — reaproveitada dos design tokens do
# próprio projeto (README_ARQUITETURA.md: --color-ifce-blue / --color-accent)
# para a marca, e uma paleta semântica fixa para severidade. Estas cores
# também estão documentadas em .claudecode/skills/audit-security.md para que
# auditorias futuras usem exatamente os mesmos valores.
# --------------------------------------------------------------------------
PALETTE = {
    "primary": "#0066B3",       # IFCE blue — capa, cabeçalhos, marca
    "primary_dark": "#004A82",
    "accent": "#00D97E",        # verde institucional — destaques positivos
    "dark": "#1F2937",          # texto principal
    "gray": "#6B7280",          # texto secundário
    "light_bg": "#F3F4F6",      # fundo de blocos
    "border": "#E5E7EB",
    "white": "#FFFFFF",
    "Crítico": "#B91C1C",
    "Alto": "#EA580C",
    "Médio": "#D97706",
    "Baixo": "#2563EB",
    "Informativo": "#16A34A",
}
SEVERITY_ORDER = ["Crítico", "Alto", "Médio", "Baixo"]  # severidades de fraqueza (gráficos)


def hexcolor(key_or_hex):
    value = PALETTE.get(key_or_hex, key_or_hex)
    return colors.HexColor(value)


def load_data():
    with open(DATA_PATH, encoding="utf-8") as f:
        return json.load(f)


def esc(text):
    """Escapa texto para uso dentro de reportlab.platypus.Paragraph (mini-XML)."""
    if text is None:
        return ""
    return (
        str(text)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


# --------------------------------------------------------------------------
# Gráficos (matplotlib) — rosca de severidade + barras empilhadas por categoria
# --------------------------------------------------------------------------
def build_charts(findings):
    os.makedirs(ASSETS_DIR, exist_ok=True)
    weaknesses = [f for f in findings if f["type"] == "weakness"]

    donut_path = os.path.join(ASSETS_DIR, "chart_severity.png")
    _build_donut(weaknesses, donut_path)

    bar_path = os.path.join(ASSETS_DIR, "chart_category.png")
    _build_category_bars(weaknesses, bar_path)

    return donut_path, bar_path


def _build_donut(weaknesses, out_path):
    counts = {sev: 0 for sev in SEVERITY_ORDER}
    for f in weaknesses:
        if f["severity"] in counts:
            counts[f["severity"]] += 1

    labels = [f"{sev} ({counts[sev]})" for sev in SEVERITY_ORDER if counts[sev] > 0]
    sizes = [counts[sev] for sev in SEVERITY_ORDER if counts[sev] > 0]
    colors_ = [PALETTE[sev] for sev in SEVERITY_ORDER if counts[sev] > 0]

    fig, ax = plt.subplots(figsize=(5.2, 4.4), dpi=200)
    wedges, _ = ax.pie(
        sizes,
        colors=colors_,
        startangle=90,
        counterclock=False,
        wedgeprops=dict(width=0.42, edgecolor="white", linewidth=2),
    )
    ax.text(
        0, 0.06, str(sum(sizes)), ha="center", va="center",
        fontsize=30, fontweight="bold", color=PALETTE["dark"],
    )
    ax.text(
        0, -0.18, "achados", ha="center", va="center",
        fontsize=11, color=PALETTE["gray"],
    )
    ax.legend(
        wedges, labels, title="Severidade", loc="center left",
        bbox_to_anchor=(1.0, 0.5), frameon=False, fontsize=10, title_fontsize=11,
    )
    ax.set_title("Distribuição de Achados por Severidade", fontsize=13, fontweight="bold",
                 color=PALETTE["dark"], pad=14)
    ax.axis("equal")
    fig.tight_layout()
    fig.savefig(out_path, transparent=False, facecolor="white", bbox_inches="tight")
    plt.close(fig)


def _build_category_bars(weaknesses, out_path):
    categories = []
    for f in weaknesses:
        if f["category"] not in categories:
            categories.append(f["category"])

    wrapped = ["\n".join(c.split(" ", 2)) if len(c) > 14 else c for c in categories]
    counts_by_cat_sev = {c: {sev: 0 for sev in SEVERITY_ORDER} for c in categories}
    for f in weaknesses:
        counts_by_cat_sev[f["category"]][f["severity"]] += 1

    fig, ax = plt.subplots(figsize=(7.6, 4.6), dpi=200)
    bottom = [0] * len(categories)
    for sev in SEVERITY_ORDER:
        values = [counts_by_cat_sev[c][sev] for c in categories]
        ax.bar(wrapped, values, bottom=bottom, color=PALETTE[sev], label=sev, width=0.55)
        for i, v in enumerate(values):
            if v > 0:
                ax.text(i, bottom[i] + v / 2, str(v), ha="center", va="center",
                        color="white", fontsize=10, fontweight="bold")
        bottom = [b + v for b, v in zip(bottom, values)]

    ax.set_ylabel("Nº de achados", fontsize=10, color=PALETTE["dark"])
    ax.set_title("Achados por Categoria (empilhado por severidade)", fontsize=13,
                 fontweight="bold", color=PALETTE["dark"], pad=14)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.tick_params(axis="x", labelsize=8.5, colors=PALETTE["dark"])
    ax.tick_params(axis="y", labelsize=9, colors=PALETTE["dark"])
    ax.yaxis.get_major_locator().set_params(integer=True)
    ax.legend(frameon=False, fontsize=9, ncol=4, loc="upper center", bbox_to_anchor=(0.5, -0.18))
    fig.tight_layout()
    fig.savefig(out_path, transparent=False, facecolor="white", bbox_inches="tight")
    plt.close(fig)


# --------------------------------------------------------------------------
# Estilos de texto
# --------------------------------------------------------------------------
def build_styles():
    ss = getSampleStyleSheet()
    styles = {
        "CoverTitle": ParagraphStyle(
            "CoverTitle", parent=ss["Title"], fontSize=26, leading=32,
            textColor=colors.white, alignment=TA_CENTER, fontName="Helvetica-Bold",
        ),
        "CoverSubtitle": ParagraphStyle(
            "CoverSubtitle", parent=ss["Normal"], fontSize=14, leading=18,
            textColor=colors.white, alignment=TA_CENTER, fontName="Helvetica",
        ),
        "CoverMeta": ParagraphStyle(
            "CoverMeta", parent=ss["Normal"], fontSize=10.5, leading=16,
            textColor=hexcolor("dark"), alignment=TA_LEFT, fontName="Helvetica",
        ),
        "H1": ParagraphStyle(
            "H1", parent=ss["Heading1"], fontSize=18, leading=22,
            textColor=hexcolor("primary"), spaceBefore=6, spaceAfter=12,
            fontName="Helvetica-Bold",
        ),
        "H2": ParagraphStyle(
            "H2", parent=ss["Heading2"], fontSize=13.5, leading=17,
            textColor=hexcolor("primary_dark"), spaceBefore=14, spaceAfter=8,
            fontName="Helvetica-Bold",
        ),
        "H3": ParagraphStyle(
            "H3", parent=ss["Heading3"], fontSize=11.5, leading=15,
            textColor=hexcolor("dark"), spaceBefore=8, spaceAfter=4,
            fontName="Helvetica-Bold",
        ),
        "Body": ParagraphStyle(
            "Body", parent=ss["Normal"], fontSize=9.6, leading=13.6,
            textColor=hexcolor("dark"), alignment=TA_LEFT, spaceAfter=4,
        ),
        "BodySmall": ParagraphStyle(
            "BodySmall", parent=ss["Normal"], fontSize=8.6, leading=12,
            textColor=hexcolor("gray"), alignment=TA_LEFT,
        ),
        "Label": ParagraphStyle(
            "Label", parent=ss["Normal"], fontSize=8.2, leading=11,
            textColor=hexcolor("gray"), fontName="Helvetica-Bold",
        ),
        "TableCell": ParagraphStyle(
            "TableCell", parent=ss["Normal"], fontSize=8, leading=10.5,
            textColor=hexcolor("dark"),
        ),
        "TableHeader": ParagraphStyle(
            "TableHeader", parent=ss["Normal"], fontSize=8.4, leading=11,
            textColor=colors.white, fontName="Helvetica-Bold",
        ),
        "Code": ParagraphStyle(
            "Code", parent=ss["Code"], fontSize=7.6, leading=10.2,
            fontName="Courier", textColor=hexcolor("dark"),
            backColor=hexcolor("light_bg"), borderPadding=6,
        ),
        "IssueMd": ParagraphStyle(
            "IssueMd", parent=ss["Code"], fontSize=8, leading=11,
            fontName="Courier", textColor=hexcolor("dark"),
            backColor=hexcolor("light_bg"), borderPadding=8,
        ),
    }
    return styles


def severity_badge(severity, styles):
    color = hexcolor(severity)
    t = Table([[Paragraph(f"<b>{esc(severity.upper())}</b>", ParagraphStyle(
        "sev", parent=styles["TableHeader"], textColor=colors.white, alignment=TA_CENTER))]],
        colWidths=[2.6 * cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), color),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
    ]))
    return t


# --------------------------------------------------------------------------
# Seções do relatório
# --------------------------------------------------------------------------
def section_cover(story, data, styles):
    meta = data["meta"]
    band = Table(
        [[Paragraph("Relatório de Auditoria de Segurança", styles["CoverTitle"])],
         [Spacer(1, 6)],
         [Paragraph(esc(meta["project"]), styles["CoverSubtitle"])],
         [Paragraph(esc(meta["org"]), styles["CoverSubtitle"])]],
        colWidths=[16 * cm],
    )
    band.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), hexcolor("primary")),
        ("TOPPADDING", (0, 0), (-1, -1), 22),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 22),
        ("LEFTPADDING", (0, 0), (-1, -1), 18),
        ("RIGHTPADDING", (0, 0), (-1, -1), 18),
    ]))
    story.append(Spacer(1, 5 * cm))
    story.append(band)
    story.append(Spacer(1, 1.4 * cm))

    cats = " · ".join(meta["categories"])
    meta_rows = [
        ["Repositório", meta["repo"]],
        ["Branch auditada", meta["branch"]],
        ["Data", meta["date"]],
        ["Executado por", meta["auditor"]],
        ["Categorias avaliadas", cats],
    ]
    meta_table = Table(
        [[Paragraph(f"<b>{esc(k)}</b>", styles["CoverMeta"]), Paragraph(esc(v), styles["CoverMeta"])]
         for k, v in meta_rows],
        colWidths=[4.2 * cm, 11.8 * cm],
    )
    meta_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LINEBELOW", (0, 0), (-1, -2), 0.4, hexcolor("border")),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 1.2 * cm))

    chip_row = []
    for cat in meta["categories"]:
        chip_row.append(Paragraph(f"<b>{esc(cat)}</b>", ParagraphStyle(
            "chip", parent=styles["TableHeader"], alignment=TA_CENTER, fontSize=7.6, leading=9.5)))
    chip_table = Table([chip_row], colWidths=[16 * cm / len(chip_row)] * len(chip_row))
    chip_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), hexcolor("dark")),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BOX", (0, 0), (-1, -1), 0.5, hexcolor("dark")),
        ("INNERGRID", (0, 0), (-1, -1), 0.75, colors.white),
    ]))
    story.append(chip_table)
    story.append(PageBreak())


def section_sumario(story, data, styles):
    story.append(Paragraph("Sumário", styles["H1"]))
    items = [
        "1. Resumo Executivo",
        "2. Metodologia — Mapeamento de Stack e Categorias",
        "3. Tabela de Achados Detalhados (arquivo:linha)",
        "4. Achados por Categoria — Descrição Completa",
        "5. Recomendações Priorizadas",
        "6. Anexo — Templates de Issues para o GitHub",
    ]
    for item in items:
        story.append(Paragraph(esc(item), styles["Body"]))
    story.append(PageBreak())


def section_executive_summary(story, data, styles, donut_path, bar_path):
    findings = data["findings"]
    weaknesses = [f for f in findings if f["type"] == "weakness"]
    strengths = [f for f in findings if f["type"] == "strength"]

    story.append(Paragraph("1. Resumo Executivo", styles["H1"]))
    n_crit = sum(1 for f in weaknesses if f["severity"] == "Crítico")
    n_alto = sum(1 for f in weaknesses if f["severity"] == "Alto")
    story.append(Paragraph(
        f"Esta auditoria cobriu as 5 categorias solicitadas (Isolamento, Permissões Frontend vs "
        f"Backend, IDOR, Chaves Expostas e XSS) sobre o repositório <b>{esc(data['meta']['repo'])}</b> "
        f"(branch <b>{esc(data['meta']['branch'])}</b>). Foram identificados "
        f"<b>{len(weaknesses)} pontos fracos</b> (sendo <b>{n_crit} críticos</b> e <b>{n_alto} altos</b>) "
        f"e <b>{len(strengths)} pontos fortes</b> confirmados, todos citados com arquivo e linha exatos.",
        styles["Body"],
    ))
    story.append(Paragraph(
        "O achado mais relevante é uma cadeia de exploração completa: qualquer uma das ~160 contas "
        "de servidores cadastradas recebe papel <b>admin</b> por padrão (ISO-1), nenhuma rota de "
        "escrita administrativa verifica papel no backend (PERM-1), e o conteúdo rico (Quill) de "
        "boletins/artigos é renderizado com <font face=\"Courier\">bypassSecurityTrustHtml</font> sem "
        "nenhuma sanitização (XSS-1). Como o token JWT fica em <font face=\"Courier\">localStorage</font>, "
        "um Stored XSS nessa cadeia resulta em sequestro de conta de qualquer visitante — não apenas "
        "um alerta de prova de conceito.",
        styles["Body"],
    ))
    story.append(Spacer(1, 10))

    chart_table = Table(
        [[Image(donut_path, width=8.1 * cm, height=6.85 * cm),
          Image(bar_path, width=8.1 * cm, height=6.85 * cm)]],
        colWidths=[8.3 * cm, 8.3 * cm],
    )
    chart_table.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP")]))
    story.append(chart_table)
    story.append(Spacer(1, 10))

    story.append(Paragraph("Mapeamento de Stack (visão geral)", styles["H2"]))
    stack_rows = [[Paragraph("<b>Camada</b>", styles["TableHeader"]),
                   Paragraph("<b>Tecnologia</b>", styles["TableHeader"])]]
    for s in data["meta"]["stack"]:
        stack_rows.append([Paragraph(esc(s["layer"]), styles["TableCell"]),
                            Paragraph(esc(s["tech"]), styles["TableCell"])])
    stack_table = Table(stack_rows, colWidths=[3.6 * cm, 12.4 * cm], repeatRows=1)
    stack_table.setStyle(base_table_style())
    story.append(stack_table)
    story.append(PageBreak())


def base_table_style(header_bg="primary"):
    return TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), hexcolor(header_bg)),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.4, hexcolor("border")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, hexcolor("light_bg")]),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
    ])


def section_methodology(story, data, styles):
    story.append(Paragraph("2. Metodologia — Mapeamento de Stack e Categorias", styles["H1"]))
    story.append(Paragraph(
        "Antes de procurar falhas, a stack real do projeto foi mapeada (ver tabela completa abaixo) "
        "e cada uma das 5 categorias exigidas foi redefinida no contexto específico dessa stack — "
        "este projeto não usa Supabase/Firebase nem Flutter; é um monólito Angular + Node/Express + "
        "Knex/PostgreSQL, com um módulo legado em PHP.", styles["Body"],
    ))

    story.append(Paragraph("Stack completa", styles["H2"]))
    stack_rows = [[Paragraph("<b>Camada</b>", styles["TableHeader"]),
                   Paragraph("<b>Tecnologia</b>", styles["TableHeader"]),
                   Paragraph("<b>Relevância para a auditoria</b>", styles["TableHeader"])]]
    for s in data["meta"]["stack"]:
        stack_rows.append([
            Paragraph(esc(s["layer"]), styles["TableCell"]),
            Paragraph(esc(s["tech"]), styles["TableCell"]),
            Paragraph(esc(s["how_it_relates"]), styles["TableCell"]),
        ])
    t = Table(stack_rows, colWidths=[2.6 * cm, 5.4 * cm, 8 * cm], repeatRows=1)
    t.setStyle(base_table_style())
    story.append(t)
    story.append(Spacer(1, 10))

    story.append(Paragraph("Como cada categoria foi interpretada nesta stack", styles["H2"]))
    for cm_ in data["meta"]["category_mapping"]:
        story.append(Paragraph(esc(cm_["category"]), styles["H3"]))
        story.append(Paragraph(esc(cm_["definition_for_this_stack"]), styles["Body"]))
    story.append(Spacer(1, 10))

    story.append(Paragraph("Critérios de severidade", styles["H2"]))
    sev_rows = [[Paragraph("<b>Severidade</b>", styles["TableHeader"]),
                 Paragraph("<b>Critério</b>", styles["TableHeader"])]]
    for sev, crit in data["meta"]["severity_criteria"].items():
        sev_rows.append([Paragraph(f"<b>{esc(sev)}</b>", styles["TableCell"]), Paragraph(esc(crit), styles["TableCell"])])
    t2 = Table(sev_rows, colWidths=[3 * cm, 13 * cm], repeatRows=1)
    t2.setStyle(base_table_style())
    story.append(t2)
    story.append(PageBreak())


def first_file_line(f):
    """Arquivo completo do 1º arquivo + só o número da linha (o campo 'lines'
    às vezes já embute um nome de arquivo curto, ex. 'Dockerfile:58', para
    desambiguar achados com vários arquivos — não repetir esse nome aqui)."""
    files = [p.strip() for p in f["file"].split(";")]
    lines_first = f["lines"].split(";")[0].strip()
    line_only = lines_first.split(":", 1)[-1] if ":" in lines_first else lines_first
    suffix = f" (+{len(files) - 1} arquivo(s))" if len(files) > 1 else ""
    return f"{files[0]}:{line_only}{suffix}"


def section_findings_table(story, data, styles):
    story.append(Paragraph("3. Tabela de Achados Detalhados (arquivo:linha)", styles["H1"]))
    story.append(Paragraph(
        "Cada linha referencia o(s) arquivo(s) e a(s) linha(s) exata(s) onde o achado foi observado. "
        "Achados do tipo <b>Fraqueza</b> e <b>Ponto Forte</b> aparecem juntos, ordenados por categoria "
        "e severidade.", styles["Body"],
    ))
    story.append(Spacer(1, 6))

    header = ["ID", "Categoria", "Sev.", "Arquivo:Linha", "Achado"]
    rows = [[Paragraph(f"<b>{h}</b>", styles["TableHeader"]) for h in header]]
    ordered = sorted(
        data["findings"],
        key=lambda f: (f["category"], data["meta"]["severity_order"].index(f["severity"])),
    )
    for f in ordered:
        file_line = first_file_line(f)
        rows.append([
            Paragraph(esc(f["id"]), styles["TableCell"]),
            Paragraph(esc(f["category"]), styles["TableCell"]),
            Paragraph(f'<font color="{PALETTE[f["severity"]]}"><b>{esc(f["severity"])}</b></font>', styles["TableCell"]),
            Paragraph(esc(file_line), ParagraphStyle("mono", parent=styles["TableCell"], fontName="Courier", fontSize=6.6, leading=8.4)),
            Paragraph(esc(f["title"]), styles["TableCell"]),
        ])
    t = Table(rows, colWidths=[1.5 * cm, 3.3 * cm, 2.1 * cm, 4.3 * cm, 5.0 * cm], repeatRows=1)
    t.setStyle(base_table_style())
    story.append(t)
    story.append(PageBreak())


def section_findings_detail(story, data, styles):
    story.append(Paragraph("4. Achados por Categoria — Descrição Completa", styles["H1"]))
    findings_by_cat = {}
    for f in data["findings"]:
        findings_by_cat.setdefault(f["category"], []).append(f)

    for cat in data["meta"]["categories"]:
        items = findings_by_cat.get(cat, [])
        if not items:
            continue
        story.append(Paragraph(cat, styles["H1"]))
        items_sorted = sorted(
            items,
            key=lambda f: (f["type"] != "weakness", data["meta"]["severity_order"].index(f["severity"])),
        )
        for f in items_sorted:
            story.append(KeepTogether(build_finding_block(f, styles)))
    story.append(PageBreak())


def build_finding_block(f, styles):
    kind_label = "PONTO FORTE" if f["type"] == "strength" else "ACHADO"
    header_row = Table(
        [[Paragraph(f"<b>[{esc(f['id'])}] {esc(f['title'])}</b>", styles["H3"]),
          severity_badge(f["severity"], styles)]],
        colWidths=[13 * cm, 3 * cm],
    )
    header_row.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "MIDDLE")]))

    block = [
        Spacer(1, 4),
        header_row,
        Paragraph(f"<b>{kind_label}</b> · Arquivo(s): <font face=\"Courier\">{esc(f['file'])}</font> "
                  f"— Linha(s): <font face=\"Courier\">{esc(f['lines'])}</font>", styles["BodySmall"]),
        Spacer(1, 3),
        Preformatted(f["evidence"], styles["Code"]),
        Spacer(1, 3),
        Paragraph(f"<b>Descrição:</b> {esc(f['description'])}", styles["Body"]),
        Paragraph(f"<b>Impacto:</b> {esc(f['impact'])}", styles["Body"]),
        Paragraph(f"<b>Recomendação:</b> {esc(f['recommendation'])}", styles["Body"]),
        Spacer(1, 8),
    ]
    return block


def section_recommendations(story, data, styles):
    story.append(Paragraph("5. Recomendações Priorizadas", styles["H1"]))
    story.append(Paragraph(
        "Ordenadas por severidade (Crítico → Alto → Médio → Baixo); dentro de cada nível, na ordem em "
        "que aparecem os achados correspondentes.", styles["Body"],
    ))
    story.append(Spacer(1, 6))

    weaknesses = [f for f in data["findings"] if f["type"] == "weakness"]
    ordered = sorted(weaknesses, key=lambda f: data["meta"]["severity_order"].index(f["severity"]))
    rows = [[Paragraph("<b>#</b>", styles["TableHeader"]),
             Paragraph("<b>Sev.</b>", styles["TableHeader"]),
             Paragraph("<b>ID</b>", styles["TableHeader"]),
             Paragraph("<b>Recomendação</b>", styles["TableHeader"])]]
    for i, f in enumerate(ordered, 1):
        rows.append([
            Paragraph(str(i), styles["TableCell"]),
            Paragraph(f'<font color="{PALETTE[f["severity"]]}"><b>{esc(f["severity"])}</b></font>', styles["TableCell"]),
            Paragraph(esc(f["id"]), styles["TableCell"]),
            Paragraph(esc(f["recommendation"]), styles["TableCell"]),
        ])
    t = Table(rows, colWidths=[0.9 * cm, 1.7 * cm, 1.8 * cm, 11.6 * cm], repeatRows=1)
    t.setStyle(base_table_style())
    story.append(t)
    story.append(PageBreak())


def section_appendix_issues(story, data, styles):
    story.append(Paragraph("6. Anexo — Templates de Issues para o GitHub", styles["H1"]))
    story.append(Paragraph(
        "Um template Markdown pronto para copiar em \"New Issue\" no GitHub para cada achado do tipo "
        "fraqueza com severidade Crítico, Alto ou Médio.", styles["Body"],
    ))
    story.append(Spacer(1, 6))

    weaknesses = [f for f in data["findings"] if f["type"] == "weakness" and f["severity"] != "Baixo"]
    ordered = sorted(weaknesses, key=lambda f: data["meta"]["severity_order"].index(f["severity"]))
    for f in ordered:
        story.append(KeepTogether([
            Paragraph(f"{esc(f['id'])} — {esc(f['title'])}", styles["H3"]),
            Preformatted(render_issue_markdown(f), styles["IssueMd"]),
            Spacer(1, 10),
        ]))


def wrap_prose(text, width=90):
    """Quebra texto corrido em várias linhas — Preformatted não quebra linha
    automaticamente, então uma prosa longa em uma linha só vazaria da página."""
    paragraphs = text.split("\n")
    return "\n".join(textwrap.fill(p, width=width) if p.strip() else p for p in paragraphs)


def render_evidence_locations(f):
    """Uma linha curta por arquivo:linha — evita estourar a largura da página
    quando um achado cita vários arquivos (Preformatted não quebra linha)."""
    files = [p.strip() for p in f["file"].split(";")]
    lines = [p.strip() for p in f["lines"].split(";")]
    if len(files) != len(lines):
        return f"Arquivo(s): `{f['file']}`\nLinha(s): `{f['lines']}`"
    bullets = []
    for file_part, line_part in zip(files, lines):
        line_only = line_part.split(":", 1)[-1] if ":" in line_part else line_part
        bullet = f"- `{file_part}` — linha(s) `{line_only}`"
        bullets.append(textwrap.fill(bullet, width=88, subsequent_indent="  "))
    return "\n".join(bullets)


def render_issue_markdown(f):
    labels = ["security", f["category"].lower().replace(" ", "-"), f"severity-{f['severity'].lower()}"]
    labels = [l.replace("í", "i").replace("ê", "e").replace("ã", "a").replace("ç", "c") for l in labels]
    title = textwrap.fill(f"[SECURITY][{f['severity'].upper()}] {f['title']}", width=88)
    return f"""# {title}

**Labels sugeridas:** {", ".join(labels)}

## Categoria
{f['category']}

## Severidade
{f['severity']}

## Descrição
{wrap_prose(f['description'])}

## Impacto
{wrap_prose(f['impact'])}

## Evidência
{render_evidence_locations(f)}

```
{f['evidence']}
```

## Recomendação
{wrap_prose(f['recommendation'])}

## Checklist de aceite
- [ ] Correção implementada conforme a recomendação acima
- [ ] Teste automatizado cobrindo o caso (regressão)
- [ ] Validado manualmente em ambiente de homologação
- [ ] Sem novas ocorrências do mesmo padrão em outros arquivos do repositório
- [ ] Revisão de código aprovada
"""


# --------------------------------------------------------------------------
# Cabeçalho/rodapé de página
# --------------------------------------------------------------------------
def page_decorations(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(hexcolor("primary"))
    canvas.rect(0, 0, A4[0], 0.6 * cm, fill=1, stroke=0)
    canvas.setFillColor(hexcolor("gray"))
    canvas.setFont("Helvetica", 8)
    canvas.drawString(2 * cm, 0.75 * cm, "DEPPI — Relatório de Auditoria de Segurança")
    canvas.drawRightString(A4[0] - 2 * cm, 0.75 * cm, f"Página {doc.page}")
    canvas.restoreState()


def cover_decorations(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(hexcolor("primary"))
    canvas.rect(0, 0, A4[0], 0.6 * cm, fill=1, stroke=0)
    canvas.restoreState()


# --------------------------------------------------------------------------
def main():
    data = load_data()
    donut_path, bar_path = build_charts(data["findings"])
    styles = build_styles()

    doc = SimpleDocTemplate(
        OUTPUT_PATH, pagesize=A4,
        topMargin=1.6 * cm, bottomMargin=1.6 * cm,
        leftMargin=1.8 * cm, rightMargin=1.8 * cm,
        title="Relatório de Auditoria de Segurança — DEPPI",
        author=data["meta"]["auditor"],
    )

    story = []
    section_cover(story, data, styles)
    section_sumario(story, data, styles)
    section_executive_summary(story, data, styles, donut_path, bar_path)
    section_methodology(story, data, styles)
    section_findings_table(story, data, styles)
    section_findings_detail(story, data, styles)
    section_recommendations(story, data, styles)
    section_appendix_issues(story, data, styles)

    doc.build(story, onFirstPage=cover_decorations, onLaterPages=page_decorations)
    print(f"OK: PDF gerado em {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
