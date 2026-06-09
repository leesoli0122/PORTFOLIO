import { useState } from 'react'
import Radio from '@/components/Radio'

// 0. 고정데이터
const FRUIT_LIST = [
  { value: 'apple', label: '사과'},
  { value: 'banana', label: '바나나'},
  { value: 'grape', label: '포도'},
]

const GENDER_LIST = [
  { value: 'male', label: '남성'},
  { value: 'female', label: '여성'},
]
function RadioShowcase() {
  // 1. state
  const [fruit, setFruit] = useState('')
  const [gender, setGender] = useState('male')  // 초기값 있는 경우

  // 2. 파생 값
  const selectedFruitLabel = FRUIT_LIST.find((f) => f.value === fruit)?.label

  // 3. 함수
  const handleFruit = (e) => setFruit(e.target.value)
  const handleGender = (e) => setGender(e.target.value)

  return (
    <div className="showcase-content">
      <h2 className="showcase-tit">Radio</h2>
      <p className="showcase-desc">selectedValue props로 그룹 전체를 하나의 state로 관리해요.</p>

      {/* 기본 */}
      <div className="showcase-section">
        <h3 className="showcase-section-tit">기본</h3>
        <div className="radio-wrap">
          {FRUIT_LIST.map((f) => (
            <Radio key={f.value} id={f.value} label={f.label} value={f.value} selectedValue={fruit} onChange={handleFruit} />
          ))}
        </div>
      </div>

      {/* 초기값 있는 경우 */}
      <div className="showcase-section">
        <h3 className="showcase-section-tit">초기값 있는 경우</h3>
        <div className="radio-wrap">
          {GENDER_LIST.map((g) => (
            <Radio key={g.value} id={`gender-${g.value}`} label={g.label} value={g.value} selectedValue={gender} onChange={handleGender} />
          ))}
        </div>
      </div>


      {/* disabled */}
      <div className="showcase-section">
        <h3 className="showcase-section-tit">Disabled</h3>
        <div className="radio-wrap">
            <Radio id="dis1" label="비활성화 (미선택)" value="dis1" selectedValue="" onChange={() => {}} disabled />
            <Radio id="dis2" label="비활성화 (선택)" value="dis2" selectedValue="dis2" onChange={() => {}} disabled />
        </div>
      </div>

      {/* state 확인 */}
      <div className="showcase-section">
        <h3 className="showcase-section-tit">현재 state 값</h3>
        <div className="showcase-state-box">
          <div>fruit: <strong>{fruit || '(미선택)'}</strong></div>
          <div>선택된 과일: <strong>{selectedFruitLabel || '(미선택)'}</strong></div>
          <div>gender: <strong>{gender}</strong></div>
        </div>
      </div>
    </div>
  )
}

export default RadioShowcase