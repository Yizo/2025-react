import { useCallback, useEffect, useMemo, useState } from 'react';
import { TreeSelect } from 'antd';
import { getDepartments, type Department, type Status } from '../api';

interface DepartmentTreeNode {
  title: string;
  value: number;
  key: number;
  isLeaf?: boolean;
  children?: DepartmentTreeNode[];
}

interface LazyDepartmentTreeSelectProps {
  value?: number | number[] | null;
  onChange?: (_value: number | number[] | undefined) => void;
  multiple?: boolean;
  placeholder?: string;
  disabled?: boolean;
  initialItems?: Department[];
  status?: Status;
  excludeIds?: Set<number>;
}

/** 部门选择器只在展开节点时请求该节点的直接子部门。 */
export default function LazyDepartmentTreeSelect({
  value,
  onChange,
  multiple = false,
  placeholder = '请选择部门',
  disabled = false,
  initialItems,
  status,
  excludeIds = new Set<number>(),
}: LazyDepartmentTreeSelectProps) {
  const [items, setItems] = useState<Department[]>(initialItems ?? []);
  const [childrenByParent, setChildrenByParent] = useState<Map<number, Department[]>>(new Map());
  const [loadedParentIds, setLoadedParentIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  const loadInitialItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getDepartments({
        page: 1,
        pageSize: 100,
        ...(status !== undefined ? { status } : {}),
      });
      setItems(response.data.items);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    if (initialItems) {
      setItems(initialItems);
      setChildrenByParent(new Map());
      setLoadedParentIds(new Set());
      return;
    }
    void loadInitialItems();
  }, [initialItems, loadInitialItems]);

  const itemMap = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);

  const hasAvailableChildren = useCallback(
    (parentId: number) =>
      items.some((item) => item.parentId === parentId && !excludeIds.has(item.id)),
    [excludeIds, items]
  );

  const treeData = useMemo(() => {
    function createNodes(nodes: Department[]): DepartmentTreeNode[] {
      return nodes
        .filter((item) => !excludeIds.has(item.id))
        .map((item) => {
          const children = childrenByParent.get(item.id);
          const hasChildren = hasAvailableChildren(item.id);
          return {
            title: item.deptName,
            value: item.id,
            key: item.id,
            isLeaf: !hasChildren,
            ...(children ? { children: createNodes(children) } : {}),
          };
        });
    }

    return createNodes(items.filter((item) => item.parentId === null));
  }, [childrenByParent, excludeIds, hasAvailableChildren, items]);

  const selectedIds = multiple
    ? Array.isArray(value)
      ? value
      : []
    : typeof value === 'number'
      ? [value]
      : [];
  const selectedValues = selectedIds.map((id) => ({
    value: id,
    label: itemMap.get(id)?.deptName ?? `部门 #${id}`,
  }));

  async function loadData(parentId: number) {
    if (loadedParentIds.has(parentId) || !hasAvailableChildren(parentId)) return;
    setLoading(true);
    try {
      const response = await getDepartments({
        page: 1,
        pageSize: 100,
        parentId,
        ...(status !== undefined ? { status } : {}),
      });
      setChildrenByParent((current) => {
        const next = new Map(current);
        next.set(parentId, response.data.items);
        return next;
      });
      setLoadedParentIds((current) => new Set(current).add(parentId));
    } finally {
      setLoading(false);
    }
  }

  function handleChange(nextValue: unknown) {
    if (multiple) {
      const nextIds = Array.isArray(nextValue)
        ? nextValue.map((item) =>
            Number(typeof item === 'object' ? (item as { value: unknown }).value : item)
          )
        : [];
      onChange?.(nextIds);
      return;
    }

    if (nextValue == null || nextValue === '') {
      onChange?.(undefined);
      return;
    }
    const nextId =
      typeof nextValue === 'object'
        ? Number((nextValue as { value: unknown }).value)
        : Number(nextValue);
    onChange?.(Number.isFinite(nextId) ? nextId : undefined);
  }

  return (
    <TreeSelect
      showSearch
      allowClear
      treeData={treeData}
      treeNodeFilterProp="title"
      loadData={(node) => loadData(Number(node.value))}
      loading={loading}
      disabled={disabled}
      multiple={multiple}
      labelInValue
      value={multiple ? selectedValues : selectedValues[0]}
      placeholder={placeholder}
      onChange={handleChange}
      className="w-full"
    />
  );
}
