#!/usr/bin/env python3
"""
Crawler for kidzzstarjumpers.com
Collects: inventory, prices, sizes, images, service areas, contact info, about info
Stores results in SQLite database: crawler/kidzzstar.db
"""

import requests
import sqlite3
import json
import time
import re
import os
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

BASE_URL = "https://kidzzstarjumpers.com"
DB_PATH = os.path.join(os.path.dirname(__file__), "kidzzstar.db")

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xhtml+xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Cache-Control": "max-age=0",
}

CRAWL_RESULTS = {
    "succeeded": [],
    "failed": [],
    "skipped": [],
}


# ─── Database Setup ────────────────────────────────────────────────────────────

def init_db(conn):
    c = conn.cursor()

    c.execute("""
        CREATE TABLE IF NOT EXISTS company (
            id INTEGER PRIMARY KEY,
            name TEXT,
            phone TEXT,
            email TEXT,
            address TEXT,
            about TEXT,
            service_areas TEXT,  -- JSON list
            social_links TEXT,   -- JSON dict
            website TEXT,
            crawled_at TEXT DEFAULT (datetime('now'))
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE,
            url TEXT,
            description TEXT
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_id INTEGER REFERENCES categories(id),
            name TEXT,
            slug TEXT,
            url TEXT,
            description TEXT,
            price_from TEXT,
            price_details TEXT,  -- JSON dict with duration/price pairs
            dimensions TEXT,
            setup_area TEXT,
            capacity TEXT,
            age_range TEXT,
            features TEXT,       -- JSON list
            images TEXT,         -- JSON list of URLs
            how_to_use TEXT,
            rules TEXT,
            availability TEXT,
            raw_html_snippet TEXT,
            crawled_at TEXT DEFAULT (datetime('now'))
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS service_areas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            city TEXT,
            state TEXT,
            zip_code TEXT,
            url TEXT
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS pages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT UNIQUE,
            title TEXT,
            content TEXT,
            page_type TEXT,
            crawled_at TEXT DEFAULT (datetime('now'))
        )
    """)

    conn.commit()
    print(f"[DB] Initialized at {DB_PATH}")


# ─── HTTP Helpers ──────────────────────────────────────────────────────────────

SESSION = requests.Session()
SESSION.headers.update(HEADERS)


def fetch(url, retries=3, delay=2):
    for attempt in range(retries):
        try:
            resp = SESSION.get(url, timeout=15, allow_redirects=True)
            if resp.status_code == 200:
                CRAWL_RESULTS["succeeded"].append(url)
                return resp
            elif resp.status_code == 403:
                print(f"[403] Blocked: {url}")
                CRAWL_RESULTS["failed"].append({"url": url, "reason": "403 Forbidden"})
                return None
            elif resp.status_code == 404:
                CRAWL_RESULTS["failed"].append({"url": url, "reason": "404 Not Found"})
                return None
            else:
                print(f"[{resp.status_code}] {url}")
                if attempt < retries - 1:
                    time.sleep(delay)
        except Exception as e:
            print(f"[ERR] {url} → {e}")
            if attempt < retries - 1:
                time.sleep(delay)
    CRAWL_RESULTS["failed"].append({"url": url, "reason": "Max retries exceeded"})
    return None


def soup(resp):
    return BeautifulSoup(resp.text, "lxml")


def clean(text):
    if not text:
        return ""
    return re.sub(r"\s+", " ", text.strip())


# ─── Page Parsers ──────────────────────────────────────────────────────────────

