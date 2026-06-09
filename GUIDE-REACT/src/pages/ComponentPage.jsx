import { useState } from 'react'
import ButtonShowcase from './components/ButtonShowcase'
import InputShowcase from './components/InputShowcase'
import CheckboxShowcase from './components/CheckboxShowcase'
import './ComponentPage.scss'
import RadioShowcase from './components/RadioShowcase'

// ─────────────────────────────────────────────
// ComponentPage에 뭐가 필요하지?
// → 왼쪽에 메뉴 목록 (사이드바)
// → 오른쪽에 선택된 컴포넌트 쇼케이스
// → 메뉴 클릭하면 오른쪽 내용이 바뀜

// 변하ㄴ 값이 뭐가 있지?
// → 메뉴 목록? → 고정된 값 → state 불필요
// → 선택된 메뉴? → state 필요
// → 쇼케이스 내용? → 선택된 메뉴 따라 자동으로 바뀜
// ─────────────────────────────────────────────
const MENU_LIST = [
  { id: 'button', label: 'Button', component: <ButtonShowcase /> },
  { id: 'input', label: 'Input', component: <InputShowcase /> },
  { id: 'checkbox', label: 'Checkbox', component: <CheckboxShowcase /> },
  { id: 'radio', label: 'Radio', component: <RadioShowcase /> },
]

function ComponentPage() {
  // 1. state 선언
  const [activeID, setActiveID] = useState('button') // 현재 선택된 메뉴 id, 초기값은 'button'

  // 2. state로 뭘 할지 -> 파생 값 + 함
  const activeMenu = MENU_LIST.find((menu) => menu.id === activeID) // 현재 선택된 메뉴 객체
  
  return (
    <div className="component-page">
      {/* 사이드바 */}
      <aside className="component-sidebar">
        <p className="component-sidebar-tit">Components</p>
        <ul className="component-nav-list">
          {MENU_LIST.map((menu) => (
            <li key={menu.id} className="component-nav-item">
              <button className={["component-nav-btn", activeID === menu.id ? 'is-active' : ''].filter(Boolean).join(' ')} onClick={() => setActiveID(menu.id)}>
                {menu.label}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="component">
        {activeMenu?.component}
      </main>
    </div>
  )
}

export default ComponentPage