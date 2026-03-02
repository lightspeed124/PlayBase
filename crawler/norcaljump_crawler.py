#!/usr/bin/env python3
"""
Crawler for norcaljump.com
Collects: inventory, prices, sizes, images, service areas, contact info
Writes to the shared PlayBase SQLite database (shared_db.py)

NorCal Jump URL patterns
  Categories : /slug-cNNN.html
  Products   : /slug-pNNNN.html
  Stores     : /store-NN-city.html
  Pages      : /pages/city-slug  or  /delivery-area-n2.html
"""

import json
import os
import re
import time

import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

from shared_db import get_conn, init_db, upsert_business, get_category_id, DB_PATH

BASE_URL = "https://norcaljump.com"

BUSINESS = {
    "name":    "NorCal Jump",
    "slug":    "norcal-jump",
    "phone":   "1-800-404-0971",
    "website": BASE_URL,
    "state":   "CA",
}

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

# Known categories discovered from site research
# (name displayed on site → canonical DB name)
CATEGORY_MAP = {
    "theme jumper":       "Themed Bounce House",
    "themed jumper":      "Themed Bounce House",
    "moonwalk":           "Bounce House",
    "bounce house":       "Bounce House",
    "jumper":             "Bounce House",
    "combo":              "Combo / Slide",
    "slide":              "Combo / Slide",
    "water slide":        "Water Slide",
    "water ride":         "Water Slide",
    "obstacle":           "Obstacle Course",
    "dunk tank":          "Dunk Tank",
    "sumo":               "Interactive Game",
    "boxing":             "Interactive Game",
    "velcro":             "Interactive Game",
    "bungee":             "Interactive Game",
    "joust":              "Interactive Game",
    "game":               "Carnival Game",
    "concession":         "Concession",
    "tent":               "Tent",
    "table":              "Table & Chair",
    "toddler":            "Toddler Play",
}

# Known category pages (slug → url), discovered via Google
KNOWN_CATEGORY_URLS = [
    ("Theme Jumpers",    f"{BASE_URL}/theme-jumper-c88.html"),
    ("Combo Side Slide", f"{BASE_URL}/combo-side-slide-c90.html"),
    ("Combo 1 Slide",    f"{BASE_URL}/combo-1-slide-c92.html"),
]

CRAWL_STATS = {"ok": 0, "fail": 0, "skip": 0}

# ── HTTP helpers ──────────────────────────────────────────────────────────────

SESSION = requests.Session()
SESSION.headers.update(HEADERS)


def fetch(url, retries=3, delay=2):
    for attempt in range(retries):
        try:
            resp = SESSION.get(url, timeout=15, allow_redirects=True)
            if resp.status_code == 200:
                CRAWL_STATS["ok"] += 1
                return resp
            elif resp.status_code in (403, 404):
                print(f"  [{resp.status_code}] {url}")
                CRAWL_STATS["fail"] += 1
                return None
            else:
                print(f"  [{resp.status_code}] {url} (attempt {attempt+1})")
                if attempt < retries - 1:
                    time.sleep(delay)
        except Exception as e:
            print(f"  [ERR] {url} → {e}")
            if attempt < retries - 1:
                time.sleep(delay)
    CRAWL_STATS["fail"] += 1
    return None


def soup(resp):
    return BeautifulSoup(resp.text, "lxml")


def clean(text):
    if not text:
        return ""
    return re.sub(r"\s+", " ", text.strip())


def is_internal(url):
    parsed = urlparse(url)
    return parsed.netloc in ("norcaljump.com", "www.norcaljump.com", "")


def normalise(url):
    """Ensure URL is absolute and strip trailing slashes for consistency."""
    full = urljoin(BASE_URL, url)
    return full.rstrip("/")


# ── Text extractors ───────────────────────────────────────────────────────────

def extract_phone(text):
    matches = re.findall(r"[\+\(]?[\d\s\-\(\)\.]{10,}", text)
    for m in matches:
        digits = re.sub(r"\D", "", m)
        if len(digits) >= 10:
            return m.strip()
    return ""


def extract_email(text):
    m = re.search(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}", text)
    return m.group(0) if m else ""


def extract_social(s):
    social = {}
    for a in s.find_all("a", href=True):
        href = a["href"]
        for platform in ("facebook", "instagram", "twitter", "youtube", "yelp"):
            if platform in href:
                social[platform] = href
    return social


