/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Moralis from 'moralis';
import { CoinPrice } from 'src/cron-job/cron-job.entity';
import { Repository } from 'typeorm';
import { PriceAlert } from './prices.entity';
import { AlertDto } from 'src/DTO/AlertsDto';

@Injectable()
export class PricesService {
  private readonly logger = new Logger(PricesService.name);

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
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // ETH contract address for mainnet
      });

      const btcPriceResponse = await Moralis.EvmApi.token.getTokenPrice({
        chain: '0x1',
        address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // Replace with BTC address for accurate conversion
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
  async getHourlyPrice(coin:string, last24Hours) {
    return this.coinPriceRepository
      .createQueryBuilder('coinPrice')
      .where('coinPrice.coin = :coin', { coin })
      .andWhere('coinPrice.createdAt >= :last24Hours', { last24Hours })
      .orderBy('coinPrice.createdAt', 'ASC')
      .getMany();
  }
  async setAlert(alertDto:AlertDto) {
    const alert = this.priceAlertRepository.create(alertDto);
    await this.priceAlertRepository.save(alert);
    return { message: 'Alert set successfully' };
  }
}
