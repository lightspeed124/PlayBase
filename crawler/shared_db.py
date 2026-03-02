#!/usr/bin/env python3
"""
PlayBase – shared database schema.

All business crawlers write to this single SQLite file so the
front-end can query across multiple vendors in one place.

Schema overview
───────────────
  businesses    – one row per company (NorCal Jump, Kidzz Star, etc.)
  categories    – canonical rental types (Bounce House, Water Slide, …)
  inventory     – individual rental items, linked to business + category
  service_areas – cities/zips each business delivers to
  pages         – raw crawled page cache (used for SEO / re-parse)
"""

import os
import sqlite3

DB_PATH = os.path.join(os.path.dirname(__file__), "playbase.db")


def get_conn(db_path=DB_PATH):
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db(conn):
    c = conn.cursor()

    # ── Businesses ───────────────────────────────────────────────────────────────
    c.execute("""
        CREATE TABLE IF NOT EXISTS businesses (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            name         TEXT    NOT NULL,
            slug         TEXT    UNIQUE,
            phone        TEXT,
            email        TEXT,
            address      TEXT,
            city         TEXT,
            state        TEXT    DEFAULT 'CA',
            zip_code     TEXT,
            about        TEXT,
            logo_url     TEXT,
            website      TEXT    UNIQUE,
            social_links TEXT,          -- JSON {"facebook": url, ...}
            rating       REAL,
            review_count INTEGER,
            crawled_at   TEXT    DEFAULT (datetime('now')),
            updated_at   TEXT    DEFAULT (datetime('now'))
        )
    """)

    # ── Canonical categories (shared, normalised) ────────────────────────────────
    c.execute("""
        CREATE TABLE IF NOT EXISTS categories (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT    NOT NULL UNIQUE,
            slug        TEXT    UNIQUE,
            description TEXT,
            icon        TEXT            -- emoji or CSS class
        )
    """)

    # Seed well-known categories so all crawlers map to the same names
    seed_cats = [
        ("Bounce House",        "bounce-house",      "🏰"),
        ("Themed Bounce House", "themed-bounce-house","🎨"),
        ("Water Slide",         "water-slide",        "💦"),
        ("Combo / Slide",       "combo-slide",        "🛝"),
        ("Obstacle Course",     "obstacle-course",    "🏃"),
        ("Dunk Tank",           "dunk-tank",          "💧"),
        ("Carnival Game",       "carnival-game",      "🎯"),
        ("Interactive Game",    "interactive-game",   "🥊"),
        ("Concession",          "concession",         "🍿"),
        ("Tent",                "tent",               "⛺"),
        ("Table & Chair",       "table-chair",        "🪑"),
        ("Toddler Play",        "toddler-play",       "🧸"),
        ("Inflatable Other",    "inflatable-other",   "🎈"),
    ]
    c.executemany(
        "INSERT OR IGNORE INTO categories (name, slug, icon) VALUES (?, ?, ?)",
        seed_cats
    )

    # ── Inventory ────────────────────────────────────────────────────────────────
    c.execute("""
        CREATE TABLE IF NOT EXISTS inventory (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            business_id    INTEGER NOT NULL  REFERENCES businesses(id),
            category_id    INTEGER           REFERENCES categories(id),
            name           TEXT    NOT NULL,
            slug           TEXT,
            url            TEXT,
            description    TEXT,
            price_from     TEXT,             -- "$189" lowest / starting price
            price_half_day TEXT,
            price_full_day TEXT,
            price_details  TEXT,             -- JSON {duration: price, ...}
            dimensions     TEXT,             -- "15x15"
            setup_area     TEXT,             -- "18x18"
            height         TEXT,
            capacity       TEXT,             -- "8-10 kids"
            age_range      TEXT,
            features       TEXT,             -- JSON list of strings
            images         TEXT,             -- JSON list of image URLs
            thumbnail_url  TEXT,             -- primary / first image
            how_to_use     TEXT,
            rules          TEXT,
            availability   TEXT,
            is_available   INTEGER DEFAULT 1,
            crawled_at     TEXT DEFAULT (datetime('now')),
            updated_at     TEXT DEFAULT (datetime('now')),
            UNIQUE(business_id, url)
        )
    """)

    # ── Service areas ─────────────────────────────────────────────────────────────
    c.execute("""
        CREATE TABLE IF NOT EXISTS service_areas (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            business_id INTEGER NOT NULL REFERENCES businesses(id),
            city        TEXT    NOT NULL,
            state       TEXT    DEFAULT 'CA',
            zip_code    TEXT,
            url         TEXT,
            UNIQUE(business_id, city)
        )
    """)

    # ── Page cache ────────────────────────────────────────────────────────────────
    c.execute("""
        CREATE TABLE IF NOT EXISTS pages (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            business_id INTEGER REFERENCES businesses(id),
            url         TEXT    UNIQUE,
            title       TEXT,
            content     TEXT,
            page_type   TEXT,   -- 'home','category','item','service_area','static'
            crawled_at  TEXT DEFAULT (datetime('now'))
        )
    """)

    conn.commit()
    print(f"[DB] PlayBase schema ready → {DB_PATH}")


def upsert_business(conn, **fields):
    """Insert or update a business row; returns its id."""
    c = conn.cursor()
    c.execute("""
        INSERT INTO businesses (name, slug, phone, email, address, city, state,
                                zip_code, about, logo_url, website, social_links,
                                rating, review_count)
        VALUES (:name, :slug, :phone, :email, :address, :city, :state,
                :zip_code, :about, :logo_url, :website, :social_links,
                :rating, :review_count)
        ON CONFLICT(website) DO UPDATE SET
            name         = excluded.name,
            phone        = COALESCE(excluded.phone, phone),
            email        = COALESCE(excluded.email, email),
            address      = COALESCE(excluded.address, address),
            city         = COALESCE(excluded.city, city),
            about        = COALESCE(excluded.about, about),
            social_links = COALESCE(excluded.social_links, social_links),
            updated_at   = datetime('now')
    """, {
        "name":         fields.get("name", ""),
        "slug":         fields.get("slug", ""),
        "phone":        fields.get("phone", ""),
        "email":        fields.get("email", ""),
        "address":      fields.get("address", ""),
        "city":         fields.get("city", ""),
        "state":        fields.get("state", "CA"),
        "zip_code":     fields.get("zip_code", ""),
        "about":        fields.get("about", ""),
        "logo_url":     fields.get("logo_url", ""),
        "website":      fields.get("website", ""),
        "social_links": fields.get("social_links", "{}"),
        "rating":       fields.get("rating"),
        "review_count": fields.get("review_count"),
    })
    conn.commit()
    c.execute("SELECT id FROM businesses WHERE website = ?", (fields.get("website"),))
    row = c.fetchone()
    return row[0] if row else None


def get_category_id(conn, name):
    """Look up a category id by name (case-insensitive prefix match)."""
    c = conn.cursor()
    c.execute("SELECT id FROM categories WHERE lower(name) = lower(?)", (name,))
    row = c.fetchone()
    return row[0] if row else None


if __name__ == "__main__":
    conn = get_conn()
    init_db(conn)
    conn.close()
