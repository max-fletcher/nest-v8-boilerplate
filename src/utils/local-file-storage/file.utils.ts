import { Request } from 'express'
import { relative, resolve } from 'path'
import { promises as fsPromises } from 'fs'
import * as path from 'path'

export type formattedPathsType = {
  [key: string]: string[]
}

export type FieldsType = {
  fieldname: string
  originalname: string
  encoding: string
  mimetype: string
  destination: string
  filename: string
  path: string
  size: number
}

type MulterFiles = Record<string, Express.Multer.File[]>

export const multipleFileLocalFullPathResolver = (baseUrl: string, files: MulterFiles) => {
  if (!files || !Object.keys(files).length) return

  console.log('multipleFileLocalFullPathResolver', files)

  const formatted_paths: Record<string, string[]> = {}

  Object.entries(files).forEach(([fieldName, fileArray]) => {
    const paths = fileArray.map((file) => {
      const publicDirPath = resolve('public') // Absolute path to /public
      const filePath = resolve(file.path) // Absolute path to uploaded file
      const relativePath = relative(publicDirPath, filePath).replace(/\\/g, '/') // Always forward slashes
      baseUrl = process.env.FILE_BASE_URL && process.env.FILE_BASE_URL !== '' ? process.env.FILE_BASE_URL : baseUrl
      return `${baseUrl}/${relativePath}`
    })

    formatted_paths[fieldName] = paths
  })

  return formatted_paths
}

export const rollbackLocalFilesUpload = async (req: Request): Promise<void> => {
  if (!req.files || !Object.keys(req.files).length) return

  const deletePromises = Object.values(req.files as Record<string, FieldsType[]>)
    .flat() // flatten array i.e convert [[field1, field2], [field3]] into [field1, field2, field3]
    .map(async (field: FieldsType) => {
      const filePath = path.normalize(field.path) // ✅ handles both Windows and Linux
      try {
        await fsPromises.unlink(filePath)
      } catch {
        console.log('rollbackLocalFilesUpload: Local file uploads rollback failed for:', filePath)
      }
    })

  await Promise.all(deletePromises)
}

export const deleteLocalFile = async (req: Request, filePaths?: string[] | null): Promise<void> => {
  if (!filePaths || filePaths.length === 0) return

  const baseUrl = process.env.FILE_BASE_URL && process.env.FILE_BASE_URL !== '' ? process.env.FILE_BASE_URL : `${req.protocol}://${req.get('host')}`

  const deletePromises = filePaths.map(async (filePath) => {
    const relativePath = filePath.replace(`${baseUrl}/`, '')
    const tempFilePath = path.normalize(path.join('public', relativePath))

    try {
      await fsPromises.unlink(tempFilePath)
    } catch {
      console.log('deleteLocalFile: Local file deletion failed for:', tempFilePath)
    }
  })

  await Promise.all(deletePromises)
}
