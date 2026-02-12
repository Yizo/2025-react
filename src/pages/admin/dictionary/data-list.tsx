export default function DataList({ ref }: { ref: React.Ref<{ onAdd: () => void }> }) {
  function onAdd() {
    console.log('新增字典数据');
  }

  useImperativeHandle(ref, () => ({
    onAdd,
  }));

  return <div>DataList</div>;
}