def extract_prices(s):
    """Return (price_from, price_details_dict)."""
    price_from = ""
    price_details = {}

    dollar_hits = s.find_all(string=re.compile(r"\$\s*\d+"))
    prices_seen = []
    for hit in dollar_hits:
        m = re.search(r"\$\s*([\d,]+(?:\.\d{2})?)", hit)
        if m:
            amount = m.group(0).replace(" ", "")
            context = clean(str(hit.parent.get_text()))
            prices_seen.append((amount, context))
            dur = re.search(r"(\d+)\s*(hr|hour|day|night)", context, re.I)
            if dur:
                price_details[dur.group(0)] = amount
            elif not price_from:
                price_from = amount

    if not price_from and prices_seen:
        price_from = prices_seen[0][0]

    return price_from, price_details


def extract_images(s, base=BASE_URL):
    images = []
    for img in s.find_all("img"):
        src = (img.get("src") or img.get("data-src") or
               img.get("data-lazy-src") or img.get("data-original") or "")
        if src and re.search(r"\.(jpg|jpeg|png|webp|gif)", src, re.I):
            full = urljoin(base, src)
            if full not in images:
                images.append(full)
    return images


def extract_dimensions(text):
    m = re.search(
        r"(\d+\s*[\'\"xX×]\s*\d+(?:\s*[\'\"xX×]\s*\d+)?(?:\s*(?:ft|feet|\')?)?)",
        text
    )
    return m.group(1).strip() if m else ""


def extract_capacity(text):
    m = re.search(r"(\d+(?:\s*[-–to]+\s*\d+)?)\s*(?:kids?|children|persons?|riders?)", text, re.I)
    return m.group(0) if m else ""


def extract_age(text):
    m = re.search(r"age[s]?\s*[:\-]?\s*(\d+[\+\-]?\s*(?:to|and|–|-|&)?\s*\d*\+?)", text, re.I)
    return m.group(0) if m else ""


def map_category(conn, raw_name):
    """Map a raw category name string to a canonical category id."""
    lower = raw_name.lower()
    for keyword, canonical in CATEGORY_MAP.items():
        if keyword in lower:
            return get_category_id(conn, canonical)
    return None


# ── Page savers ───────────────────────────────────────────────────────────────

def save_page(conn, biz_id, url, title, content, page_type):
    conn.execute("""
        INSERT OR REPLACE INTO pages (business_id, url, title, content, page_type, crawled_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
    """, (biz_id, url, title, content[:5000], page_type))
    conn.commit()


# ── Crawl phases ──────────────────────────────────────────────────────────────

def crawl_homepage(conn, biz_id):
    """Phase 1 – home page: extract contact info + discover all internal links."""
    print("\n[Phase 1] Home page")
    resp = fetch(BASE_URL)
    if not resp:
        print("  Could not fetch homepage!")
        return [], set()

    s = soup(resp)
    text = s.get_text()

    phone = extract_phone(text) or BUSINESS["phone"]
    email = extract_email(text)
    social = extract_social(s)

    about_parts = []
    about_kws = ["company", "family", "founded", "serving", "mission", "years", "experience", "trusted"]
    for p in s.find_all("p"):
        t = clean(p.get_text())
        if any(kw in t.lower() for kw in about_kws) and len(t) > 80:
            about_parts.append(t)

    conn.execute("""
        UPDATE businesses SET phone=?, email=?, social_links=?, about=?, updated_at=datetime('now')
        WHERE id=?
    """, (phone, email, json.dumps(social), " ".join(about_parts[:3]), biz_id))
    conn.commit()
    print(f"  phone={phone}  email={email}  social={list(social.keys())}")

    # Collect all internal links
    all_links = set()
    cat_urls = []
    for a in s.find_all("a", href=True):
        href = a["href"]
        full = normalise(urljoin(BASE_URL, href))
        if not is_internal(full):
            continue
        all_links.add(full)
        # Detect category pages by pattern /-cNNN.html
        if re.search(r"-c\d+\.html$", full):
            label = clean(a.get_text()) or full.split("/")[-1]
            cat_urls.append((label, full))

    save_page(conn, biz_id, BASE_URL, "NorCal Jump – Home", text, "home")
    print(f"  Discovered {len(all_links)} internal links, {len(cat_urls)} category pages")
    return cat_urls, all_links


def crawl_sitemap(conn, biz_id):
    """Phase 2 – try sitemaps for additional URLs."""
    print("\n[Phase 2] Sitemap discovery")
    found = []
    for sm in [
        f"{BASE_URL}/sitemap.xml",
        f"{BASE_URL}/sitemap_index.xml",
        f"{BASE_URL}/sitemap1.xml",
    ]:
        resp = fetch(sm)
        if resp:
            urls = re.findall(r"<loc>(.*?)</loc>", resp.text)
            found.extend(urls)
            print(f"  {sm}: {len(urls)} URLs")
    return list(dict.fromkeys(found))


