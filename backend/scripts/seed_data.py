"""
サンプルデータを投入するスクリプト。
使い方: uv run python scripts/seed_data.py
事前に create_admin.py を実行しておくこと。
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlmodel import Session, select
from app.db.session import engine
from app.models.user import User
from app.models.domain import Domain
from app.models.tag import Tag
from app.models.recipe import Recipe, RecipeTag

DOMAINS = [
    {"name": "製造", "description": "生産・在庫・品質管理に関する分析"},
    {"name": "営業", "description": "売上・受注・顧客に関する分析"},
    {"name": "経営", "description": "KPI・財務・経営指標に関する分析"},
]

TAGS = ["SAP", "CRM", "SCM", "WMS", "MES", "ERP", "BW"]

RECIPES = [
    {
        "title": "売上集計",
        "domain": "営業",
        "tags": ["SAP", "CRM"],
        "description": "月次の顧客別売上を集計するSQL。税抜き金額で集計している点に注意。返品を除外する場合は WHERE status = 'confirmed' を追加すること。",
        "sql_text": """\
SELECT
    c.customer_name,
    SUM(s.amount) AS total_sales
FROM sales s
JOIN customers c ON s.customer_id = c.id
WHERE s.status = 'confirmed'
  AND s.fiscal_year = 2026
GROUP BY c.customer_name
ORDER BY total_sales DESC""",
    },
    {
        "title": "在庫推移",
        "domain": "製造",
        "tags": ["SCM", "WMS"],
        "description": "週次の倉庫別在庫量を集計して推移を確認する。海外拠点は inventory_overseas テーブルに分かれているため注意。",
        "sql_text": """\
SELECT
    w.warehouse_name,
    p.product_name,
    i.quantity,
    i.recorded_at
FROM inventory i
JOIN warehouses w ON i.warehouse_id = w.id
JOIN products p ON i.product_id = p.id
WHERE i.recorded_at >= '2026-01-01'
ORDER BY i.recorded_at ASC""",
    },
    {
        "title": "KPI集計",
        "domain": "経営",
        "tags": ["BW"],
        "description": "経営ダッシュボード用のKPI集計SQL。月次更新。粗利率の計算に注意（税抜き金額ベース）。",
        "sql_text": """\
WITH monthly_kpi AS (
    SELECT
        DATE_TRUNC('month', t.transaction_date) AS month,
        SUM(t.revenue) AS revenue,
        SUM(t.cost) AS cost
    FROM transactions t
    WHERE t.transaction_date >= '2026-01-01'
    GROUP BY DATE_TRUNC('month', t.transaction_date)
)
SELECT
    month,
    revenue,
    cost,
    revenue - cost AS gross_profit,
    ROUND((revenue - cost) / revenue * 100, 2) AS gross_margin
FROM monthly_kpi
ORDER BY month""",
    },
    {
        "title": "受注分析",
        "domain": "営業",
        "tags": ["SAP"],
        "description": "受注から出荷までのリードタイム分析。週次でモニタリングに使用。",
        "sql_text": """\
SELECT
    o.order_id,
    o.order_date,
    s.ship_date,
    s.ship_date - o.order_date AS lead_time_days
FROM orders o
JOIN shipments s ON o.order_id = s.order_id
WHERE o.order_date >= '2026-01-01'
ORDER BY lead_time_days DESC""",
    },
    {
        "title": "生産実績",
        "domain": "製造",
        "tags": ["MES", "ERP"],
        "description": "ライン別の日次生産実績と計画乖離率を算出する。計画値は production_plan テーブルから取得。",
        "sql_text": """\
SELECT
    l.line_name,
    pp.planned_qty,
    pa.actual_qty,
    ROUND((pa.actual_qty - pp.planned_qty) * 100.0 / pp.planned_qty, 2) AS variance_pct
FROM production_actual pa
JOIN production_plan pp ON pa.line_id = pp.line_id AND pa.work_date = pp.work_date
JOIN lines l ON pa.line_id = l.id
WHERE pa.work_date = CURRENT_DATE - INTERVAL '1 day'
ORDER BY variance_pct ASC""",
    },
    {
        "title": "粗利分析",
        "domain": "経営",
        "tags": ["BW", "SAP"],
        "description": "製品カテゴリ別の粗利率を算出する月次レポート用SQL。税抜き金額で計算。",
        "sql_text": """\
SELECT
    pc.category_name,
    SUM(s.revenue) AS revenue,
    SUM(s.cogs) AS cogs,
    SUM(s.revenue) - SUM(s.cogs) AS gross_profit,
    ROUND((SUM(s.revenue) - SUM(s.cogs)) / SUM(s.revenue) * 100, 2) AS gross_margin_pct
FROM sales_detail s
JOIN products p ON s.product_id = p.id
JOIN product_categories pc ON p.category_id = pc.id
WHERE s.sale_date >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY pc.category_name
ORDER BY gross_margin_pct DESC""",
    },
]


def seed() -> None:
    with Session(engine) as session:
        # 管理者ユーザーを取得
        admin = session.exec(select(User).where(User.username == "admin")).first()
        if not admin:
            print("管理者ユーザーが見つかりません。先に create_admin.py を実行してください。")
            return

        # ドメインを作成
        domain_map: dict[str, Domain] = {}
        for d in DOMAINS:
            existing = session.exec(select(Domain).where(Domain.name == d["name"])).first()
            if existing:
                domain_map[d["name"]] = existing
            else:
                domain = Domain(**d)
                session.add(domain)
                session.commit()
                session.refresh(domain)
                domain_map[d["name"]] = domain
                print(f"ドメイン作成: {domain.name}")

        # タグを作成
        tag_map: dict[str, Tag] = {}
        for tag_name in TAGS:
            existing = session.exec(select(Tag).where(Tag.name == tag_name)).first()
            if existing:
                tag_map[tag_name] = existing
            else:
                tag = Tag(name=tag_name)
                session.add(tag)
                session.commit()
                session.refresh(tag)
                tag_map[tag_name] = tag
                print(f"タグ作成: {tag.name}")

        # レシピを作成
        for r in RECIPES:
            existing = session.exec(select(Recipe).where(Recipe.title == r["title"])).first()
            if existing:
                print(f"レシピ既存: {r['title']}")
                continue
            domain = domain_map[r["domain"]]
            recipe = Recipe(
                title=r["title"],
                description=r["description"],
                sql_text=r["sql_text"],
                domain_id=domain.id,
                created_by_id=admin.id,
            )
            session.add(recipe)
            session.commit()
            session.refresh(recipe)
            for tag_name in r["tags"]:
                tag = tag_map[tag_name]
                session.add(RecipeTag(recipe_id=recipe.id, tag_id=tag.id))
            session.commit()
            print(f"レシピ作成: {recipe.title}")

        print("サンプルデータの投入が完了しました")


if __name__ == "__main__":
    seed()
