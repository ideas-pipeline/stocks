#!/bin/bash
# ─────────────────────────────────────────────────────────────
# update-watchlist-accuracy.sh
# يحدّث تاريخ آخر تحديث في watchlist-accuracy.html
# بتوقيت الرياض (UTC+3)
# ─────────────────────────────────────────────────────────────

set -euo pipefail

FILE="$(dirname "$0")/watchlist-accuracy.html"
NOW_UTC=$(date -u +"%Y-%m-%dT%H:%M:%S+03:00")
NOW_DATE=$(date -u +"%Y-%m-%d")
NOW_TIME=$(date -u +"%H:%M")

# تنسيق: YYYY-MM-DD HH:MM (بتوقيت الرياض)
DATETIME="${NOW_DATE} ${NOW_TIME}"

echo "⏱️  وقت التحديث (الرياض): ${DATETIME}"

# ── تحديث CONFIG.updatedAt ──
# الصيغة المطلوبة: "2025-03-17T21:32:00+01:00"
if grep -q "updatedAt.*\".*\"" "$FILE"; then
    sed -i "s/updatedAt:.*\"\([^\"]*\)\"/updatedAt:   \"${NOW_UTC}\"/" "$FILE"
    echo "✅ تم تحديث CONFIG.updatedAt"
else
    echo "❌ لم يتم العثور على updatedAt في الملف"
    exit 1
fi

# ── تحديث التاريخ المعروض في footer ──
# تحديث badge-date و footer
sed -i "s/تاريخ الدخول:.*/تاريخ الدخول: ${DATETIME}/" "$FILE"
echo "✅ تم تحديث التاريخ في Footer"

echo ""
echo "📋 ملخص:"
echo "   - الملف: $FILE"
echo "   - تاريخ التحديث: $DATETIME"
echo "   - ISO: $NOW_UTC"
