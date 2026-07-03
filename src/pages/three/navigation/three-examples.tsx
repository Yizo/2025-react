import BasicScene from '../three-examples/BasicScene';
import CircleGeometry from '../three-examples/CircleGeometry';
import Css3DScene from '../three-examples/Css3DScene';
import LineGeometry from '../three-examples/LineGeometry';
import Panorama from '../three-examples/Panorama';
import PointGeometry from '../three-examples/PointGeometry';
import type { ThreeNavigationGroup } from './types';

export const threeExamplesGroup: ThreeNavigationGroup = {
  key: 'three-examples',
  title: 'Three 示例',
  items: [
    {
      key: 'basic',
      title: '基本立方体',
      element: <BasicScene />,
    },
    {
      key: 'circle-geometry',
      title: '几何体',
      element: <CircleGeometry />,
    },
    {
      key: 'point-geometry',
      title: '点',
      element: <PointGeometry />,
    },
    {
      key: 'line-geometry',
      title: '线',
      element: <LineGeometry />,
    },
    {
      key: 'panorama',
      title: '全景图',
      element: <Panorama />,
    },
    {
      key: 'css3d',
      title: 'CSS3D 渲染器',
      element: <Css3DScene />,
    },
  ],
};
