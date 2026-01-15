import { useEffect, useState } from 'react'
import { Button } from 'antd'

function MainPage() {
  const [count, setCount] = useState<number>(0)

  useEffect(() => {
    console.log('useEffect页面更新')
  }, [])

  return (
    <div>
      <div>
        <Button type="primary" onClick={() => setCount(count + 1)}>
          Increment
        </Button>
        <p>Count: {count}</p>
      </div>
    </div>
  )
}

export default function Main() {
  return <MainPage />
}
