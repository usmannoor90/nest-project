/* eslint-disable prettier/prettier */
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('price_alert')
export class PriceAlert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  chain: string;

  @Column('decimal')
  priceTarget: number;

  @Column()
  email: string;

  @Column({ default: false })
  isTriggered: boolean;
}
