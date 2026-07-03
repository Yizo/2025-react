import type { ThreeNavigationGroup } from './types';
import ParallelLightAndEnvironmentLight from '../three-visualization-learning/平行光与环境光';
import BasicScene from '../three-visualization-learning/基本场景';

export const threeVisualizationLearningGroup: ThreeNavigationGroup = {
  key: 'three-visualization-learning',
  title: 'Three3D可视化学习',
  items: [
    {
      key: 'basic-scene',
      title: '基本场景',
      element: <BasicScene />,
    },
    {
      key: 'parallel-light-and-environment-light',
      title: '平行光与环境光',
      element: <ParallelLightAndEnvironmentLight />,
    },
  ],
};
