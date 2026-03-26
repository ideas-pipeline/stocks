#!/bin/bash
# ─────────────────────────────────────────────────────────────
# update-watchlist-accuracy.sh
# يحدّث تاريخ آخر تحديث في watchlist-accuracy.html
# بتوقيت الرياض (UTC+3)
# ─────────────────────────────────────────────────────────────

set -euo pipefail

FILE="$(dirname "$0")/watchlist-accuracy.html"
NOW_UTC=$(date -u +"%Y-%m-%dT%H:%M:%S+03:00")

# التاريخ بالعربي (بتوقيت الرياض)
#_months_ar=(يناير فبراير مارس أبريل مايو يونيو يوليو أغسطس سبتمبر أكتوبر نوفمبر ديسمبر)
MONTHS=(يناير فبراير مارس أبريل مايو يونيو يوليو أغسطس سبتمبر أكتوبر نوفمبر ديسمبر)
NOW_DATE=$(date -u +"%Y-%m-%d")
YEAR=$(echo $NOW_DATE | cut -d'-' -f1)
MONTH=$(echo $NOW_DATE | cut -d'-' -f2 | sed 's/^0//')
DAY=$(echo $NOW_DATE | cut -d'-' -f3)
NOW_TIME=$(date -u +"%H:%M")

# تنسيق التاريخ بالعربي
DATETIME_AR="${DAY} ${MONTHS[$((MONTH-1))]} ${YEAR} في ${NOW_TIME} (بتوقيت الرياض)"
DATETIME_SHORT="${YEAR}-${MONTH}-${DAY} ${NOW_TIME}"

echo "⏱️  وقت التحديث (الرياض): ${DATETIME_AR}"

# ── تحديث CONFIG.updatedAt ──
if grep -q "updatedAt.*\".*\"" "$FILE"; then
    sed -i "s/updatedAt:.*\"\([^\"]*\)\"/updatedAt:   \"${NOW_UTC}\"/" "$FILE"
    echo "✅ تم تحديث CONFIG.updatedAt"
else
    echo "❌ لم يتم العثور على updatedAt في الملف"
    exit 1
fi

echo ""
echo "📋 ملخص:"
echo "   - الملف: $FILE"
echo "   - آخر تحديث: $DATETIME_AR"
echo "   - ISO: $NOW_UTC"
