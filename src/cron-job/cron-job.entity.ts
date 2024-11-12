/* eslint-disable prettier/prettier */

import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('coin_price')
export class CoinPrice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  coin: string;

  @Column('decimal', { precision: 18, scale: 8 })
  price: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
