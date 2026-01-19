import { Card, Empty } from 'antd';
import { useNavigate } from 'react-router';
import {
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  StarOutlined,
  CopyOutlined,
  StarFilled,
} from '@ant-design/icons';

export interface ListCardItem {
  id: number;
  title: string;
  isPublished: boolean;
  isStar: boolean;
  createdAt: string;
  updatedAt: string;
  stat: number;
}

export interface ListCardProps {
  list: ListCardItem[];
  onAction: (_action: 'star' | 'copy' | 'delete', _item: ListCardItem) => Promise<boolean>;
}

export default function ListCard({ list, onAction }: ListCardProps) {
  const navigate = useNavigate();
  function ExtraView(item: ListCardItem): React.ReactNode {
    return (
      <div>
        <span>答卷: {item.stat}</span>
        <Divider vertical />
        <span>更新时间: {item.updatedAt}</span>
        <Divider vertical />
        <Tag color={item.isPublished ? 'green' : ''}>{item.isPublished ? '已发布' : '未发布'}</Tag>
      </div>
    );
  }

  function handleEdit(item: ListCardItem) {
    navigate(`/question/edit/${item.id}`);
  }
  function handleStat(item: ListCardItem) {
    navigate(`/question/stat/${item.id}`);
  }

  async function handleAction(action: 'star' | 'copy' | 'delete', item: ListCardItem) {
    const result = await onAction(action, item);
    if (result) {
      message.success('操作成功');
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {list.map((item) => (
        <Card key={item.id} title={item.title} extra={<ExtraView {...item} />}>
          <div className="flex items-center justify-between gap-2">
            <div className="">
              <Button
                disabled={item.isPublished}
                type="link"
                icon={<EditOutlined />}
                onClick={() => handleEdit(item)}
              >
                编辑问卷
              </Button>
              <Button
                disabled={item.isPublished}
                type="link"
                icon={<EyeOutlined />}
                onClick={() => handleStat(item)}
              >
                统计问卷
              </Button>
            </div>
            <div className="">
              <Button
                type="link"
                icon={item.isStar ? <StarFilled /> : <StarOutlined />}
                onClick={() => handleAction('star', item)}
              >
                标星
              </Button>
              <Button
                disabled={item.isPublished}
                type="link"
                icon={<CopyOutlined />}
                onClick={() => handleAction('copy', item)}
              >
                复制
              </Button>
              <Button
                disabled={item.isPublished}
                type="link"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleAction('delete', item)}
              >
                删除
              </Button>
            </div>
          </div>
        </Card>
      ))}
      {list.length === 0 && <Empty description="暂无问卷" />}
    </div>
  );
}
