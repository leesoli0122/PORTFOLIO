function GuideHeader({title, description}) {
    return (
        <section className="guide-head">
            <h1 className="guide-tit">{title}</h1>
            <p className="guide-txt">{description}</p>
        </section>
    )
}

export default GuideHeader;