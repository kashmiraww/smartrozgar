#!/usr/bin/env python3
"""Dev-only generator for src/data/indiaMap.ts (not imported at runtime).

Source: https://github.com/udit-001/india-maps-data — GeoJSON of Indian
districts (Census-2011 based boundaries incl. Telangana & Ladakh, 36 states/UTs).

Pipeline: Albers Equal-Area Conic projection (standard parallels 12.5N/35N,
origin 80E/24N) -> scale to a 1000px-wide viewBox -> Douglas-Peucker
simplify -> compact SVG path strings. State outlines are the union of their
districts (shapely), simplified more coarsely than individual districts.

Usage:  python3 scripts/build-map.py /tmp/indiamap/india.geojson
Requires: shapely (pip install shapely)
"""

import json
import math
import re
import sys
from collections import defaultdict

from shapely.geometry import Polygon, shape
from shapely.ops import unary_union

SRC = sys.argv[1] if len(sys.argv) > 1 else "/tmp/indiamap/india.geojson"
OUT = "src/data/indiaMap.ts"
OUT_DIST = "src/data/indiaDistricts.ts"

# ---------------------------------------------------------------- projection
DEG = math.radians
LAT0, LON0 = 24.0, 80.0
P1, P2 = 12.5, 35.0
N = (math.sin(DEG(P1)) + math.sin(DEG(P2))) / 2.0
C = math.cos(DEG(P1)) ** 2 + 2 * N * math.sin(DEG(P1))
RHO0 = math.sqrt(C - 2 * N * math.sin(DEG(LAT0))) / N


def albers(lon, lat):
    theta = N * DEG(lon - LON0)
    rho = math.sqrt(max(C - 2 * N * math.sin(DEG(lat)), 1e-9)) / N
    return rho * math.sin(theta), RHO0 - rho * math.cos(theta)  # y grows north


# ---------------------------------------------------------------- load + group
fc = json.load(open(SRC))
districts = defaultdict(list)  # st_nm -> [{code,name,geom}]
outlines = {}  # st_nm -> projected outline geom

# Projection transform. Holes are dropped on purpose: they are vanishingly
# rare in this dataset and cost bytes. Features without a district name are
# the dataset's state-outline features; those with one are districts.
seq = defaultdict(int)
for f in fc["features"]:
    p = f["properties"]
    geom = shape(f["geometry"])
    if geom.geom_type == "Polygon":
        pg = Polygon([albers(x, y) for x, y in geom.exterior.coords])
    else:
        pg = unary_union(
            [Polygon([albers(x, y) for x, y in poly.exterior.coords]) for poly in geom.geoms]
        )
    st = p["st_nm"]
    name = p.get("district")
    if not name:
        outlines[st] = pg
        continue
    seq[st] += 1
    districts[st].append(
        {
            "code": f"{p['st_code']}-{p.get('dt_code') or 'd' + str(seq[st])}",
            "name": name,
            "geom": pg,
        }
    )

# ---------------------------------------------------------------- scale to px
state_geoms = {}
for st in districts:
    state_geoms[st] = outlines.get(st) or unary_union([d["geom"] for d in districts[st]])

minx = miny = float("inf")
maxx = maxy = float("-inf")
for g in state_geoms.values():
    u = g
    x0, y0, x1, y1 = u.bounds
    minx, miny = min(minx, x0), min(miny, y0)
    maxx, maxy = max(maxx, x1), max(maxy, y1)

TARGET_W = 1000.0
SCALE = TARGET_W / (maxx - minx)
PAD = 6.0


def to_px(geom):
    from shapely.affinity import affine_transform

    # x' = (x - minx) * s ; y' = (maxy - y) * s   (flip north up)
    return affine_transform(geom, [SCALE, 0, 0, -SCALE, -minx * SCALE, maxy * SCALE])


HEIGHT = round((maxy - miny) * SCALE, 1)

STATE_TOL = 1.1  # px
DIST_TOL = 0.65  # px
MIN_RING_AREA = 0.30  # px^2 — drop specks/islets


def ring_to_path(coords, out):
    pts = []
    last = None
    for x, y in coords:
        px, py = round(x, 1), round(y, 1)
        if (px, py) == last:
            continue
        last = (px, py)
        pts.append(f"{px:g},{py:g}")
    if len(pts) < 3:
        return False
    out.append("M" + "L".join(pts) + "Z")
    return True


