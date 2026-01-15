import { produce } from 'immer'

function MainPage() {
  /**
   * 如果一个变量的值和页面更新无关, 就不要用useState. 就用useRef.
   */
  const [arr, setArr] = useState<number[]>(() => {
    return Array.from({ length: 10 }, (_, index) => index + 1)
  })
  const [count, setCount] = useState<number>(0)
  const handleAdd = () => {
    setArr(
      produce((draft) => {
        const max = Math.max(...draft, 0)
        draft.push(max + 1)
      })
    )
  }
  const handleDelete = (index: number) => {
    setArr(
      produce((draft) => {
        draft.splice(index, 1)
      })
    )
  }
  const handleEdit = (index: number) => {
    setArr(
      produce((draft) => {
        const max = Math.max(...draft, 0)
        draft.splice(index + 1, 0, max + 1)
      })
    )
  }

  const memoizedArrayList = useMemo(() => {
    // extra组件
    function Extra(): ReactNode {
      return (
        <>
          <Button type="link" size="small" onClick={handleAdd}>
            新增
          </Button>
        </>
      )
    }
    return (
      <Card className="shadow-md rounded-lg" style={{ width: 300 }} title="ArrayList" extra={<Extra />}>
        <ul>
          {arr.map((item, index) => (
            <li key={item} className="flex justify-between mb-2">
              <Tag
                color={`rgba(${Math.floor(Math.random() * 256)},
				${Math.floor(Math.random() * 256)},
				${Math.floor(Math.random() * 256)},
				0.75)`} // 透明度 0~1 可调
              >
                {item}
              </Tag>
              <div>
                <Button type="link" size="small" onClick={() => handleDelete(index)}>
                  删除
                </Button>
                <Divider vertical />
                <Button type="link" size="small" onClick={() => handleEdit(index)}>
                  插入
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    )
  }, [arr])

  return (
    <div className="flex gap-4">
      {memoizedArrayList}
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
  return (
    <div>
      <Space size="middle">
        <MainPage />
      </Space>
    </div>
  )
}