def crawl_category(conn, biz_id, cat_name, cat_url):
    """Phase 3 – category listing page: return all product URLs found."""
    print(f"\n  [Category] {cat_name}")
    resp = fetch(cat_url)
    if not resp:
        return []

    s = soup(resp)
    save_page(conn, biz_id, cat_url,
              clean(s.title.get_text()) if s.title else cat_name,
              s.get_text(), "category")

    product_urls = []
    for a in s.find_all("a", href=True):
        href = a["href"]
        full = normalise(urljoin(BASE_URL, href))
        # Product pages match /-pNNNN.html
        if re.search(r"-p\d+\.html$", full):
            product_urls.append(full)

    product_urls = list(dict.fromkeys(product_urls))
    print(f"    → {len(product_urls)} product links")

    # Also scrape listing cards directly off the category page
    _scrape_listing_cards(conn, biz_id, s, cat_url, cat_name)
    time.sleep(0.5)
    return product_urls


def _scrape_listing_cards(conn, biz_id, s, page_url, cat_name):
    """Extract product cards embedded in a listing/category page."""
    cat_id = map_category(None, cat_name) if False else None  # resolved per-item below
    items = []

    # Try common card selectors
    for sel in ["div.product", "div.item", "li.product", "div[class*='product']",
                "div[class*='item']", "div.col", "article"]:
        cards = s.select(sel)
        if cards:
            for card in cards:
                name_tag = card.find(["h2", "h3", "h4"])
                name = clean(name_tag.get_text()) if name_tag else ""
                link_tag = card.find("a", href=True)
                link = normalise(urljoin(BASE_URL, link_tag["href"])) if link_tag else page_url
                price_tag = card.find(class_=re.compile(r"price|cost|rate", re.I))
                price = clean(price_tag.get_text()) if price_tag else ""
                img_tag = card.find("img")
                img = ""
                if img_tag:
                    img = (img_tag.get("src") or img_tag.get("data-src") or
                           img_tag.get("data-lazy-src") or "")

                if name and re.search(r"-p\d+\.html$", link):
                    items.append({
                        "name": name, "url": link,
                        "price_from": price,
                        "thumbnail_url": urljoin(BASE_URL, img) if img else "",
                    })
            break

    # Fallback: anchors with image + product URL
    if not items:
        for a in s.find_all("a", href=True):
            full = normalise(urljoin(BASE_URL, a["href"]))
            if re.search(r"-p\d+\.html$", full) and a.find("img"):
                name_tag = a.find(["h2", "h3", "h4", "span", "p"])
                name = clean(name_tag.get_text()) if name_tag else clean(a.get_text())
                img_tag = a.find("img")
                img = img_tag.get("src") or img_tag.get("data-src", "") if img_tag else ""
                if name:
                    items.append({
                        "name": name, "url": full,
                        "thumbnail_url": urljoin(BASE_URL, img) if img else "",
                    })

    for item in items:
        _upsert_inventory(conn, biz_id, item, cat_name)


def crawl_product(conn, biz_id, url, cat_name=""):
    """Phase 4 – single product detail page."""
    resp = fetch(url)
    if not resp:
        return None

    s = soup(resp)
    text = s.get_text()

    title_tag = s.find(["h1", "h2"])
    name = clean(title_tag.get_text()) if title_tag else ""

    # Description: prefer labelled containers, fallback to first long paragraph
    desc = ""
    for tag in s.find_all(["p", "div"],
                           class_=re.compile(r"desc|detail|about|info|content|body", re.I)):
        t = clean(tag.get_text())
        if len(t) > 50:
            desc = t
            break
    if not desc:
        for p in s.find_all("p"):
            t = clean(p.get_text())
            if len(t) > 60:
                desc = t
                break

    price_from, price_details = extract_prices(s)
    dimensions  = extract_dimensions(text)
    capacity    = extract_capacity(text)
    age_range   = extract_age(text)

    # Setup area often appears near dimensions
    setup_area = ""
    sa_match = re.search(
        r"(?:space|setup|area|required)[:\s]+(\d+\s*[\'\"xX×]\s*\d+)", text, re.I
    )
    if sa_match:
        setup_area = sa_match.group(1)

    # Features
    features = []
    for ul in s.find_all("ul"):
        for li in ul.find_all("li"):
            f = clean(li.get_text())
            if f and len(f) > 3:
                features.append(f)
        if features:
            break

    images = extract_images(s)
    thumbnail = images[0] if images else ""

    # Rules / safety
    rules = ""
    for tag in s.find_all(["div", "section"]):
        t = clean(tag.get_text())
        if re.search(r"rule|safety|guideline", t, re.I) and len(t) > 50:
            rules = t[:600]
            break

    slug = url.rstrip("/").split("/")[-1].replace(".html", "")

    item = {
        "name":          name or slug,
        "slug":          slug,
        "url":           url,
        "description":   desc,
        "price_from":    price_from,
        "price_details": price_details,
        "dimensions":    dimensions,
        "setup_area":    setup_area,
        "capacity":      capacity,
        "age_range":     age_range,
        "features":      features,
        "images":        images,
        "thumbnail_url": thumbnail,
        "rules":         rules,
    }

    result_id = _upsert_inventory(conn, biz_id, item, cat_name)
    save_page(conn, biz_id, url, name, text, "item")

    feat_count = len(features)
    img_count  = len(images)
    print(f"    [item] {name or slug}: price={price_from}  imgs={img_count}  feats={feat_count}")
    return result_id


