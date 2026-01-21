import { Typography } from 'antd';
import ListCard from './components/ListCard';
import { produce } from 'immer';
import type { ListCardItem } from './components/ListCard';

const { Title, Paragraph } = Typography;

const _list = [
  {
    id: 1,
    title: '问卷1',
    isPublished: true,
    isStar: false,
    createdAt: '2021-01-01',
    updatedAt: '2021-01-01',
    stat: 100,
  },
  {
    id: 2,
    title: '问卷2',
    isPublished: false,
    isStar: true,
    createdAt: '2022-01-01',
    updatedAt: '2022-01-01',
    stat: 200,
  },
  {
    id: 3,
    title: '问卷3',
    isPublished: true,
    isStar: false,
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
    stat: 300,
  },
];

export default function List() {
  const [list, setList] = useState(_list);
  async function handleAction(action: 'star' | 'copy' | 'delete', item: ListCardItem) {
    console.log(action, item);
    if (action === 'star') {
      const index = list.findIndex((i) => i.id === item.id);
      setList(
        produce((draft) => {
          draft[index].isStar = !draft[index].isStar;
        })
      );
    }
    if (action === 'delete') {
      const index = list.findIndex((i) => i.id === item.id);
      setList(
        produce((draft) => {
          draft.splice(index, 1);
        })
      );
    }
    return true;
  }
  return (
    <div>
      <Typography>
        <Title level={1}>我的问卷</Title>
        <Paragraph>
          <ListCard list={list} onAction={handleAction} />
        </Paragraph>
      </Typography>
    </div>
  );
}
