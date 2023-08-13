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

export const uploadFormData = async (
  url: string,
  formData: FormData,
  onProgress: (progress: number) => void
): Promise<{ status: number, body: string }> =>
  await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.upload.addEventListener('progress', e => onProgress(e.loaded / e.total))
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status !== 0) resolve({ status: xhr.status, body: xhr.responseText })
        else reject(new Error(xhr.statusText))
      }
    }
    xhr.open('POST', url, true)
    xhr.setRequestHeader('Authorization', localStorage.getItem('ecthelion:token') ?? '')
    xhr.send(formData)
  })
