import { useRequest } from 'ahooks';
import { getList } from './api';

export default function useList() {
  const { promise, cancel } = getList();
  const hasRequested = useRef(false);
  const { run, ...rect } = useRequest(promise, { manual: true });

  useEffect(() => {
    if (!hasRequested.current) {
      hasRequested.current = true;
      run();
    }
  }, [run]);

  return { ...rect, cancel, run };
}
