// ============================================================
// 泡盛案内板 — メインアプリケーション
// ============================================================

/** 料理カテゴリーと泡盛CSVカテゴリーのマッピング */
const FOOD_MAPPING = {
  nikomi_okinawa: ['nikomi', 'okinawa'],
  kaisen: ['kaisen'],
  steak: ['steak'],
  spicy: ['spicy'],
  cheese: ['cheese'],
  italian: ['italian'],
  izakaya: ['izakaya', 'agemono'],
  dessert: ['dessert'],
};

/** コク・甘さのラベル（1-5） */
const RICHNESS_LABELS = ['', '薄め', 'やや薄', '中間', 'やや濃', '濃い'];
const SWEETNESS_LABELS = ['', '辛口', 'やや辛', '中間', 'やや甘', '甘口'];

/** ステップ遷移タイミング (ms) */
const PICK_DELAY = 360;
const STEP_LOADING = 450;
const RESULT_LOADING = 1100;
const METER_ANIMATION_DELAY = 50;

// ============================================================
// State
// ============================================================

let awamoriData = [];
let selections = { rich: null, sweet: null, food: null, drink: null };

// ============================================================
// CSV Parser
// ============================================================

/**
 * CSVテキストを泡盛オブジェクト配列にパースする
 * パイプ(|)区切りの配列フィールドに対応
 */
function parseAwamoriCsv(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = parseCsvLine(lines[0]);

  return lines.slice(1).map(line => {
    const values = parseCsvLine(line);
    const row = {};
    headers.forEach((h, i) => { row[h] = values[i] || ''; });

    return {
      id: Number(row.id),
      name: row.name,
      brewery: row.brewery,
      degree: Number(row.degree),
      type: row.type,
      richness: Number(row.richness),
      sweetness: Number(row.sweetness),
      flavor: row.flavor,
      pairing: row.pairing,
      methods: [
        { icon: row.method1_icon, name: row.method1_name, note: row.method1_note },
        { icon: row.method2_icon, name: row.method2_name, note: row.method2_note },
        { icon: row.method3_icon, name: row.method3_name, note: row.method3_note },
      ],
      pairingEmoji: row.pairing_emoji.split('|'),
      pairingLabels: row.pairing_labels.split('|'),
      pairingCats: row.pairing_cats.split('|'),
      similar: row.similar.split('|'),
    };
  });
}

/**
 * CSV行をパースする（カンマ区切り、ダブルクォート対応）
 */
function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result;
}

// ============================================================
// Data Loading
// ============================================================

async function loadData() {
  const response = await fetch('data/awamori.csv');
  const csvText = await response.text();
  awamoriData = parseAwamoriCsv(csvText);
}

// ============================================================
// UI — Step Navigation
// ============================================================