def parse_company_info(conn, html_soup, url):
    """Extract company-wide info from any page."""
    c = conn.cursor()

    name = "Kidzz Star Jumpers"
    phone = ""
    email = ""
    address = ""
    about = ""
    social = {}

    # Phone numbers
    phones = re.findall(r"[\(\d][\d\s\-\(\)\.]{7,}\d", html_soup.get_text())
    phones = [p.strip() for p in phones if len(re.sub(r"\D", "", p)) >= 10]
    if phones:
        phone = phones[0]

    # Email
    emails = re.findall(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}", html_soup.get_text())
    if emails:
        email = emails[0]

    # Social links
    for a in html_soup.find_all("a", href=True):
        href = a["href"]
        if "facebook.com" in href:
            social["facebook"] = href
        elif "instagram.com" in href:
            social["instagram"] = href
        elif "twitter.com" in href or "x.com" in href:
            social["twitter"] = href
        elif "youtube.com" in href:
            social["youtube"] = href
        elif "yelp.com" in href:
            social["yelp"] = href

    # About text – look for paragraphs with company language
    about_keywords = ["company", "family", "founded", "serving", "mission", "years", "experience"]
    for p in html_soup.find_all("p"):
        text = clean(p.get_text())
        if any(kw in text.lower() for kw in about_keywords) and len(text) > 80:
            about += text + " "

    # Address
    addr_pattern = re.search(
        r"\d+\s[\w\s]+(?:St|Ave|Blvd|Dr|Rd|Way|Ln|Ct|Pl)[\w\s,\.]*(?:CA|California)[\s\d]*",
        html_soup.get_text(), re.IGNORECASE
    )
    if addr_pattern:
        address = addr_pattern.group(0).strip()

    c.execute("""
        INSERT OR REPLACE INTO company (id, name, phone, email, address, about, social_links, website)
        VALUES (1, ?, ?, ?, ?, ?, ?, ?)
    """, (name, phone, email, address, clean(about), json.dumps(social), BASE_URL))
    conn.commit()
    print(f"[OK] Company info saved: phone={phone}, email={email}")


def parse_service_areas(conn, html_soup):
    """Find and store all mentioned cities/service areas."""
    c = conn.cursor()
    known_cities = set()

    # Look for city name patterns in text and links
    city_pattern = re.compile(
        r"\b((?:East |West |North |South |Los |San |Santa |El |La )?[A-Z][a-z]+(?:\s[A-Z][a-z]+)?),?\s*CA\b"
    )
    text = html_soup.get_text()
    for match in city_pattern.finditer(text):
        city = match.group(1).strip()
        if city not in known_cities and len(city) > 2:
            known_cities.add(city)
            c.execute(
                "INSERT OR IGNORE INTO service_areas (city, state) VALUES (?, 'CA')",
                (city,)
            )

    # Also grab from navigation links that say "<city> rentals"
    for a in html_soup.find_all("a", href=True):
        href = a["href"]
        if "-in-" in href and "-ca" in href:
            # e.g. /bounce-house-rentals-in-redwood-city-ca/
            parts = href.strip("/").split("-in-")
            if len(parts) == 2:
                city_slug = parts[1].replace("-ca", "").replace("-", " ").title()
                if city_slug not in known_cities:
                    known_cities.add(city_slug)
                    c.execute(
                        "INSERT OR IGNORE INTO service_areas (city, state, url) VALUES (?, 'CA', ?)",
                        (city_slug, urljoin(BASE_URL, href))
                    )

    conn.commit()
    print(f"[OK] Service areas saved: {len(known_cities)} cities")
    return list(known_cities)


def parse_category_page(conn, url, category_name):
    """Parse a category listing page and extract all inventory items."""
    resp = fetch(url)
    if not resp:
        return []

    s = soup(resp)
    c = conn.cursor()

    # Upsert category
    c.execute(
        "INSERT OR IGNORE INTO categories (name, url) VALUES (?, ?)",
        (category_name, url)
    )
    conn.commit()
    c.execute("SELECT id FROM categories WHERE name=?", (category_name,))
    row = c.fetchone()
    cat_id = row[0] if row else None

    # Save raw page
    save_page(conn, url, clean(s.title.get_text()) if s.title else category_name, s.get_text()[:5000], "category")

    # Collect item links
    item_links = []
    for a in s.find_all("a", href=True):
        href = a["href"]
        full = urljoin(BASE_URL, href)
        if "/rentals/" in full and full != url and full not in [x["url"] for x in CRAWL_RESULTS["succeeded"] if isinstance(x, dict)]:
            item_links.append(full)

    # De-dup
    item_links = list(dict.fromkeys(item_links))
    print(f"[CAT] {category_name}: found {len(item_links)} item links")

    # Also grab items directly from listing cards on this page
    items_parsed = parse_inventory_cards(conn, s, url, cat_id, category_name)

    return item_links, items_parsed


