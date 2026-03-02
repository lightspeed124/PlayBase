#!/usr/bin/env python3
"""
Migrate Kidzz Star Jumpers data from kidzzstar.db → shared playbase.db

Run this once after the kidzzstar_crawler.py has already populated
kidzzstar.db. It maps the old single-company schema into the new
multi-business schema used by all PlayBase crawlers.

Usage:
  python migrate_kidzzstar.py
"""

import json
import os
import sqlite3

from shared_db import get_conn, init_db, upsert_business, DB_PATH

OLD_DB = os.path.join(os.path.dirname(__file__), "kidzzstar.db")

BUSINESS_INFO = {
    "name":    "Kidzz Star Jumpers",
    "slug":    "kidzz-star-jumpers",
    "website": "https://kidzzstarjumpers.com",
    "state":   "CA",
}

# Old category name → canonical PlayBase category name
CATEGORY_MAP = {
    "Moonwalks & Bounce Houses": "Bounce House",
    "Water Rides":               "Water Slide",
    "Slides & Combos":           "Combo / Slide",
    "Obstacle Courses":          "Obstacle Course",
    "Games":                     "Carnival Game",
    "Concessions":               "Concession",
    "Tents":                     "Tent",
    "Tables & Chairs":           "Table & Chair",
    "Equipment":                 "Inflatable Other",
    "Accessories":               "Inflatable Other",
    "All Inventory":             "Inflatable Other",
}


def migrate():
    if not os.path.exists(OLD_DB):
        print(f"[SKIP] {OLD_DB} not found — run kidzzstar_crawler.py first.")
        return

    old = sqlite3.connect(OLD_DB)
    old.row_factory = sqlite3.Row

    new = get_conn()
    init_db(new)

    # ── 1. Business ───────────────────────────────────────────────────────────
    old_co = old.execute("SELECT * FROM company WHERE id=1").fetchone()
    biz_kwargs = dict(BUSINESS_INFO)
    if old_co:
        biz_kwargs.update({
            "phone":        old_co["phone"]   or "",
            "email":        old_co["email"]   or "",
            "address":      old_co["address"] or "",
            "about":        old_co["about"]   or "",
            "social_links": old_co["social_links"] or "{}",
        })

    biz_id = upsert_business(new, **biz_kwargs)
    print(f"[BIZ] Kidzz Star Jumpers → business_id={biz_id}")

    # ── 2. Categories → canonical mapping ────────────────────────────────────
    old_cats = old.execute("SELECT * FROM categories").fetchall()
    cat_id_map = {}  # old_id → new category_id
    for row in old_cats:
        canonical = CATEGORY_MAP.get(row["name"], "Inflatable Other")
        result = new.execute(
            "SELECT id FROM categories WHERE name=?", (canonical,)
        ).fetchone()
        if result:
            cat_id_map[row["id"]] = result[0]
    print(f"[CAT] Mapped {len(cat_id_map)} categories")

    # ── 3. Inventory ──────────────────────────────────────────────────────────
    old_inv = old.execute("SELECT * FROM inventory").fetchall()
    inserted = 0
    for row in old_inv:
        cat_id = cat_id_map.get(row["category_id"])
        images = row["images"] or "[]"
        try:
            img_list = json.loads(images)
        except Exception:
            img_list = []
        thumbnail = img_list[0] if img_list else ""

        new.execute("""
            INSERT INTO inventory
                (business_id, category_id, name, slug, url, description,
                 price_from, price_details, dimensions, setup_area, capacity,
                 age_range, features, images, thumbnail_url, how_to_use, rules,
                 availability, crawled_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            ON CONFLICT(business_id, url) DO UPDATE SET
                name         = excluded.name,
                description  = COALESCE(NULLIF(excluded.description,''),  description),
                price_from   = COALESCE(NULLIF(excluded.price_from,''),   price_from),
                images       = COALESCE(NULLIF(excluded.images,'[]'),     images),
                thumbnail_url= COALESCE(NULLIF(excluded.thumbnail_url,''),thumbnail_url),
                updated_at   = datetime('now')
        """, (
            biz_id,
            cat_id,
            row["name"]         or "",
            row["slug"]         or "",
            row["url"]          or "",
            row["description"]  or "",
            row["price_from"]   or "",
            row["price_details"] or "{}",
            row["dimensions"]   or "",
            row["setup_area"]   or "",
            row["capacity"]     or "",
            row["age_range"]    or "",
            row["features"]     or "[]",
            images,
            thumbnail,
            row["how_to_use"]   or "",
            row["rules"]        or "",
            row["availability"] or "",
            row["crawled_at"]   or "",
        ))
        inserted += 1

    new.commit()
    print(f"[INV] Migrated {inserted} inventory items")

    # ── 4. Service areas ──────────────────────────────────────────────────────
    old_areas = old.execute("SELECT * FROM service_areas").fetchall()
    for row in old_areas:
        new.execute("""
            INSERT OR IGNORE INTO service_areas (business_id, city, state, zip_code, url)
            VALUES (?, ?, ?, ?, ?)
        """, (biz_id, row["city"], row["state"] or "CA", row["zip_code"], row["url"]))
    new.commit()
    print(f"[AREA] Migrated {len(old_areas)} service area rows")

    # ── 5. Pages ─────────────────────────────────────────────────────────────
    old_pages = old.execute("SELECT * FROM pages").fetchall()
    for row in old_pages:
        new.execute("""
            INSERT OR IGNORE INTO pages (business_id, url, title, content, page_type, crawled_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (biz_id, row["url"], row["title"], row["content"], row["page_type"], row["crawled_at"]))
    new.commit()
    print(f"[PAGE] Migrated {len(old_pages)} page rows")

    # ── Summary ───────────────────────────────────────────────────────────────
    print(f"\n[DONE] Migration complete → {DB_PATH}")
    for table in ("businesses", "inventory", "categories", "service_areas", "pages"):
        count = new.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
        print(f"  {table:15s}: {count} rows")

    old.close()
    new.close()


if __name__ == "__main__":
    migrate()