function showStep(stepIndex) {
  document.querySelectorAll('.board-section').forEach(s => s.classList.remove('active'));
  document.getElementById('step' + stepIndex).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateNail(index, state) {
  const nail = document.getElementById('nail' + index);
  if (!nail) return;
  nail.className = 'nail ' + state;

  if (index < 3 && state === 'done') {
    const connector = document.getElementById('conn' + index);
    if (connector) connector.classList.add('done');
  }
}

function advanceStep(fromStep) {
  const nextStep = fromStep + 1;
  updateNail(fromStep, 'done');
  if (nextStep <= 3) updateNail(nextStep, 'active');

  const loading = document.getElementById('loadingRow');
  loading.style.display = 'block';

  const delay = nextStep === 4 ? RESULT_LOADING : STEP_LOADING;
  setTimeout(() => {
    loading.style.display = 'none';
    if (nextStep <= 3) {
      showStep(nextStep);
    } else {
      showResult();
    }
  }, delay);
}

// ============================================================
// UI — Selection Handler
// ============================================================

function pick(step, key, value, element) {
  // 同じグリッド内の選択状態をクリア
  element.closest('.opt-grid')
    .querySelectorAll('.opt-card')
    .forEach(c => c.classList.remove('selected'));
  element.classList.add('selected');

  selections[key] = value;
  setTimeout(() => advanceStep(step), PICK_DELAY);
}

// グローバルに公開（onclick属性から呼ばれるため）
window.pick = pick;

// ============================================================
// Recommendation Engine
// ============================================================

function calculateScores() {
  return awamoriData.map(awamori => {
    let score = 0;

    // コク値の距離スコア（最大5）
    score += 5 - Math.abs(awamori.richness - (selections.rich || 3));

    // 甘さ値の距離スコア（最大5）
    score += 5 - Math.abs(awamori.sweetness - (selections.sweet || 3));

    // 料理マッチボーナス（+3）
    if (selections.food && selections.food !== 'none') {
      const matchCats = FOOD_MAPPING[selections.food] || [];
      if (matchCats.some(cat => awamori.pairingCats.includes(cat))) {
        score += 3;
      }
    }

    // 普段のお酒の類似度ボーナス（+2〜3）
    if (selections.drink && selections.drink !== 'none') {
      if (awamori.similar.includes(selections.drink)) score += 2;
      if (selections.drink === 'cocktail') {
        if (awamori.similar.includes('highball') || awamori.similar.includes('chuhai')) {
          score += 1;
        }
      }
    }

    return { ...awamori, score };
  }).sort((a, b) => b.score - a.score);
}

function showResult() {
  updateNail(3, 'done');
  const ranked = calculateScores();
  renderResult(ranked[0], ranked.slice(1, 3));
  showStep(4);

  // メーターアニメーションをトリガー
  setTimeout(() => {
    document.querySelectorAll('.meter-fill').forEach(fill => {
      fill.style.width = fill.dataset.w + '%';
    });
  }, METER_ANIMATION_DELAY);
}

// ============================================================
// Rendering
// ============================================================

function renderResult(best, alternatives) {
  const richnessPercent = Math.round((best.richness / 5) * 100);
  const sweetnessPercent = Math.round((best.sweetness / 5) * 100);
  const richnessLabel = RICHNESS_LABELS[best.richness];
  const sweetnessLabel = SWEETNESS_LABELS[best.sweetness];

  const pairingHtml = best.pairingEmoji
    .map((emoji, i) => `<span class="pairing-chip">${emoji} ${best.pairingLabels[i]}</span>`)
    .join('');

  const methodsHtml = best.methods
    .map(m => `
      <div class="method-tile">
        <span class="method-icon">${m.icon}</span>
        <span class="method-name">${m.name}</span>
        <span class="method-note">${m.note}</span>
      </div>`)
    .join('');

  const altsHtml = alternatives
    .map(alt => `
      <div class="alt-tile">
        <span class="alt-tile-icon">🍶</span>
        <div class="alt-tile-name">${alt.name}</div>
        <div class="alt-tile-note">${alt.flavor.slice(0, 34)}…</div>
      </div>`)
    .join('');

  document.getElementById('step4').innerHTML = `
    <div class="result-board">
      <div class="name-plate">
        <div class="name-plate-eyebrow">Your Perfect Awamori</div>
        <div class="name-plate-name">${best.name}</div>
        <div class="name-plate-brewery">${best.brewery}</div>
      </div>
      <div class="tag-row">
        <span class="tag degree">🔢 ${best.degree}度</span>
        <span class="tag type">🏷 ${best.type}</span>
      </div>
      <div class="meters">
        <div class="meter-box">
          <div class="meter-label">コクの強さ</div>
          <div class="meter-track"><div class="meter-fill rich" data-w="${richnessPercent}" style="width:0%"></div></div>
          <div class="meter-value">${richnessLabel}</div>
        </div>
        <div class="meter-box">
          <div class="meter-label">甘さ</div>
          <div class="meter-track"><div class="meter-fill sweet" data-w="${sweetnessPercent}" style="width:0%"></div></div>
          <div class="meter-value">${sweetnessLabel}</div>
        </div>
      </div>
      <hr class="chalk-divider">
      <div class="section-title">飲み方</div>
      <div class="method-row">${methodsHtml}</div>
      <hr class="chalk-divider">
      <div class="section-title">合う肴</div>
      <div class="pairing-row">${pairingHtml}</div>
      ${alternatives.length ? `
        <hr class="chalk-divider">
        <div class="section-title">他のおすすめ</div>
        <div class="alts-grid">${altsHtml}</div>
      ` : ''}
    </div>`;
}

// ============================================================
// Reset
// ============================================================

function resetAll() {
  selections = { rich: null, sweet: null, food: null, drink: null };

  for (let i = 0; i < 4; i++) {
    document.getElementById('nail' + i).className = 'nail' + (i === 0 ? ' active' : '');
  }
  for (let i = 0; i < 3; i++) {
    document.getElementById('conn' + i).className = 'nail-connector';
  }

  document.querySelectorAll('.opt-card').forEach(c => c.classList.remove('selected'));
  showStep(0);
}

window.resetAll = resetAll;

// ============================================================
// Init
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  loadData();
});