def parse_inventory_cards(conn, s, page_url, cat_id, category_name):
    """Extract inventory cards from a listing/category page."""
    c = conn.cursor()
    items = []

    # Common rental site card selectors
    card_selectors = [
        "div.product", "div.item", "div.rental-item", "article.product",
        "div.inventory-item", "li.product", "div[class*='product']",
        "div[class*='rental']", "div[class*='item']", "div.col",
        "div.grid-item",
    ]

    cards = []
    for sel in card_selectors:
        found = s.select(sel)
        if found:
            cards = found
            break

    if not cards:
        # Fallback: any anchor with an image inside pointing to /rentals/
        for a in s.find_all("a", href=True):
            href = a["href"]
            if "/rentals/" in href and a.find("img"):
                name_tag = a.find(["h2", "h3", "h4", "p", "span"])
                name = clean(name_tag.get_text()) if name_tag else clean(a.get_text())
                img_tag = a.find("img")
                img = img_tag.get("src", "") or img_tag.get("data-src", "") if img_tag else ""
                if name:
                    items.append({
                        "name": name,
                        "url": urljoin(BASE_URL, href),
                        "images": [urljoin(BASE_URL, img)] if img else [],
                        "category": category_name,
                    })

    for card in cards:
        name_tag = card.find(["h2", "h3", "h4"])
        name = clean(name_tag.get_text()) if name_tag else ""
        link_tag = card.find("a", href=True)
        link = urljoin(BASE_URL, link_tag["href"]) if link_tag else page_url
        price_tag = card.find(class_=re.compile(r"price|cost|rate", re.I))
        price = clean(price_tag.get_text()) if price_tag else ""
        img_tag = card.find("img")
        img = ""
        if img_tag:
            img = img_tag.get("src") or img_tag.get("data-src") or img_tag.get("data-lazy-src", "")

        if name:
            items.append({
                "name": name,
                "url": link,
                "price_from": price,
                "images": [urljoin(BASE_URL, img)] if img else [],
                "category": category_name,
            })

    # Persist cards
    for item in items:
        c.execute("""
            INSERT OR IGNORE INTO inventory (category_id, name, url, price_from, images, crawled_at)
            VALUES (?, ?, ?, ?, ?, datetime('now'))
        """, (cat_id, item["name"], item["url"], item.get("price_from", ""),
              json.dumps(item.get("images", []))))
    conn.commit()
    return items


def parse_item_detail(conn, url, cat_id):
    """Fetch and parse a single inventory item detail page."""
    resp = fetch(url)
    if not resp:
        return None

    s = soup(resp)
    c = conn.cursor()

    title_tag = s.find(["h1", "h2"])
    name = clean(title_tag.get_text()) if title_tag else ""

    # Description
    desc = ""
    for tag in s.find_all(["p", "div"], class_=re.compile(r"desc|detail|about|info|content", re.I)):
        text = clean(tag.get_text())
        if len(text) > 40:
            desc += text + " "
            break

    # Fallback description from any large paragraph
    if not desc:
        for p in s.find_all("p"):
            text = clean(p.get_text())
            if len(text) > 60:
                desc = text
                break

    # Price
    price_from = ""
    price_details = {}
    price_tags = s.find_all(string=re.compile(r"\$[\d,]+", re.I))
    prices = []
    for pt in price_tags:
        match = re.search(r"\$[\d,]+(?:\.\d{2})?", pt)
        if match:
            prices.append(clean(str(pt.parent.get_text())))
    if prices:
        price_from = prices[0]
        for p in prices:
            # Try to pair with duration hints
            duration_match = re.search(r"(\d+)\s*(hr|hour|day)", p, re.I)
            if duration_match:
                price_details[duration_match.group(0)] = p

    # Dimensions / size
    dimensions = ""
    size_match = re.search(
        r"(\d+\s*[\'\"xX×]\s*\d+(?:\s*[\'\"xX×]\s*\d+)?)",
        s.get_text()
    )
    if size_match:
        dimensions = size_match.group(1)

    # Age range
    age = ""
    age_match = re.search(r"age[s]?\s*[:\-]?\s*(\d+[\+\-]?\s*(?:to|and|–|-|&)?\s*\d*\+?)", s.get_text(), re.I)
    if age_match:
        age = age_match.group(0)

    # Capacity
    capacity = ""
    cap_match = re.search(r"(\d+)\s*(?:kids?|children|persons?|riders?|participants?)", s.get_text(), re.I)
    if cap_match:
        capacity = cap_match.group(0)

    # Features / bullet points
    features = []
    for ul in s.find_all("ul"):
        for li in ul.find_all("li"):
            feat = clean(li.get_text())
            if feat and len(feat) > 3:
                features.append(feat)
        if features:
            break

    # Images
    images = []
    for img in s.find_all("img"):
        src = img.get("src") or img.get("data-src") or img.get("data-lazy-src") or ""
        if src and ("jpg" in src or "jpeg" in src or "png" in src or "webp" in src):
            full_src = urljoin(BASE_URL, src)
            if full_src not in images:
                images.append(full_src)

    # How to use / rules
    how_to = ""
    rules = ""
    for tag in s.find_all(["div", "section", "article"]):
        text = clean(tag.get_text())
        if re.search(r"how\s+to|safety|rule|instruction", text, re.I) and len(text) > 50:
            if re.search(r"rule|safety", text, re.I):
                rules = text[:500]
            else:
                how_to = text[:500]
            break

    # Slug from URL
    slug = url.rstrip("/").split("/")[-1]

    c.execute("""
        INSERT OR REPLACE INTO inventory
        (category_id, name, slug, url, description, price_from, price_details,
         dimensions, capacity, age_range, features, images, how_to_use, rules, crawled_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    """, (
        cat_id, name, slug, url, clean(desc), price_from,
        json.dumps(price_details), dimensions, capacity, age,
        json.dumps(features), json.dumps(images), how_to, rules
    ))
    conn.commit()

    save_page(conn, url, name, s.get_text()[:3000], "item")
    print(f"  [ITEM] {name or slug}: price={price_from}, images={len(images)}, features={len(features)}")
    return name


