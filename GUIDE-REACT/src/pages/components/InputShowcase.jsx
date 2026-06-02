import { useState } from 'react'
import Input from '@/components/Input'

function InputShowcase() {
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  return (
    <div className='showcase-content'>
      <h2 className='showcase-tit'>Input</h2>
      <p className="showcase-desc">label, status, message props로 다양한 입력 필드를 만들 수 있어요.</p>

      <div className="showcase-section">
        <h3 className="showcase-section-tit">기본</h3>
        <div className="showcase-col">
          <input id='userId' label='아이디' placeholder='아이디를 입력하세요' value={userId} onChange={(e) => setUserId(e.target.value)} />
        </div>
      </div>

      <div className="showcase-section">
        <h3 className="showcase-section-tit">필수 입력</h3>
        <div className="showcase-col">
          <input id='password' label='비밀번호' type='password' placeholder='비밀번호를 입력하세요' value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
      </div>
    </div>
  )
}

export default InputShowcase