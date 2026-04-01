/**
 * Resize and compress an image for localStorage-friendly data URLs.
 */
export function fileToCompressedDataUrl(file, maxSide = 720, quality = 0.75) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Not an image'))
      return
    }
    const img = new Image()
    const u = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(u)
      let w = img.naturalWidth
      let h = img.naturalHeight
      const scale = Math.min(1, maxSide / Math.max(w, h))
      w = Math.round(w * scale)
      h = Math.round(h * scale)
      const c = document.createElement('canvas')
      c.width = w
      c.height = h
      const ctx = c.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas unsupported'))
        return
      }
      ctx.drawImage(img, 0, 0, w, h)
      let q = quality
      let dataUrl = c.toDataURL('image/jpeg', q)
      while (dataUrl.length > 450000 && q > 0.35) {
        q -= 0.1
        dataUrl = c.toDataURL('image/jpeg', q)
      }
      resolve(dataUrl)
    }
    img.onerror = () => {
      URL.revokeObjectURL(u)
      reject(new Error('Could not read image'))
    }
    img.src = u
  })
}
