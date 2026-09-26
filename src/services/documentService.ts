export interface DocumentPreview {
  fileName: string
  status: 'Selected' | 'Not uploaded'
  notice: string
}

export function describeDocumentPreview(fileName?: string): DocumentPreview {
  return {
    fileName: fileName ?? '',
    status: fileName ? 'Selected' : 'Not uploaded',
    notice: 'Prototype document preview only — not legal verification.',
  }
}
