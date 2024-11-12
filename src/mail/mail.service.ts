/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private sesClient: SESClient;
  constructor(private readonly configService: ConfigService) {
    this.sesClient = new SESClient({
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESSKEY'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESSKEY'),
      },
      region: this.configService.get('AWS_REGION'),
    });
  }

  protected createSendEmailCommand = (
    toAddress: string,
    fromAddress: string,
    coin: string,
    percentageIncrease: number,
  ) => {
    const subject = `Alert: ${coin} Price Increased by ${percentageIncrease.toFixed(2)}%`;
    const text = `The price of ${coin} has increased by ${percentageIncrease.toFixed(2)}% within the past hour.`;

    return new SendEmailCommand({
      Destination: {
        ToAddresses: [toAddress],
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: `<html>
                    <body>
                      <h2>${subject}</h2>
                      <p>${text}</p>
                      <p>This is an automated price alert notification.</p>
                    </body>
                   </html>`,
          },
          Text: {
            Charset: 'UTF-8',
            Data: text,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject,
        },
      },
      Source: fromAddress,
    });
  };

  async sendAlertEmail(
    reciEmail: string,
    senderEmail: string,
    coin: string,
    price: number,
  ) {
    const sendEmailCommand = this.createSendEmailCommand(
      reciEmail,
      senderEmail,
      coin,
      price,
    );

    try {
      
      return await this.sesClient.send(sendEmailCommand);
    } catch (e) {
      console.error('Failed to send email.');
      return e;
    }
  }
}