def geom_to_path(geom, tol, min_area=MIN_RING_AREA):
    """Simplify then serialise exterior rings (interior rings dropped).

    `min_area` is relaxed proportionally for small geometries so that tiny
    states/UTs (Lakshadweep, Mahe...) still render instead of vanishing.
    """
    simplified = geom if tol == 0 else geom.simplify(tol, preserve_topology=True)
    if simplified.is_empty:
        return ""
    area = simplified.area
    if area < 50:
        min_area = min(min_area, max(area / 20.0, 1e-4))
    parts = []
    polys = [simplified] if simplified.geom_type == "Polygon" else list(simplified.geoms)
    for poly in sorted(polys, key=lambda p: -p.area):
        if poly.is_empty or poly.area < min_area:
            continue
        ring_to_path(poly.exterior.coords, parts)
    if not parts:  # last resort: keep the largest ring whatever its size
        biggest = max(polys, key=lambda p: p.area) if polys else None
        if biggest is not None and not biggest.is_empty:
            ring_to_path(biggest.exterior.coords, parts)
    return "".join(parts)


def slugify(name):
    s = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return s or "x"


state_paths = {}
state_bounds = {}
state_centroid = {}
district_paths = {}

for st_name in sorted(state_geoms):
    sslug = slugify(st_name)
    state_geom = to_px(state_geoms[st_name]).simplify(STATE_TOL, preserve_topology=True)
    state_paths[sslug] = geom_to_path(state_geom, 0)  # already simplified
    x0, y0, x1, y1 = state_geom.bounds
    w, h = x1 - x0, y1 - y0
    pad = max(w, h) * 0.06
    state_bounds[sslug] = [
        round(x0 - pad, 1),
        round(y0 - pad, 1),
        round(w + 2 * pad, 1),
        round(h + 2 * pad, 1),
    ]
    pt = state_geom.representative_point()
    state_centroid[sslug] = [round(pt.x, 1), round(pt.y, 1)]

    seen = set()
    entries = []
    for d in sorted(districts[st_name], key=lambda d: d["name"]):
        pg = to_px(d["geom"])
        path = geom_to_path(pg, DIST_TOL)
        if not path:
            continue
        key = slugify(d["name"])
        if key in seen:
            key = f"{key}-{d['code'].split('-')[1]}"
        seen.add(key)
        rp = pg.representative_point()
        entries.append(
            {"code": d["code"], "name": d["name"], "slug": key, "d": path,
             "cx": round(rp.x, 1), "cy": round(rp.y, 1)}
        )
    district_paths[sslug] = entries

n_districts = sum(len(v) for v in district_paths.values())


def dump_paths(paths):
    return "\n".join(
        f'  {json.dumps(k)}: {json.dumps(v)},' for k, v in sorted(paths.items())
    )


def dump_states_table():
    lines = []
    for k in sorted(district_paths):
        b = ",".join(str(v) for v in state_bounds[k])
        c = ",".join(str(v) for v in state_centroid[k])
        lines.append(
            f'  {json.dumps(k)}: {{ bounds: [{b}], centroid: [{c}] }},'
        )
    return "\n".join(lines)


def dump_districts():
    out = []
    for k in sorted(district_paths):
        items = ",\n".join(
            "    " + json.dumps(d) for d in district_paths[k]
        )
        out.append(f"  {json.dumps(k)}: [\n{items},\n  ],")
    return "\n".join(out)


ts = f"""// AUTO-GENERATED by scripts/build-map.py — do not edit by hand.
// Source: github.com/udit-001/india-maps-data (district GeoJSON, Census-2011
// based boundaries). Projection: Albers Equal-Area Conic (12.5N/35N, 80E/24N),
// scaled to a 1000px-wide viewBox, Douglas-Peucker simplified.

/** Width x height of the national map's coordinate space. */
export const MAP_VIEWBOX = "0 0 1000 {HEIGHT}";

export const MAP_WIDTH = 1000;
export const MAP_HEIGHT = {HEIGHT};

/** Simplified outline of each state/union territory, keyed by state slug. */
export const STATE_PATHS: Record<string, string> = {{
{dump_paths(state_paths)}
}};

/** Per-state view metadata: fitted [x, y, width, height] and label anchor. */
export const STATE_VIEW: Record<string, {{ bounds: number[]; centroid: number[] }}> = {{
{dump_states_table()}
}};

"""

districts_ts = f"""// AUTO-GENERATED by scripts/build-map.py — do not edit by hand.
// District polygons per state, kept in a separate module so the landing page
// can import only the state outlines.

export interface DistrictShape {{
  code: string;
  name: string;
  slug: string;
  d: string;
  cx: number;
  cy: number;
}}

/** District polygons per state, keyed by state slug. */
export const DISTRICT_PATHS: Record<string, DistrictShape[]> = {{
{dump_districts()}
}};
"""

with open(OUT, "w") as fh:
    fh.write(ts)
with open(OUT_DIST, "w") as fh:
    fh.write(districts_ts)

import os

print(
    f"states={len(state_paths)} districts={n_districts} height={HEIGHT} "
    f"bytes={os.path.getsize(OUT)}+{os.path.getsize(OUT_DIST)}"
)
