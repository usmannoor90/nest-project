/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Moralis from 'moralis';
import { CoinPrice } from 'src/coin-price/coin-price.entity';
import { Repository } from 'typeorm';
import { PriceAlert } from './prices.entity';

@Injectable()
export class PricesService {
  constructor(
    @InjectRepository(CoinPrice)
    private coinPriceRepository: Repository<CoinPrice>,
     @InjectRepository(PriceAlert) 
    private priceAlertRepository: Repository<PriceAlert>,
  ) {}

  private readonly FEE_PERCENTAGE = 0.03;

  async getSwapRate(ethAmount: number) {
    try {
      // Fetch current ETH and BTC prices from the Moralis API
      const ethPriceResponse = await Moralis.EvmApi.token.getTokenPrice({
        chain: '0x1',
        address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', // ETH contract address for mainnet
      });

      const btcPriceResponse = await Moralis.EvmApi.token.getTokenPrice({
        chain: '0x1',
        address: '0x4d5fc2e5416e1b9ff733a1c3542aa2e95c8d6f2a', // Replace with BTC address for accurate conversion
      });

      const ethPriceInUSD = ethPriceResponse.raw.usdPrice;
      const btcPriceInUSD = btcPriceResponse.raw.usdPrice;

      // Calculate the amount of BTC equivalent to the given ETH amount
      const totalEthInUSD = ethAmount * ethPriceInUSD;
      const btcAmount = totalEthInUSD / btcPriceInUSD;

      // Calculate the fee
      const feeEth = ethAmount * this.FEE_PERCENTAGE;
      const feeInUSD = feeEth * ethPriceInUSD;

      return {
        btcAmount,
        fee: {
          eth: feeEth,
          usd: feeInUSD,
        },
      };
    } catch (error) {
      console.log(error);

      throw new HttpException(
        'Error fetching swap rate',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async getHourlyProce(coin,last24Hours) {
    return this.coinPriceRepository
      .createQueryBuilder('coinPrice')
      .where('coinPrice.coin = :coin', { coin })
      .andWhere('coinPrice.timestamp >= :last24Hours', { last24Hours })
      .orderBy('coinPrice.timestamp', 'ASC')
      .getMany();
  }

  async setAlert(alertDto){
     const alert = this.priceAlertRepository.create(alertDto);
    await this.priceAlertRepository.save(alert);
    return { message: 'Alert set successfully' };
  }
 
}