def _upsert_inventory(conn, biz_id, item, cat_name=""):
    """Insert or update one inventory row; returns rowid."""
    cat_id = map_category(conn, cat_name or item.get("name", ""))

    conn.execute("""
        INSERT INTO inventory
            (business_id, category_id, name, slug, url, description,
             price_from, price_details, dimensions, setup_area, capacity,
             age_range, features, images, thumbnail_url, rules, updated_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'))
        ON CONFLICT(business_id, url) DO UPDATE SET
            name          = excluded.name,
            category_id   = COALESCE(excluded.category_id, category_id),
            description   = COALESCE(NULLIF(excluded.description,''), description),
            price_from    = COALESCE(NULLIF(excluded.price_from,''),  price_from),
            price_details = COALESCE(NULLIF(excluded.price_details,'{}'), price_details),
            dimensions    = COALESCE(NULLIF(excluded.dimensions,''),  dimensions),
            setup_area    = COALESCE(NULLIF(excluded.setup_area,''),  setup_area),
            capacity      = COALESCE(NULLIF(excluded.capacity,''),    capacity),
            features      = COALESCE(NULLIF(excluded.features,'[]'),  features),
            images        = COALESCE(NULLIF(excluded.images,'[]'),    images),
            thumbnail_url = COALESCE(NULLIF(excluded.thumbnail_url,''), thumbnail_url),
            updated_at    = datetime('now')
    """, (
        biz_id,
        cat_id,
        item.get("name", ""),
        item.get("slug", ""),
        item.get("url", ""),
        item.get("description", ""),
        item.get("price_from", ""),
        json.dumps(item.get("price_details", {})),
        item.get("dimensions", ""),
        item.get("setup_area", ""),
        item.get("capacity", ""),
        item.get("age_range", ""),
        json.dumps(item.get("features", [])),
        json.dumps(item.get("images", [])),
        item.get("thumbnail_url", ""),
        item.get("rules", ""),
    ))
    conn.commit()
    c = conn.execute(
        "SELECT id FROM inventory WHERE business_id=? AND url=?",
        (biz_id, item.get("url", ""))
    )
    row = c.fetchone()
    return row[0] if row else None


def crawl_service_areas(conn, biz_id, all_links, s_home=None):
    """Phase 5 – discover and store cities NorCal Jump serves."""
    print("\n[Phase 5] Service areas")
    saved = set()

    # Pattern 1: links matching /pages/bounce-house-rental-city-ca
    #            or /store-NN-city.html
    #            or /City  (capital letter path)
    for url in all_links:
        path = urlparse(url).path.lower()
        city = None

        m = re.search(r"/pages/(?:bounce-house-rental-)?(.+?)(?:-ca)?$", path)
        if m:
            city = m.group(1).replace("-", " ").title()

        if not city:
            m = re.search(r"/store-\d+-(.+?)\.html$", path)
            if m:
                city = m.group(1).replace("-", " ").title()

        if not city:
            # bare /CityName paths like /Concord
            seg = urlparse(url).path.strip("/")
            if seg and " " not in seg and seg[0].isupper() and len(seg) < 30:
                city = seg

        if city and city not in saved:
            saved.add(city)
            conn.execute("""
                INSERT OR IGNORE INTO service_areas (business_id, city, state, url)
                VALUES (?, ?, 'CA', ?)
            """, (biz_id, city, url))

    # Pattern 2: city names extracted from homepage text / delivery-area page
    for sm_url in [f"{BASE_URL}/delivery-area-n2.html", f"{BASE_URL}/delivery-area/"]:
        resp = fetch(sm_url)
        if resp:
            text = soup(resp).get_text()
            city_pat = re.compile(
                r"\b((?:East |West |North |South |Los |San |Santa |El |La |Mount |Mt\.? )?[A-Z][a-z]+(?:\s[A-Z][a-z]+)?),?\s*CA\b"
            )
            for m in city_pat.finditer(text):
                city = m.group(1).strip()
                if city not in saved and len(city) > 2:
                    saved.add(city)
                    conn.execute("""
                        INSERT OR IGNORE INTO service_areas (business_id, city, state)
                        VALUES (?, ?, 'CA')
                    """, (biz_id, city))
            break

    conn.commit()
    print(f"  Saved {len(saved)} cities")


