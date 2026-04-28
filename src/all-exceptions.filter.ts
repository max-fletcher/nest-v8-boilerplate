// This is a custom exceptions filter. This will catch all exceptions and spit out exceptions in the format we define
// as opposed to using Nest JS's default exception format.
// It is worth noting that here, we are extending the "BaseExceptionFilter" as opposed to the "ExceptionFilter" (see docs
// https://docs.nestjs.com/exception-filters#inheritance).
// Hence, this will affect ALL exceptions throughout the app and not just a specific controller/method/function we are binding to.
import { ArgumentsHost, HttpStatus, HttpException, Catch } from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import { Request, Response } from 'express'
import { CustomLoggerService } from './custom-logger/custom-logger.service'

type ExceptionResponse = null | {
  message?: string | string[]
  errors?: unknown
  error?: string
}

// A typescript type
type MyResponseObj = {
  statusCode: number
  timestamp: string
  path: string
  response: ExceptionResponse | string
}

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  // instantiating an instance of the custom logger you made to this controller. Also, the param is the name of this controller(i.e "AllExceptionsFilter")
  // so we have some context as to where the error is occuring
  private readonly logger = new CustomLoggerService(AllExceptionsFilter.name)

  // the catch function accepts 2 params. Exceptions that contains the exceptions and host that contains additional information and methods
  // (see docs about ArgumentHost: https://docs.nestjs.com/exception-filters#arguments-host )
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    // The default exception that will be thrown if one occurs
    const myResponseObj: MyResponseObj = {
      statusCode: 500,
      timestamp: new Date().toISOString(),
      path: request.url,
      response: null
    }

    if (exception instanceof HttpException) {
      const response = exception.getResponse()
      let msg: string = exception.message
      let errors: unknown
      myResponseObj.statusCode = exception.getStatus()

      if (typeof response === 'string') {
        msg = response
      } else if (typeof response === 'object' && response !== null) {
        const res = response as ExceptionResponse

        if (res !== null) {
          if (typeof res.message === 'string') {
            msg = res.message
          } else if (Array.isArray(res.message)) {
            msg = res.message[0]
          }

          errors = res.errors
        }
      }

      myResponseObj.response = {
        message: msg,
        errors: errors,
        error: exception.getResponse()['error'] as string
      }
      // Log error data
      this.logger.error(myResponseObj.response.message, AllExceptionsFilter.name)
    } else {
      myResponseObj.statusCode = HttpStatus.INTERNAL_SERVER_ERROR
      myResponseObj.response = 'Internal Server Error'
      // Log error data
      this.logger.error(myResponseObj.response, AllExceptionsFilter.name)
    }

    response.status(myResponseObj.statusCode).json(myResponseObj)

    // NOTE: THIS NEEDS TO BE IMPLEMENTED INSIDE main.ts FOR THIS TO WORK AS IT SHOULD

    // pass rest of the exception handling procedure/function to the BaseExceptionFilter so that it does that it does
    super.catch(exception, host)
  }
}
