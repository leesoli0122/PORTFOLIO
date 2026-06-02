import { useState } from "react";
import Button from '@/components/Button'

function ComponentPage() {
  const [status, setStatus] = useState('idle');

  const handleSave = () => {
    setStatus('loading');
    setTimeout(() => setStatus('idle'), 2000);
  }


  return (
    <div className="showcase-content">
      <h2 className="showcase-tit">Button</h2>
      <p className="showcase-desc">variant, size, status props로 다양한 버튼을 만들 수 있어요.</p>

      {/* variant */}
      <div className="showcase-section">
        <h3 className="showcase-section-tit">Variant</h3>
        <div className="showcase-row">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="outline">Outline</Button>
        </div>
      </div>

      {/* size */}
      <div className="showcase-section">
        <h3 className="showcase-section-tit">Size</h3>
        <div className="showcase-row" style={{ alignItems: 'center' }}>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </div>

      {/* disabled */}
      <div className="showcase-section">
        <h3 className="showcase-section-tit">Disabled</h3>
        <div className="showcase-row">
          <Button variant="primary" disabled>Primary</Button>
          <Button variant="secondary" disabled>Secondary</Button>
          <Button variant="danger" disabled>Danger</Button>
        </div>
      </div>

      {/* loading */}
      <div className="showcase-section">
        <h3 className="showcase-section-tit">Loading</h3>
        <div className="showcase-row">
          <Button status={status} onClick={handleSave}>
            저장하기 (클릭해보세요)
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ButtonShowcase