import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { AllExceptionsFilter } from './all-exceptions.filter'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Serve static files from the "uploads" directory at the "/uploads" URL path
  // *IMPORTANT NOTE: The starting directory is from /dist. That is why we are using join(__dirname, '..', '..', 'public', 'uploads') and not join(__dirname, '..', 'public', 'uploads')
  // app.useStaticAssets(join(__dirname, '..', '..', 'public', 'uploads'), {
  //   prefix: '/uploads/'
  // })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true
    })
  )

  // IMPORTING AND APPLYING STUFF FOR THE CUSTOM ExceptionFilter WE CREATED(next 2 lines)
  const { httpAdapter } = app.get(HttpAdapterHost)
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter))

  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
