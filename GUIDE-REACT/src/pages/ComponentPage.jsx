import { useState } from "react";
import Button from '@/components/Button'

function ComponentPage() {
  const [status, setStatus] = useState('idle');

  const handleSave = () => {
    setStatus('loading');
    setTimeout(() => setStatus('idle'), 2000);
  }


  return (
    <div style={{ padding: '40px 24px' }}>
      <h2>Button</h2>

      {/* variant */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="danger">Danger</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="outline">Outline</Button>
      </div>

      {/* size */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>

      {/* disabled */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <Button disabled>Disabled</Button>
      </div>

      {/* loading */}
      <Button status={status} onClick={handleSave}>저장하기</Button>
    </div>
  )
}

export default ComponentPage