/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';

export class AlertDto {
  @ApiProperty({ description: 'The blockchain chain name, e.g., Ethereum or Polygon' })
  chain: string;

  @ApiProperty({ description: 'The target price for the alert' })
  priceTarget: number;

  @ApiProperty({ description: 'The email to send the alert to' })
  email: string;
}