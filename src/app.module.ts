import { MailerModule } from 'nestjs-mailer';
import { TestAccount, createTestAccount } from 'nodemailer';

import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { OgmaInterceptor, OgmaModule } from '@ogma/nestjs-module';
import { ExpressParser } from '@ogma/platform-express';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    OgmaModule.forRootAsync({
      inject: [],
      useFactory: () => ({
        json: false,
        color: true,
        application: 'NestJS',
        stream: {
          write: (message: string) => {
            // didn't include the appendFile or the configService
            process.stdout.write(message);
          },
        },
      }),
    }),
    MailerModule.forRootAsync({
      // grant module to the custom configService
      imports: [],
      inject: [],
      useFactory: async () => {
        const isDev = true;
        const port = parseInt('587');
        const testAccount = await createTestAccount();
        return {
          config: {
            transport: {
              host: 'smtp.ethereal.email',
              port: port,
              secure: port === 456,
              auth: {
                user: isDev ? testAccount.user : 'user',
                pass: isDev ? testAccount.pass : '123',
              },
            },
            defaults: {
              // set email defaults
              from: 'william@afton.com',
            },
          },
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ExpressParser,
    {
      provide: APP_INTERCEPTOR,
      useClass: OgmaInterceptor,
    },
  ],
})
export class AppModule {}
