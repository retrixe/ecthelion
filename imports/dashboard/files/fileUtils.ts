export const normalisePath = (path: string): string => {
  const fixedPath = path.replace(/\/+/g, '/')
  return (fixedPath.startsWith('/') ? '' : '/') + fixedPath + (fixedPath.endsWith('/') ? '' : '/')
}

export const parentPath = (path: string): string => {
  const pathSegments = normalisePath(path).split('/')
  if (pathSegments.length < 3) return '/'
  pathSegments.splice(pathSegments.length - 2, 2)
  return pathSegments.join('/')
}

export const joinPath = (a: string, b: string): string => {
  const normalisedPathA = normalisePath(a)
  const normalisedPathB = normalisePath(b)
  return normalisePath(normalisedPathA + normalisedPathB)
}
