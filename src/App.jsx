import { useState, useEffect } from 'react'
import './App.css'

// Food icons mapping
const foodIcons = {
  nikomi: '🍖',
  agemono: '🍤',
  itamemono: '🥘',
  nabe: '♨️',
  kaisen: '🐟',
  steak: '🥩',
  italian: '🍝',
  spicy: '🌶️',
  cheese: '🧀',
  dessert: '🍰',
  okinawa: '🌺',
  izakaya: '🏮',
}

function App() {
  const [awamoriData, setAwamoriData] = useState([])
  const [foodCategories, setFoodCategories] = useState({})
  const [drinkMapping, setDrinkMapping] = useState({})
  const [activeTab, setActiveTab] = useState('taste')
  const [selectedQuadrant, setSelectedQuadrant] = useState(null)
  const [selectedDrinks, setSelectedDrinks] = useState(new Set())
  const [selectedFoods, setSelectedFoods] = useState(new Set())
  const [tasteResults, setTasteResults] = useState([])
  const [foodResults, setFoodResults] = useState([])

  // Load data
  useEffect(() => {
    fetch('/awamori-recommend/awamori-data.json')
      .then(res => res.json())
      .then(data => {
        setAwamoriData(data.awamoriData)
        setFoodCategories(data.foodCategories)
        setDrinkMapping(data.drinkMapping)
      })
      .catch(error => {
        console.error('データ読み込みエラー:', error)
        alert('データの読み込みに失敗しました')
      })
  }, [])

  // Taste-based search
  const handleTasteSearch = () => {
    if (!selectedQuadrant) return

    let results = awamoriData.filter(a => a.quadrant === selectedQuadrant)

    if (selectedDrinks.size > 0) {
      results = results.map(a => ({
        ...a,
        score: a.similarDrinks.filter(d => selectedDrinks.has(d)).length
      })).sort((a, b) => b.score - a.score)
    }

    if (results.length === 0) {
      results = awamoriData.slice().sort((a, b) => {
        const aMatch = a.similarDrinks.filter(d => selectedDrinks.has(d)).length
        const bMatch = b.similarDrinks.filter(d => selectedDrinks.has(d)).length
        return bMatch - aMatch
      }).slice(0, 3)
    }

    setTasteResults(results)
  }

  // Food-based search
  const handleFoodSearch = () => {
    if (selectedFoods.size === 0) return

    const foodArr = [...selectedFoods]
    let scored = awamoriData.map(a => ({
      ...a,
      score: a.pairings.filter(p => foodArr.includes(p)).length
    })).filter(a => a.score > 0).sort((a, b) => b.score - a.score)

    if (scored.length === 0) {
      scored = awamoriData.slice(0, 3).map(a => ({ ...a, score: 0 }))
    }

    setFoodResults(scored)
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <h1>泡盛レコメンド</h1>
        <p>あなたにぴったりの泡盛と料理の組み合わせを見つけよう</p>
      </header>

      {/* Tab Navigation */}
      <nav className="tab-nav">
        <button
          className={`tab-btn ${activeTab === 'taste' ? 'active' : ''}`}
          onClick={() => setActiveTab('taste')}
        >
          好みで探す
        </button>
        <button
          className={`tab-btn ${activeTab === 'food' ? 'active' : ''}`}
          onClick={() => setActiveTab('food')}
        >
          料理で探す
        </button>
      </nav>

      {/* Taste Tab */}
      {activeTab === 'taste' && (
        <div className="tab-content">
          <h2 className="section-title">味わいの好みを選んでください</h2>

          {/* Taste Map */}
          <div className="taste-map-container">
            <svg className="taste-map-svg" viewBox="0 0 400 400">
              <rect
                className={`taste-quadrant ${selectedQuadrant === 'light-dry' ? 'selected' : ''}`}
                x="5" y="5" width="193" height="193" rx="12"
                fill="#e0f2fe"
                onClick={() => setSelectedQuadrant('light-dry')}
              />
              <rect
                className={`taste-quadrant ${selectedQuadrant === 'light-sweet' ? 'selected' : ''}`}
                x="202" y="5" width="193" height="193" rx="12"
                fill="#fef3c7"
                onClick={() => setSelectedQuadrant('light-sweet')}
              />
              <rect
                className={`taste-quadrant ${selectedQuadrant === 'rich-dry' ? 'selected' : ''}`}
                x="5" y="202" width="193" height="193" rx="12"
                fill="#ecfdf5"
                onClick={() => setSelectedQuadrant('rich-dry')}
              />
              <rect
                className={`taste-quadrant ${selectedQuadrant === 'rich-sweet' ? 'selected' : ''}`}
                x="202" y="202" width="193" height="193" rx="12"
                fill="#fce7f3"
                onClick={() => setSelectedQuadrant('rich-sweet')}
              />

              <text className="taste-axis-label" x="200" y="20" textAnchor="middle">軽やか</text>
              <text className="taste-axis-label" x="200" y="395" textAnchor="middle">濃厚・コクあり</text>
              <text className="taste-axis-label" x="12" y="205" textAnchor="start" transform="rotate(-90, 12, 205)">辛口・キレ</text>
              <text className="taste-axis-label" x="392" y="200" textAnchor="end" transform="rotate(90, 392, 200)">甘口・まろやか</text>

              <text className="taste-quadrant-label" x="100" y="95" fill="#1a56db">軽やか×キレ</text>
              <text className="taste-quadrant-label" x="100" y="115" fill="#1a56db" fontSize="11">スッキリ爽快系</text>
              <text className="taste-quadrant-label" x="300" y="95" fill="#92400e">軽やか×甘口</text>
              <text className="taste-quadrant-label" x="300" y="115" fill="#92400e" fontSize="11">フルーティー系</text>
              <text className="taste-quadrant-label" x="100" y="295" fill="#065f46">濃厚×キレ</text>
              <text className="taste-quadrant-label" x="100" y="315" fill="#065f46" fontSize="11">力強い伝統派</text>
              <text className="taste-quadrant-label" x="300" y="295" fill="#9d174d">濃厚×甘口</text>
              <text className="taste-quadrant-label" x="300" y="315" fill="#9d174d" fontSize="11">熟成・古酒系</text>
            </svg>
          </div>

          <h2 className="section-title">普段飲むお酒（任意）</h2>
          <div className="drink-selector">
            {['beer', 'sake', 'shochu', 'wine', 'whisky', 'cocktail', 'highball', 'chuhai'].map(drink => (
              <div
                key={drink}
                className={`drink-chip ${selectedDrinks.has(drink) ? 'selected' : ''}`}
                onClick={() => {
                  const newSet = new Set(selectedDrinks)
                  if (newSet.has(drink)) {
                    newSet.delete(drink)
                  } else {
                    newSet.add(drink)
                  }
                  setSelectedDrinks(newSet)
                }}
              >
                {drink === 'beer' && 'ビール'}
                {drink === 'sake' && '日本酒'}
                {drink === 'shochu' && '焼酎'}
                {drink === 'wine' && 'ワイン'}
                {drink === 'whisky' && 'ウイスキー'}
                {drink === 'cocktail' && 'カクテル'}
                {drink === 'highball' && 'ハイボール'}
                {drink === 'chuhai' && '酎ハイ'}
              </div>
            ))}
          </div>

          <button
            className="cta-btn"
            disabled={!selectedQuadrant}
            onClick={handleTasteSearch}
          >
            おすすめの泡盛を探す
          </button>

          <div className="results-area">
            {tasteResults.length === 0 ? (
              <div className="empty-state">味わいマップをタップして好みを選んでください</div>
            ) : (
              <>
                {selectedDrinks.size > 0 && drinkMapping[[...selectedDrinks][0]] && (
                  <div className="drink-tip">
                    💡 {drinkMapping[[...selectedDrinks][0]]}
                  </div>
                )}
                {tasteResults.map(awamori => (
                  <div key={awamori.id} className="result-card">
                    <h3>{awamori.name}</h3>
                    <div className="brewery">{awamori.brewery}</div>
                    <div className="tags">
                      <span className="tag tag-degree">{awamori.degree}度</span>
                      <span className="tag tag-type">{awamori.type}</span>
                    </div>
                    <div className="description">{awamori.flavorProfile}</div>
                    <div className="pairing">
                      <div className="pairing-label">おすすめの料理</div>
                      {awamori.pairingDescription}
                    </div>
                    <div className="how-to-drink">
                      <strong>飲み方：</strong>{awamori.recommendedDrink}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* Food Tab */}
      {activeTab === 'food' && (
        <div className="tab-content">
          <h2 className="section-title">好きな料理カテゴリーを選んでください</h2>

          <div className="food-grid">
            {Object.entries(foodCategories).map(([key, value]) => (
              <div
                key={key}
                className={`food-card ${selectedFoods.has(key) ? 'selected' : ''}`}
                onClick={() => {
                  const newSet = new Set(selectedFoods)
                  if (newSet.has(key)) {
                    newSet.delete(key)
                  } else {
                    newSet.add(key)
                  }
                  setSelectedFoods(newSet)
                }}
              >
                <div className="emoji">{foodIcons[key]}</div>
                <div className="label">{value.name}</div>
              </div>
            ))}
          </div>

          <button
            className="cta-btn"
            disabled={selectedFoods.size === 0}
            onClick={handleFoodSearch}
          >
            おすすめの泡盛を探す
          </button>

          <div className="results-area">
            {foodResults.length === 0 ? (
              <div className="empty-state">料理カテゴリーを選んでください</div>
            ) : (
              <>
                <div className="drink-tip">
                  🍽️ 「{[...selectedFoods].map(f => foodCategories[f]?.name).filter(Boolean).join('、')}」に合う泡盛
                </div>
                {foodResults.map(awamori => {
                  const matchedFoods = awamori.pairings
                    .filter(p => selectedFoods.has(p))
                    .map(p => foodCategories[p]?.name)
                    .filter(Boolean)

                  return (
                    <div key={awamori.id} className="result-card">
                      <h3>{awamori.name}</h3>
                      <div className="brewery">{awamori.brewery}</div>
                      <div className="tags">
                        <span className="tag tag-degree">{awamori.degree}度</span>
                        <span className="tag tag-type">{awamori.type}</span>
                        {matchedFoods.length > 0 && (
                          <span className="tag tag-taste">{matchedFoods.join('・')}に合う</span>
                        )}
                      </div>
                      <div className="description">{awamori.flavorProfile}</div>
                      <div className="pairing">
                        <div className="pairing-label">ペアリングのポイント</div>
                        {awamori.pairingDescription}
                      </div>
                      <div className="how-to-drink">
                        <strong>飲み方：</strong>{awamori.recommendedDrink}
                      </div>
                    </div>
                  )
                })}
              </>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        泡盛レコメンド｜ハッカソン 2026 プロトタイプ
      </footer>
    </div>
  )
}

export default App
