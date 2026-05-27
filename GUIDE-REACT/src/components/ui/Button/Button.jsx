function Button({
    type = 'button',
    variant = 'primary',
    size = 'md',
    disabled = false,
    children,
    onClick
}) {
    const buttonClassName = `btn btn-${variant} btn-${size}`;
    return (
        <button type={type} className={buttonClassName} disabled={disabled} onClick={onClick}>
            <span className="btn-txt">{children}</span>
        </button>
    )
}

export default Button;