#!/usr/bin/env bash
# Open Library aylık dump'larını apps/api/data/openlibrary altına indirir.
# Yarım kalan indirme kaldığı yerden devam eder (curl -C -).
# Toplam ~13 GB: editions ~9.2G, works ~2.9G, authors ~0.5G, reading-log + ratings ~70M.
# Works dump'ı isteğe bağlı: atlamak için SKIP_WORKS=1.
set -euo pipefail

cd "$(dirname "$0")/.."
DIR="data/openlibrary"
mkdir -p "$DIR"

files=(reading-log ratings authors editions)
[[ "${SKIP_WORKS:-0}" == "1" ]] || files+=(works)

for name in "${files[@]}"; do
  file="ol_dump_${name}_latest.txt.gz"
  echo "→ $file"
  curl -L --fail --retry 5 --retry-delay 10 -C - -o "$DIR/$file" "https://openlibrary.org/data/$file"
done

echo "✓ İndirildi: $DIR"
ls -lh "$DIR"
