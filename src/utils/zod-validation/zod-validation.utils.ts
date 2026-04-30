import { HttpException, UnprocessableEntityException } from '@nestjs/common'
import { ZodType, ZodError } from 'zod'

export const validateWithZod = async <T>(schema: ZodType<T>, data: unknown) => {
  try {
    const result = await schema.parseAsync(data)
    return result
  } catch (error) {
    if (error instanceof ZodError) {
      throw new UnprocessableEntityException({
        message: 'Validation failed',
        errors: error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      })
    } else {
      throw new HttpException('Something went wrong.', 500)
    }
  }
}
