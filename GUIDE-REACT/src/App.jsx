import GuideHeader from "./components/guide/GuideHeader.jsx";
import Button from "./components/ui/Button/Button.jsx";


function App() {
    function handleButtonClick() {
        alert('Button 컴포넌트를 클릭했습니다.');
    };

    return (
        <main className="guide-wrap">
            <GuideHeader
                title="React UI Guide"
                description="퍼블리싱하던 UI를 React 컴포넌트 방식으로 하나씩 바꿔보는 학습 프로젝트입니다."
            />
            <section className="guide-section">
                <h2 className="guide-section-tit">4단계: Button 컴포넌트</h2>
                <p className="guide-section-txt">props를 사용해서 버튼의 모양, 크기, 클릭 동작을 다르게 전달합니다.</p>

                <div className="btn-group">
                    <Button onClick={handleButtonClick}>확인</Button>
                    <Button variant='secondary'>취소</Button>
                    <Button variant='line' size="sm">작은 버튼</Button>
                    <Button variant='primary' size="lg" disabled>비활성 버튼</Button>
                </div>
            </section>
        </main>
    );
}

export default App;
