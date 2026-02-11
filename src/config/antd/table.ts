export const tableConfig = {
  pagination: {
    showLessItems: true,
    showQuickJumper: true,
    showSizeChanger: true,
    showTotal: (total: number, range: [number, number]) =>
      `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
  },
};