def save_page(conn, url, title, content, page_type):
    c = conn.cursor()
    c.execute("""
        INSERT OR REPLACE INTO pages (url, title, content, page_type, crawled_at)
        VALUES (?, ?, ?, ?, datetime('now'))
    """, (url, title, content, page_type))
    conn.commit()


# ─── Sitemap / Link Discovery ──────────────────────────────────────────────────

def fetch_sitemap(conn):
    """Try to fetch sitemap.xml and extract all URLs."""
    urls = []
    for sitemap_url in [
        f"{BASE_URL}/sitemap.xml",
        f"{BASE_URL}/sitemap_index.xml",
        f"{BASE_URL}/page-sitemap.xml",
    ]:
        resp = fetch(sitemap_url)
        if resp:
            found = re.findall(r"<loc>(.*?)</loc>", resp.text)
            urls.extend(found)
            print(f"[SITEMAP] {sitemap_url}: {len(found)} URLs")
    return list(dict.fromkeys(urls))


def discover_all_pages(conn, homepage_soup):
    """Walk all internal links from homepage."""
    all_links = set()
    for a in homepage_soup.find_all("a", href=True):
        href = a["href"]
        full = urljoin(BASE_URL, href)
        parsed = urlparse(full)
        if parsed.netloc in ("kidzzstarjumpers.com", "www.kidzzstarjumpers.com"):
            all_links.add(full.rstrip("/") + "/")
    return list(all_links)


# ─── Main Crawl ────────────────────────────────────────────────────────────────

KNOWN_CATEGORIES = [
    ("Moonwalks & Bounce Houses", f"{BASE_URL}/rentals/moonwalks/"),
    ("Water Rides",               f"{BASE_URL}/rentals/water-rides/"),
    ("Slides & Combos",           f"{BASE_URL}/rentals/slides-combos/"),
    ("Obstacle Courses",          f"{BASE_URL}/rentals/obstacle-courses/"),
    ("Games",                     f"{BASE_URL}/rentals/games/"),
    ("Concessions",               f"{BASE_URL}/rentals/concessions/"),
    ("Tents",                     f"{BASE_URL}/rentals/tents/"),
    ("Tables & Chairs",           f"{BASE_URL}/rentals/tables-chairs/"),
    ("Equipment",                 f"{BASE_URL}/rentals/equipment/"),
    ("Accessories",               f"{BASE_URL}/rentals/accessories/"),
    ("All Inventory",             f"{BASE_URL}/rentals/"),
]

