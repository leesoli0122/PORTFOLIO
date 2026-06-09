import './Radio.scss'

function Radio({
  id,
  label,
  value, // 이 라디오 버튼의 고유 값
  selectedValue, // 현재 선택된 값 (부모 state)
  onChange,
  disabled = false,
  className = '',
  ...rest
}) {
  // selectedValue랑 내 value가 같으면 선택된 상태
  const isChecked = selectedValue === value

  // 조건에 따라 calss를 동적으로 추가하기
  const wrapCls = [
    'radio-group',
    isChecked ? 'is-checked' : '',
    disabled ? 'is-disabled' : '',
    className,
  ].filter(Boolean).join(' ')
  return (
    <div className={wrapCls}>
      <input className='radio-input' type="radio" id={id} value={value} checked={isChecked} onChange={onChange} disabled={disabled} {...rest} />
      <label className='radio-label' htmlFor={id}>
        <span className="radio-box" aria-hidden="true" />
        {label && <span className="radio-txt">{label}</span>}
      </label>
    </div>
  )
}

export default Radio