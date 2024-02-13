import { InjectMailer, Mailer } from 'nestjs-mailer';
import { getTestMessageUrl } from 'nodemailer';
import mailer from 'nodemailer/lib/mailer';
import { catchError, from, of, retry, tap } from 'rxjs';

import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  readonly logger = new Logger(AppService.name);
  private readonly isDev = true;

  constructor(@InjectMailer() private readonly transporter: Mailer) {}

  async sendEmail(options: mailer.Options) {
    const $sendmail = from(this.transporter.sendMail(options));

    $sendmail
      .pipe(
        tap((info) => {
          if (this.isDev) this.logger.debug(getTestMessageUrl(info));
        }),
        retry({
          count: 3,
          delay: (retryCount) => {
            this.logger.log(`Retry attempt ${retryCount + 1}`);
            return of(retryCount * 1000); // Delay in milliseconds between retries
          },
        }),
        catchError((error: Error) => {
          this.logger.error(error);
          return of(error);
        }),
      )
      .subscribe({
        //next: (value) => this.logger.log(value),
        error: (err) => this.logger.log(`${err}: Retried 3 times then quit!`),
      });
  }
}
