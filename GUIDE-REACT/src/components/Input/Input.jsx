import './Input.scss'
// 퍼블리싱에서 이랬던 것
// <div class="input-wrap">
//   <label class="input-label" for="userId">아이디</label>
//   <input class="input" type="text" id="userId" />
// </div>
function Input({
  label, // 라벨 텍스트
  id, // input id (label htmlFor와 연결)
  type = 'text', // text, password, email 등 input 타입
  value, // controlled input 값
  onChange,  // input 값 변경 시 호출되는 함수 (부모 컴포넌트에서 상태 관리)
  placeholder = '',
  disabled = false,
  readOnly = false,
  status = 'default', // default, error, success
  message = '', // 에러/성공 메시지
  required = false,
  className = '',
  ...rest
}) {
  // label: 입력 필드의 레이블 텍스트
  // id: 입력 필드의 고유 식별자 (label과 연결)
  // value: 입력 필드의 현재 값 (외부 state와 연결)
  // onChange: 입력 필드의 값이 변경될 때 호출되는 함수 (부모에게 알림)
  // for → htmlFor — for가 JS 예약어라 JSX에서는 htmlFor로 사용. class → className이랑 같은 이유
  const wrapCls = [
    'input-wrap',
    'is-${status}', // status에 따라 클래스 추가 (예: is-error, is-success)
    disabled ? 'is-disabled' : '',
    readOnly ? 'is-readonly' : '',
    className, // 추가 클래스 (사용자가 전달한)
  ].filter(Boolean).join(' ')

  return (
    <div className={wrapCls}>
      {/* 라벨 - label prop 있을 때만 렌더링 */}
      {label && (
        <label className="input-label" htmlFor={id}>
          {label}
          {required && (
            <span className="input-required" aria-label="필수 입력">*</span>
          )}
        </label>
      )}

      {/* input 영역 */}
      <div className="input-box">
        <input type={type} id={id} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} readOnly={readOnly} aria-invalid={status === 'error'} aria-describedby={message ? `${id}-message` : undefined} />
      </div>

      {/* 안내 메시지 - message prop 있을 때만 렌더링 */}
      {message && (
        <p className='input-message' id={`${id}-message`} role={status === 'error' ? 'alert' : undefined}>
          {message}
        </p>
      )}
    </div>
  )
}

export default Input