import { useState } from 'react'
import Input from '@/components/Input'

// ─────────────────────────────────────────────
// react 컴포넌트 작성 순서
// 1. 이 컴포넌트가 뭘 보여줄지 결정
// 2. 어떤 값이 변하는지 → state 선언
// 3. 값이 변할 때 어떻게 처리할지 → 함수 작성
// 4. 화면에 뭘 그릴지 → return JSX 작성
// ─────────────────────────────────────────────

function InputShowcase() {
  // ─────────────────────────────────────────────
  // 2. 어떤 값이 변하는지 → state 선언
  // → 아이디 입력값 ← useState 필요
  // → 비밀번호 입력값 ← useState 필요
  // → 이메일 입력값 ← useState 필요
  // → 이메일 상태(error/success) ← useState 필요
  // → 이메일 메시지 ← useState 필요
  // ─────────────────────────────────────────────

  // 변하지 않는 값은?
  // → disabled Input은 값이 고정 → state 불필요
  const [entry1, setEntry1] = useState('')
  const [entry2, setEntry2] = useState('')
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [emailStatus, setEmailStatus] = useState('default')
  const [emailMessage, setEmailMessage] = useState('')
  const [emailTouched, setEmailTouched] = useState(false) //한 번이라도 벗어났는지

  // ─────────────────────────────────────────────
  // 3. 값이 변할 때 어떻게 처리할지 → 함수 작성
  // 단순히 값만 저장하면 되는 건?
  // → userId, password
  // → onChange={(e) => setUserId(e.target.value)} 한 줄로 끝

  // 추가 로직이 필요한 건?
  // → email은 입력할 때마다 유효성 검사도 해야 함
  // → 함수로 분리해서 작성
  // ─────────────────────────────────────────────
  const handleEmailChange = (e) => {
    // 1. 값 저장
    const val = e.target.value
    setEmail(val)

    // touched 됐을 때만 실시간 검사 (한 번 벗어난 후엔 실시간으로)
    if (emailTouched){
      validateEmail(val)
    }
  }

  // 유효성 검사 로직 분리
  const validateEmail = (val) => {
    if (!val) {
      setEmailStatus('default')
      setEmailMessage('')
    } else if (val.includes('@')) {
      setEmailStatus('success')
      setEmailMessage('올바른 이메일 형식이에요.')
    } else {
      setEmailStatus('error')
      setEmailMessage('올바른 이메일 형식이 아니에요.')
    }
  } 

  // 포커스 벗어날 때 검사
  const handleEmailBlur = () => {
    setEmailTouched(true)
    validateEmail(email)
  }
  return (

    // 1. 이 컴포넌트가 뭘 보여줄지 결정
    <div className="showcase-content">
      <h2 className="showcase-tit">Input</h2>
      <p className="showcase-desc">label, status, message props로 다양한 입력 필드를 만들 수 있어요.</p>

      <div className="showcase-section">
        <h3 className="showcase-section-tit">input 2개</h3>
        <div className="input-wrap">
          <Input id="entry1" label="기본입력1" placeholder="입력해주세요" value={entry1} onChange={(e) => setUserId(e.target.value)} /> {/*3. 값이 변할 때 어떻게 처리할지 → onChange 4. 화면에 배치*/}
          <Input id="entry2" label="기본입력2" placeholder="입력하세요" value={entry2} onChange={(e) => setUserId(e.target.value)} /> {/*3. 값이 변할 때 어떻게 처리할지 → onChange 4. 화면에 배치*/}
        </div>
      </div>
      <div className="showcase-section">
        <h3 className="showcase-section-tit">기본(ex.아이디)</h3>
        <div className="input-wrap">
          <Input id="userId" label="아이디" placeholder="아이디를 입력하세요" value={userId} onChange={(e) => setUserId(e.target.value)} /> {/*3. 값이 변할 때 어떻게 처리할지 → onChange 4. 화면에 배치*/}
        </div>
      </div>

      <div className="showcase-section">
        <h3 className="showcase-section-tit">필수 입력(ex.비밀번호)</h3>
        <div className="input-wrap">
          <Input id="password" label="비밀번호" type="password" placeholder="비밀번호를 입력하세요" value={password} onChange={(e) => setPassword(e.target.value)} /> {/*3. 값이 변할 때 어떻게 처리할지 → onChange 4. 화면에 배치*/}
        </div>
      </div>

      <div className="showcase-section">
        <h3 className="showcase-section-tit">유효성 검사(ex.이메일)</h3>
        <div className="input-wrap">
          <Input id="email" label="이메일" type="email" placeholder="이메일을 입력하세요" value={email} onChange={handleEmailChange} onBlur={handleEmailBlur} status={emailStatus} message={emailMessage} />
        </div>
      </div>

      <div className="showcase-section">
        <h3 className="showcase-section-tit">Disabled</h3>
        <div className="input-wrap">
          <Input id="disabledInput" label="비활성화" value="수정할 수 없어요" onChange={() => {}} disabled /> {/*3. 값이 변할 때 어떻게 처리할지 → onChange 4. 화면에 배치*/}
        </div>
      </div>

      {/* state 확인 박스 */}
      <div className="showcase-section">
        <h3 className="showcase-section-tit">현재 state 값</h3>
        <div className="showcase-state-box">
          <div>userId: <strong>{userId || '(비어있음)'}</strong></div>
          <div>password: <strong>{password ? '●'.repeat(password.length) : '(비어있음)'}</strong></div>
          <div>email: <strong>{email || '(비어있음)'}</strong></div>
        </div>
      </div>
    </div>
  )
}

export default InputShowcase