export interface ChildRef {
  onAdd: () => void;
}

export interface ChildProps {
  ref: React.Ref<ChildRef>;
  toggle: (typeId?: string) => void;
}
