import './Checkbox.scss'

function Checkbox({
  id,
  label,
  checked = false, // 체크 여부 (외부 state와 연결)
  onChange, // 변경 핸들러
  disabled = false,
  className = '',
  ...rest
}) {
  const wrapCls = [
    'checkbox-group',
    disabled ? 'is-disabled' : '',
    checked ? 'is-checked' : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <div className={wrapCls}>
      {/* ─────────────────────────────────────
        input은 시각적으로 숨기고
        label을 커스텀 스타일로 만들어요.
        퍼블리싱에서도 쓰던 방식이에요.
        input:checked + label 로 스타일 잡던 것을
        React에서는 is-checked 클래스로 처리해요.

        커스텀 체크박스 박스: checkbox-box
        - 체크 표시: checkbox-box::after (CSS로 구현)
        - 체크된 상태: is-checked 클래스 추가
        라벨 텍스트: checkbox-txt

      ───────────────────────────────────── */}
      <input className="checkbox-input" type="checkbox" id={id} checked={checked} disabled={disabled} onChange={onChange} {...rest} />
      <label className="checkbox-label" htmlFor={id}>
        <span className="checkbox-box" aria-hidden="true" />
        {label && <span className="checkbox-txt">{label}</span>}
      </label>
    </div>
  )
}

export default Checkbox