def crawl_store_pages(conn, biz_id, all_links):
    """Phase 6 – /store-NN-city.html pages for extra inventory links."""
    print("\n[Phase 6] Store / location pages")
    store_links = [u for u in all_links if re.search(r"/store-\d+-", u)]
    print(f"  {len(store_links)} store pages found")

    extra_products = set()
    for url in store_links:
        resp = fetch(url)
        if not resp:
            continue
        s = soup(resp)
        for a in s.find_all("a", href=True):
            full = normalise(urljoin(BASE_URL, a["href"]))
            if re.search(r"-p\d+\.html$", full):
                extra_products.add(full)
        time.sleep(0.3)

    print(f"  {len(extra_products)} additional product URLs discovered")
    return extra_products


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = get_conn()
    init_db(conn)

    # Register / update the business
    biz_id = upsert_business(conn, **BUSINESS)
    print(f"\n[BIZ] NorCal Jump → business_id={biz_id}")

    # Phase 1 – homepage
    homepage_cats, all_links = crawl_homepage(conn, biz_id)

    # Phase 2 – sitemap
    sitemap_urls = crawl_sitemap(conn, biz_id)
    for su in sitemap_urls:
        all_links.add(normalise(su))

    # Phase 3 – category pages
    # Merge homepage-discovered cats with known ones; de-dup by URL
    cat_map = {url: name for name, url in KNOWN_CATEGORY_URLS}
    for name, url in homepage_cats:
        if url not in cat_map:
            cat_map[url] = name

    all_product_urls = set()
    print("\n[Phase 3] Category pages")
    for cat_url, cat_name in cat_map.items():
        product_urls = crawl_category(conn, biz_id, cat_name, cat_url)
        all_product_urls.update(product_urls)

    # Also pull product URLs from sitemap / all_links
    for url in all_links:
        if re.search(r"-p\d+\.html$", url):
            all_product_urls.add(url)

    # Phase 4 – product detail pages
    print(f"\n[Phase 4] Product detail pages ({len(all_product_urls)} items)")
    for url in sorted(all_product_urls):
        # Guess category from URL slug
        slug = urlparse(url).path.lower()
        cat_name = ""
        for kw, canonical in CATEGORY_MAP.items():
            if kw in slug:
                cat_name = canonical
                break
        crawl_product(conn, biz_id, url, cat_name)
        time.sleep(0.4)

    # Phase 5 – service areas
    crawl_service_areas(conn, biz_id, all_links)

    # Phase 6 – store pages → extra products
    extra = crawl_store_pages(conn, biz_id, all_links)
    new_products = extra - all_product_urls
    if new_products:
        print(f"\n[Phase 6b] Crawling {len(new_products)} newly discovered products")
        for url in sorted(new_products):
            crawl_product(conn, biz_id, url)
            time.sleep(0.4)

    # ── Summary ───────────────────────────────────────────────────────────────
    print("\n=== NorCal Jump crawl complete ===")
    for table in ("inventory", "categories", "service_areas", "pages"):
        row = conn.execute(f"SELECT COUNT(*) FROM {table} WHERE {'business_id=?' if table != 'categories' else '1=1'}", (biz_id,) if table != "categories" else ()).fetchone()
        print(f"  {table:15s}: {row[0]}")
    print(f"  HTTP ok={CRAWL_STATS['ok']}  fail={CRAWL_STATS['fail']}")

    report = {
        "business": "NorCal Jump",
        "business_id": biz_id,
        "database": DB_PATH,
        "stats": CRAWL_STATS,
    }
    report_path = os.path.join(os.path.dirname(DB_PATH), "norcaljump_report.json")
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)
    print(f"\n[REPORT] {report_path}")
    print(f"[DB]     {DB_PATH}")

    conn.close()
    return report


if __name__ == "__main__":
    main()
