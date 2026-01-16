import { Suspense } from 'react'
import type { ComponentType, FC, LazyExoticComponent } from 'react'
import LazyLoading from './Loading'

interface LazyImportProps {
  lazy?: LazyExoticComponent<ComponentType>
}

const LazyImport: FC<LazyImportProps> = ({ lazy }) => {
  const Component = lazy ? lazy : () => null
  return (
    <Suspense fallback={<LazyLoading />}>
      <Component />
    </Suspense>
  )
}

export default LazyImport