STATIC_PAGES = [
    ("about",       f"{BASE_URL}/about/"),
    ("contact",     f"{BASE_URL}/contact/"),
    ("faq",         f"{BASE_URL}/faq/"),
    ("safety",      f"{BASE_URL}/safety/"),
    ("service-area",f"{BASE_URL}/service-area/"),
    ("home",        f"{BASE_URL}/"),
]


def main():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    init_db(conn)

    print("\n=== Phase 1: Sitemap ===")
    sitemap_urls = fetch_sitemap(conn)

    print("\n=== Phase 2: Static pages (contact, about, etc.) ===")
    for page_name, page_url in STATIC_PAGES:
        resp = fetch(page_url)
        if resp:
            s = soup(resp)
            parse_company_info(conn, s, page_url)
            parse_service_areas(conn, s)
            save_page(conn, page_url, page_name, s.get_text()[:5000], "static")
            print(f"[OK] Static page: {page_url}")

    print("\n=== Phase 3: Category pages ===")
    all_item_urls = set()
    for cat_name, cat_url in KNOWN_CATEGORIES:
        print(f"\n[CAT] Crawling: {cat_name}")
        result = parse_category_page(conn, cat_url, cat_name)
        if result:
            item_links, _ = result
            for link in item_links:
                if "/rentals/" in link and link != cat_url:
                    all_item_urls.add(link)
        time.sleep(0.5)

    # Also add sitemap inventory URLs
    for url in sitemap_urls:
        if "/rentals/" in url:
            all_item_urls.add(url.rstrip("/") + "/")

    print(f"\n=== Phase 4: Individual item pages ({len(all_item_urls)} items) ===")
    c = conn.cursor()
    for url in sorted(all_item_urls):
        # Determine category
        cat_id = None
        for cat_name, cat_url in KNOWN_CATEGORIES:
            cat_slug = cat_url.rstrip("/").split("/")[-1]
            if cat_slug in url:
                c.execute("SELECT id FROM categories WHERE name=?", (cat_name,))
                row = c.fetchone()
                cat_id = row[0] if row else None
                break
        parse_item_detail(conn, url, cat_id)
        time.sleep(0.4)

    # Phase 5: Crawl all service area landing pages
    print("\n=== Phase 5: Service area pages ===")
    c.execute("SELECT url FROM service_areas WHERE url IS NOT NULL")
    area_urls = [row[0] for row in c.fetchall()]
    for url in area_urls:
        resp = fetch(url)
        if resp:
            s = soup(resp)
            save_page(conn, url, clean(s.title.get_text()) if s.title else url, s.get_text()[:3000], "service_area")
            # Extract any item links from these pages too
            for a in s.find_all("a", href=True):
                href = urljoin(BASE_URL, a["href"])
                if "/rentals/" in href and href not in all_item_urls:
                    all_item_urls.add(href)
                    parse_item_detail(conn, href, None)
        time.sleep(0.3)

    # ─── Summary ────────────────────────────────────────────────────────────────
    print("\n=== Crawl Complete ===")
    c.execute("SELECT COUNT(*) FROM inventory")
    inv_count = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM categories")
    cat_count = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM service_areas")
    area_count = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM pages")
    page_count = c.fetchone()[0]

    print(f"  Inventory items : {inv_count}")
    print(f"  Categories      : {cat_count}")
    print(f"  Service areas   : {area_count}")
    print(f"  Pages crawled   : {page_count}")
    print(f"  URLs succeeded  : {len(CRAWL_RESULTS['succeeded'])}")
    print(f"  URLs failed     : {len(CRAWL_RESULTS['failed'])}")

    # Save crawl report
    report = {
        "database": DB_PATH,
        "succeeded": CRAWL_RESULTS["succeeded"],
        "failed": CRAWL_RESULTS["failed"],
        "counts": {
            "inventory": inv_count,
            "categories": cat_count,
            "service_areas": area_count,
            "pages": page_count,
        }
    }
    report_path = os.path.join(os.path.dirname(DB_PATH), "crawl_report.json")
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)
    print(f"\n[REPORT] Saved to {report_path}")
    print(f"[DB]     Database at {DB_PATH}")

    conn.close()
    return report


if __name__ == "__main__":
    main()
