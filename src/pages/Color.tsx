import { useAppSelector, useAppDispatch } from '@/store';
import { toggleTheme } from '@/store/system';

export default function Color() {
  const dispatch = useAppDispatch();
  const systemTheme = useAppSelector((state) => state.system.theme);

  function handleToggleTheme() {
    dispatch(toggleTheme());
  }

  return (
    <div className="p-4 bg-base-100 ui-bg-200 ui-text-base" style={{ minHeight: '100vh' }}>
      <div className="sticky top-0 z-10">
        <Button type="primary" onClick={handleToggleTheme}>
          {systemTheme === 'light' ? '暗色模式' : '浅色色模式'}
        </Button>
      </div>
      <div className="m-4 p-4">
        <h2 className="text-2xl font-bold">背景色</h2>
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="w-50 h-50   rounded-md ui-bg-100">一级(最浅)</div>
          <div className="w-50 h-50   rounded-md ui-bg-200">
            二级(次浅), 次背景色: 如卡片容器背景
          </div>
          <div className="w-50 h-50   rounded-md ui-bg-300">
            三级(最深), 分割线、禁用状态背景, 创建层次感
          </div>
        </div>
      </div>
      <div className="m-4 p-4">
        <h2 className="text-2xl ui-text-base">文字颜色</h2>
      </div>
      <div className="p-4 m-4">
        <h3 className="text-2xl">主色</h3>
        <div>
          <button className="px-4 py-2 my-4 rounded-md ui-text-primary ui-bg-primary">
            主色元素
          </button>
          <div className="w-50 h-50 border ui-border-primary">主色边框</div>
        </div>
      </div>
      <div className="p-4 m-4">
        <h3 className="text-2xl">边框颜色</h3>
        <div className="flex flex-wrap gap-4">
          <div className="w-50 h-50 border ui-border">ui-border</div>
          <div>
            <Button>对比</Button>
            <button className="px-4 py-1 ml-4  rounded-md border ui-border">默认</button>
          </div>
        </div>
      </div>
    </div>
  );
}
