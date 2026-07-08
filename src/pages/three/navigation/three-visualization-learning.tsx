import type { ThreeNavigationGroup } from './types';
import BasicScene from '../three-visualization-learning/基本场景';
import BasicScene2 from '../three-visualization-learning/基本场景2';
import PointLight from '../three-visualization-learning/点光源';
import DirectionalLight from '../three-visualization-learning/平行光';

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
      key: 'basic-scene2',
      title: '基本场景2',
      element: <BasicScene2 />,
    },
    {
      key: 'point-light',
      title: '点光源',
      element: <PointLight />,
    },
    {
      key: 'directional-light',
      title: '平行光',
      element: <DirectionalLight />,
    },
  ],
};
