import { useState } from 'react'
import Checkbox from '../../components/Checkbox/Checkbox'

// 0. 고정 데이터
const TERMS_LIST = [
  { id: 'terms1', label: '(필수) 이용약관에 동의합니다.' },
  { id: 'terms2', label: '(필수) 개인정보 수집 및 이용에 동의합니다.' },
  { id: 'terms3', label: '(필수) 마케팅 정보 수신에 동의합니다.' },
]

function CheckboxShowcase() {
  // 1. state → 변하는 값
  const [checked, setChecked] = useState(false) // 단일 체크박스 예시
  const [checked1, setChecked1] = useState(false) // 단일 체크박스 예시
  const [checked2, setChecked2] = useState(false) // 단일 체크박스 예시
  const [checked3, setChecked3] = useState(false) // 단일 체크박스 예시
  const [checkedList, setCheckedList] = useState([]) // 여러 체크박스 예시

  // 2. 파생 값 → state로부터 계산 (직접 변경 안 함)
  // 전체 동의 체크 여부
  const isAllChecked = checkedList.length === TERMS_LIST.length

  // state 하나로 여러 체크박스 제어 (비추)
  const handleSingle = (e) => {
    setChecked(e.target.checked)
  }

  // 방법B setter를 인자로 받아서 공통으로 사용
  const handleCheck = (setter) => (e) => {
    setter(e.target.checked)
  }

  // 방법C 체크박스 여러 개를 독립적으로 관리할 때
  const [checks, setChecks] = useState({
    basic4: false,
    basic5: false,
  })

  const handleCheck2 = (key) => (e) => {
    setChecks((prev) => ({ ...prev, [key]: e.target.checked }))
  }

  // 3. 함수 → state 바꾸는 로직
  // 개별 체크 토글
  const handleTerms = (id) => {
    setCheckedList((prev) =>
      prev.includes(id)
        ? prev.filter((v) => v !== id) // id가 이미 있으면 제거
        : [...prev, id]) // id가 없으면 추가
  }

  // 전체 동의 토글
  const handleAllCheck = (e) => {
    if (e.target.checked) {
      setCheckedList(TERMS_LIST.map((t) => t.id)) // 전체 id 추가
    } else {
      setCheckedList([]) // 전체 제거
    }
  }
  return (
    <div className="showcase-content">
      <h2 className="showcase-tit">Checkbox</h2>
      <p className="showcase-desc">checked + onChange props로 체크 상태를 제어해요.</p>

      {/* 기본 */}
      <div className="showcase-section">
        <h3 className="showcase-section-tit">기본(비추)</h3>
        <div className="showcase-col">
          <div className="checkbox-wrap">
            <Checkbox id="basic" label="기본 체크박스" checked={checked} onChange={handleSingle} />
          </div>
        </div>
      </div>

      {/* 방법A setter를 직접 넘기기 */}
      <div className="showcase-section">
        <h3 className="showcase-section-tit">기본(방법A setter를 직접 넘기기)</h3>
        <div className="showcase-col">
          <div className="checkbox-wrap">
          <Checkbox id="basic1" label="기본 체크박스1" checked={checked1} onChange={(e) => setChecked1(e.target.checked)} />
          </div>
        </div>
      </div>

      {/* 방법B setter를 인자로 받아서 공통으로 사용 */}
      <div className="showcase-section">
        <h3 className="showcase-section-tit">기본(방법B setter를 인자로 받아서 공통으로 사용)</h3>
        <div className="checkbox-wrap">
          <Checkbox id="basic2" label="기본 체크박스2" checked={checked2} onChange={handleCheck(setChecked2)} />
          <Checkbox id="basic3" label="기본 체크박스3" checked={checked3} onChange={handleCheck(setChecked3)} />
        </div>
      </div>

      {/* 방법C 체크박스 여러 개를 독립적으로 관리 */}
      <div className="showcase-section">
        <h3 className="showcase-section-tit">기본(방법C key만 다르게 넘기기)</h3>
        <div className="checkbox-wrap">
          <Checkbox id="basic4" label="기본 체크박스4" checked={checks.basic4} onChange={handleCheck2('basic4')} />
          <Checkbox id="basic5" label="기본 체크박스5" checked={checks.basic5} onChange={handleCheck2('basic5')} />
        </div>
      </div>

      {/* disabled */}
      <div className="showcase-section">
        <h3 className="showcase-section-tit">Disabled</h3>
        <div className="checkbox-wrap">
          <Checkbox id="dis1" label="비활성화 (미체크)" checked={false} onChange={() => {}} disabled />
          <Checkbox id="dis2" label="비활성화 (체크)" checked={true} onChange={() => {}} disabled />
        </div>
      </div>

      {/* 실무 패턴 - 약관 동의 */}
      <div className="showcase-section">
        <h3 className="showcase-section-tit">실무 패턴 - 약관 동의</h3>
        <div className="term-wrap">
          {/* 전체 동의 */}
          <Checkbox id="allCheck" label="전체 동의" checked={isAllChecked} onChange={handleAllCheck} />
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {TERMS_LIST.map((term) => (
              <Checkbox key={term.id} id={term.id} label={term.label} checked={checkedList.includes(term.id)} onChange={() => handleTerms(term.id)} />
            ))}
          </div>
        </div>
      </div>

      {/* state 확인 */}
      <div className="showcase-section">
        <h3 className="showcase-section-tit">현재 state 값</h3>
        <div className="showcase-state-box">
          <div>checked: <strong>{checked.toString()}</strong></div>
          <div>checkedList: <strong>[{checkedList.join(', ')}]</strong></div>
          <div>전체동의: <strong>{isAllChecked.toString()}</strong></div>
        </div>
      </div>
    </div>
  )
}

export default CheckboxShowcase