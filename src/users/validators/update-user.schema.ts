import { z } from 'zod'

export const UpdateUserSchema = z.object({
  name: z
    .string({
      error: (issue) => {
        if (typeof issue.input !== 'string') return 'Name must be a string'
      }
    })
    .min(3, 'Name must be at least 3 characters')
    .max(300)
    .optional()
    .nullable(),
  email: z
    .string({
      error: (issue) => {
        if (typeof issue.input !== 'string') return 'Email must be a string'
      }
    })
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
      error: 'Invalid email address'
    })
    .optional(),
  password: z
    .string({
      error: (issue) => {
        if (typeof issue.input !== 'string') return 'Password must be a string'
      }
    })
    .min(8, 'Password must be at least 8 characters')
    .max(50)
    .optional()
})

export type TUpdateUserZodValDto = z.infer<typeof UpdateUserSchema>
