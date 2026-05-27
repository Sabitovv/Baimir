import { useEffect, useMemo, useState } from 'react'
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer'
import '@cyntler/react-doc-viewer/dist/index.css'

export interface Attachment {
  id: number
  name: string
  originalFilename: string
  fileUrl: string
  extension: string
  fileSize: number
  mimeType: string
  sortOrder: number
  downloadUrl: string
}

type AttachmentListProps = {
  attachments: Attachment[]
  className?: string
}

const formatFileSize = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let unitIndex = 0

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }

  if (unitIndex === 0) return `${Math.round(value)} ${units[unitIndex]}`
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`
}

const normalizeDownloadUrl = (url: string): string => {
  if (!url) return '#'
  if (/^https?:\/\//i.test(url)) return url
  return url.startsWith('/') ? url : `/${url}`
}

const AttachmentList = ({ attachments, className = '' }: AttachmentListProps) => {
  const sortedAttachments = useMemo(
    () => [...attachments].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [attachments],
  )

  const [selectedFile, setSelectedFile] = useState<Attachment | null>(
    sortedAttachments[0] ?? null,
  )

  useEffect(() => {
    if (sortedAttachments.length === 0) {
      setSelectedFile(null)
      return
    }

    setSelectedFile((current) => {
      if (!current) return sortedAttachments[0]
      const stillExists = sortedAttachments.find((file) => file.id === current.id)
      return stillExists ?? sortedAttachments[0]
    })
  }, [sortedAttachments])

  if (sortedAttachments.length === 0) {
    return (
      <div className={`rounded-xl border border-gray-200 bg-white p-6 text-gray-500 ${className}`}>
        Файлы не найдены
      </div>
    )
  }

  return (
    <section className={`grid grid-cols-1 gap-4 lg:grid-cols-[360px_minmax(0,1fr)] ${className}`}>
      <aside className="rounded-2xl border border-gray-200 bg-white p-3 sm:p-4">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-800">
          Список файлов
        </h3>

        <div className="space-y-2">
          {sortedAttachments.map((file) => {
            const isActive = selectedFile?.id === file.id

            return (
              <article
                key={file.id}
                className={`rounded-xl border p-3 transition-all ${
                  isActive
                    ? 'border-[#F58322] bg-[#FFF7F0]'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedFile(file)}
                  className="w-full text-left"
                >
                  <p className="truncate text-sm font-semibold text-gray-900">{file.name}</p>
                  <p className="mt-1 truncate text-xs text-gray-500">{file.originalFilename}</p>
                  <p className="mt-2 text-xs uppercase text-gray-500">
                    {file.extension} • {formatFileSize(file.fileSize)}
                  </p>
                </button>

                <a
                  href={normalizeDownloadUrl(file.downloadUrl)}
                  className="mt-3 inline-flex rounded-md bg-[#F58322] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#DB741F]"
                >
                  Скачать
                </a>
              </article>
            )
          })}
        </div>
      </aside>

      <div className="rounded-2xl border border-gray-200 bg-white p-3 sm:p-4">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-800">
          Предпросмотр
        </h3>

        {selectedFile ? (
          <div className="min-h-[520px] overflow-hidden rounded-xl border border-gray-100">
            <DocViewer
              pluginRenderers={DocViewerRenderers}
              documents={[
                {
                  uri: selectedFile.fileUrl,
                  fileType: selectedFile.mimeType,
                  fileName: selectedFile.originalFilename,
                },
              ]}
              style={{ height: '520px' }}
              config={{
                header: {
                  disableFileName: false,
                  retainURLParams: true,
                },
              }}
            />
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
            Выберите файл для предпросмотра
          </div>
        )}
      </div>
    </section>
  )
}

export default AttachmentList
export { formatFileSize }
