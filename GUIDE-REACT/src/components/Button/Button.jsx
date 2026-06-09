import './Button.scss';
// children: 버튼 안에 들어가는 내용 (텍스트, 아이콘 등)
// variant: 버튼의 스타일 종류 (primary, secondary, danger 등)
// size: 버튼의 크기 (sm, md, lg 등)
// status: 버튼의 상태 (idle, loading, disabled 등)
// disabled: 버튼이 비활성화 상태인지 여부
// onClick: 버튼이 클릭되었을 때 실행되는 함수
function Button({ children, variant = 'primary', size = 'md', status = 'idle', fullWidth = false, disabled = false, type = 'button', onClick, className = '', ...rest }) {
  const cls = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    status === 'loading' ? 'is-loading' : "",
    fullWidth ? 'btn-full' : "",
    className
  ].filter(Boolean).join(' ');

  const renderContent = () => {
    if (status === 'loading') {
      return (
        <>
          <span className="btn-spinner" aria-hidden="true" />
          <span>처리 중...</span>
        </>
      )
    }
    return children;
  }
  return (
    <button
      type={type}
      className={cls}
      disabled={disabled || status === "loading"}
      onClick={onClick}
      aria-busy={status === "loading"}
      {...rest}
    >
      {renderContent()}
    </button>
  )
}

export default Button