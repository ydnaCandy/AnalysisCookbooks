# バックアップ・リストア手順書

## バックアップ

### 手動バックアップ

```bash
cd /opt/analysis-cookbooks
docker compose exec db pg_dump -U postgres analysis_cookbooks > backup/backup_$(date +%Y%m%d_%H%M%S).sql
```

バックアップファイルは `backup/` フォルダに `backup_YYYYMMDD_HHMMSS.sql` 形式で保存される。

### バックアップ一覧の確認

```bash
ls -lh backup/
```

### 定期バックアップのcron設定（任意）

```bash
crontab -e
```

以下を追加（毎日午前2時に実行）:

```
0 2 * * * cd /opt/analysis-cookbooks && docker compose exec -T db pg_dump -U postgres analysis_cookbooks > backup/backup_$(date +\%Y\%m\%d).sql
```

---

## リストア

**注意:** リストアを実行すると既存のデータは上書きされる。必ず作業前にバックアップを取ること。

### 1. リストア前にバックアップを取る

```bash
cd /opt/analysis-cookbooks
docker compose exec db pg_dump -U postgres analysis_cookbooks > backup/backup_before_restore_$(date +%Y%m%d_%H%M%S).sql
```

### 2. アプリを停止

```bash
docker compose stop backend nginx
```

### 3. DBを再作成

```bash
docker compose exec db psql -U postgres -c "DROP DATABASE IF EXISTS analysis_cookbooks;"
docker compose exec db psql -U postgres -c "CREATE DATABASE analysis_cookbooks;"
```

### 4. バックアップからリストア

`backup_YYYYMMDD_HHMMSS.sql` を実際のファイル名に変更して実行:

```bash
docker compose exec -T db psql -U postgres analysis_cookbooks < backup/backup_YYYYMMDD_HHMMSS.sql
```

### 5. テーブル確認

```bash
docker compose exec db psql -U postgres -d analysis_cookbooks -c "\dt"
```

テーブル一覧が表示されることを確認。

### 6. アプリを再起動

```bash
docker compose start backend nginx
```

ブラウザで `http://サーバーIP:28000` にアクセスして動作確認。
