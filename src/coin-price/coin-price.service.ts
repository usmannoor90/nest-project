/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
// import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoinPrice } from './coin-price.entity';
import Moralis from 'moralis';
import * as moment from 'moment';
import { PriceAlert } from 'src/prices/prices.entity';

@Injectable()
export class CoinPriceService {
  private readonly logger = new Logger(CoinPriceService.name);

  constructor(
    @InjectRepository(CoinPrice)
    private coinPriceRepository: Repository<CoinPrice>,
    @InjectRepository(PriceAlert)
    private priceAlertRepository: Repository<PriceAlert>,
    
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    await this.savePrices();
    await this.checkForAlert();
    await this.checkForPriceAlerts();
  }
  private async savePrices() {
    this.logger.debug('Fetching coin prices from Moralis API...');
    try {
      // Fetch Ethereum price (Chain ID: 0x1 for Ethereum mainnet)
      const ethPriceResponse = await Moralis.EvmApi.token.getTokenPrice({
        chain: '0x1', // Ethereum mainnet
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // Ethereum's address on mainnet
      });

      // Fetch Polygon price (Chain ID: 0x89 for Polygon mainnet)
      const polygonPriceResponse = await Moralis.EvmApi.token.getTokenPrice({
        chain: '0x1', // Polygon mainnet
        address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0', // Polygon token address
      });

      const ethPrice = ethPriceResponse.raw.usdPrice;
      const polygonPrice = polygonPriceResponse.raw.usdPrice;

        // Create new CoinPrice entities
      const ethPriceEntity = this.coinPriceRepository.create({
        coin: 'Ethereum',
        price: ethPrice,
      });

      const polygonPriceEntity = this.coinPriceRepository.create({
        coin: 'Polygon',
        price: polygonPrice,
      });

       // Save prices to the database
      await this.coinPriceRepository.save([ethPriceEntity, polygonPriceEntity]);

      this.logger.debug('Coin prices saved to database successfully.');
    } catch (error) {
      this.logger.error('Error fetching coin prices:', error.message);
    }
  }

  private async checkForAlert() {
    const coins = ['Ethereum', 'Polygon'];
    for (const coin of coins) {
      const latestPrice = await this.coinPriceRepository.findOne({
        where: { coin },
        order: { createdAt: 'DESC' },
      });

      const oneHourAgo = moment().subtract(1, 'hours').toDate();
      const oldPrice = await this.coinPriceRepository.findOne({
        where: { coin, createdAt: oneHourAgo },
        order: { createdAt: 'DESC' },
      });

      if (latestPrice && oldPrice) {
        const percentageIncrease =
          ((latestPrice.price - oldPrice.price) / oldPrice.price) * 100;
        if (percentageIncrease > 3) {
          await this.sendAlertEmail(coin, percentageIncrease);
        }
      }
    }
  }

   private async sendAlertEmail(
    coin: string,
    percentageIncrease: number,
    email: string = 'hyperhire_assignment@hyperhire.in',
  ) {
    // Code to send an email alert
    this.logger.debug(
      `Alert: ${coin} price has increased by ${percentageIncrease.toFixed(2)}%. Email sent to ${email}`,
    );
  }

 async checkForPriceAlerts() {
    try {
      const activeAlerts = await this.priceAlertRepository.find({
        where: { isTriggered: false },
      });

      for (const alert of activeAlerts) {
        const latestPrice = await this.coinPriceRepository.findOne({
          where: { coin: alert.chain },
          order: { createdAt: 'DESC' },
        });

        if (latestPrice && latestPrice.price >= alert.priceTarget) {
          await this.sendAlertEmail(alert.chain, latestPrice.price, alert.email);
          alert.isTriggered = true;
          await this.priceAlertRepository.save(alert);
        }
      }
    } catch (error) {
      this.logger.error('Error checking price alerts:', error.message);
    }
  }
}
