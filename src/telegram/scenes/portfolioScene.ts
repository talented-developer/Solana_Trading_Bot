import { Action, Wizard, WizardStep } from 'nestjs-telegraf';
import { Logger } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { UtilsService } from '../service/utils/utils.service';
import { TextService } from '../service/text/text.service';
import { SolanaService } from '../../providers/solana/solana.service';
import { UserRepository } from '../../db/repository/user.repository';
import { User } from '@prisma/client';
import { CacheService } from '../service/utils/cache.service';
import constants from '@shared/constants';
import { DexscreenerService } from '../../providers/dexscreener/dexscreener.service';
import { TokenResponse } from '../../providers/dexscreener/types';

@Wizard('portfolio')
export class PortfolioScene {
  private readonly logger = new Logger(this.constructor.name);
  private readonly pageSize = 6;

  constructor(
    private readonly i18n: I18nService,
    private readonly utilsService: UtilsService,
    private readonly textService: TextService,
    private readonly solanaService: SolanaService,
    private readonly userService: UserRepository,
    private readonly cacheService: CacheService,
    private readonly dexscreenerService: DexscreenerService,
  ) {
  }

  private async handleCommand(ctx): Promise<boolean> {
    if (!ctx.scene.state.token) {
      return this.utilsService.checkAndHandleCommand(ctx, this.startNewInstance.bind(this), this.close.bind(this));
    }
    return false;
  }

  @WizardStep(0)
  async step0(ctx) {
    if (await this.handleCommand(ctx)) return;
    await this.startNewInstance(ctx);
  }


//@ts-ignore
  @Action(/trade_(.+)/)
  async onTrade(ctx) {
    if (await this.handleCommand(ctx)) return;
    const tokenAddress = ctx.match[1];

    await ctx.scene.enter('trade', { token: tokenAddress });
  }


//@ts-ignore
  @Action('close')
  async close(ctx) {
    ctx.scene.state = {};
    await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
    await ctx.scene.leave();
  }

//@ts-ignore
  @Action('prev_page')
  async onPrevPage(ctx) {
    if (await this.handleCommand(ctx)) return;
    ctx.scene.state.page -= 1;
    await this.sendPortfolioMessage(ctx);
  }

//@ts-ignore
  @Action('next_page')
  async onNextPage(ctx) {
    if (await this.handleCommand(ctx)) return;
    ctx.scene.state.page += 1;
    await this.sendPortfolioMessage(ctx);
  }

  private async startNewInstance(ctx) {
    const telegramId = this.utilsService.getTelegramId(ctx);
    const cacheKey = `user_tokens_${telegramId}`;
    let validTokenAccounts: any[] = await this.cacheService.get<any[]>(cacheKey) || [];
    const user = await this.userService.getUserByTelegramId(telegramId);

    validTokenAccounts = await this.getValidTokenAccounts(user);
    if (validTokenAccounts.length === 0) {
      await this.handleNoValidTokens(ctx);
      return;
    }

    const tokenAddresses = validTokenAccounts
      .map(token => token.tokenAddress)
      .filter(address => address !== constants.solana.tokens.usdc_token_address);

    const tokenPrices = await this.getDexscreenerResponse(tokenAddresses);

    // Validate token accounts against the token prices
    validTokenAccounts = this.validateTokenAccounts(validTokenAccounts, tokenPrices);
    if (validTokenAccounts.length === 0) {
      await this.handleNoValidTokens(ctx);
      return;
    }

    await this.cacheService.set(cacheKey, validTokenAccounts, 3600);
    await this.initializeSceneState(ctx, validTokenAccounts);

    const portfolioText = await this.buildPortfolioText(ctx, validTokenAccounts, tokenPrices);
    const buttons = await this.buildButtons(ctx, validTokenAccounts, tokenPrices);
    await this.sendInitialPortfolioMessage(ctx, portfolioText, buttons);
  }

  private async getValidTokenAccounts(user: User) {
    const walletAddress = user.walletAddress;
    const validTokenAccounts = await this.solanaService.getUsersTokenAddresses(walletAddress);
    this.logger.debug(`validTokenAccounts: ${JSON.stringify(validTokenAccounts)}`);

    return validTokenAccounts.map(token => ({
      tokenAddress: token.mintAddress,
      tokenBalance: token.balance,
    }));
  }


  private async handleNoValidTokens(ctx) {
    this.logger.debug(`handleNoValidTokens}`);
    const errorMessage = this.i18n.translate('i18n.error_messages.no_tokens_found');
    await this.textService.sendMessageNoButtons(ctx, errorMessage);
    await ctx.scene.leave();
  }

  private async initializeSceneState(ctx, validTokenAccounts: any[]) {
    ctx.scene.state.tokenAccounts = validTokenAccounts;
    ctx.scene.state.page = 0;
    ctx.scene.state.messageId = null;
  }

  private async sendInitialPortfolioMessage(ctx, portfolioText, buttons) {
    const message = await this.textService.sendMessageWithButtons(ctx, portfolioText, buttons);
    ctx.scene.state.messageId = message.message_id;
  }

  private async getDexscreenerResponse(tokenAddresses: string[]): Promise<Record<string, {
    priceUsd: number;
    name: string;
  }>> {
    const tokenPricesInUsd = await Promise.all(
      tokenAddresses.map(async address => {
        const tokenDetails: TokenResponse = await this.dexscreenerService.fetchMarketDataByTokenAddress(address);
        const pair = tokenDetails?.pairs?.[0];
        const priceUsd = pair?.priceUsd ? parseFloat(pair.priceUsd) : null;
        const tokenName = pair?.baseToken?.name || pair?.quoteToken?.name || null;

        this.logger.debug(`Token Address: ${address}, priceUsd: ${priceUsd}, tokenName: ${tokenName}`);
        return { address, priceUsd, tokenName };
      }),
    );

    return Object.fromEntries(
      tokenPricesInUsd
        .filter(({ priceUsd, tokenName }) => priceUsd !== null && tokenName !== null)
        .map(({ address, priceUsd, tokenName }) => [address, { priceUsd, name: tokenName }]),
    );
  }

  private isTokenValueAboveThreshold(tokenPriceInUsdc: number, tokenBalance: string): boolean {
    const balanceInUsdc = tokenPriceInUsdc * parseFloat(tokenBalance);
    return balanceInUsdc >= constants.threshold.token_price_usd_positions;
  }

  private validateTokenAccounts(tokenAccounts: any[], tokenPrices): any[] {
    return tokenAccounts.filter(token => {
      const priceInfo = tokenPrices[token.tokenAddress];
      return priceInfo
        // && this.isTokenValueAboveThreshold(priceInfo.priceUsd, token.tokenBalance);

    });
  }


  private formatTokenText(tokenDetails: any, index: number, tokenPrices): string {
    const tokenPriceInUsdc = tokenPrices[tokenDetails.tokenAddress]?.priceUsd;
    const tokenName = tokenPrices[tokenDetails.tokenAddress]?.name;
    const tokenBalance = parseFloat(tokenDetails.tokenBalance) || 0;

    return this.i18n.translate('i18n.dynamic_token', {
      args: {
        tokenNumber: index,
        tokenName: tokenName,
        tokenBalance: this.utilsService.formatLargeNumber(tokenBalance),
        tokenBalanceInUsdc: this.utilsService.formatUsd(tokenPriceInUsdc ? tokenPriceInUsdc * tokenBalance : NaN),
      },
    });
  }

  private async buildPortfolioText(ctx, validTokenAccounts: any[], tokenPrices: any): Promise<string> {
    const { page } = ctx.scene.state;
    const pagedTokenAccounts = validTokenAccounts.slice(page * this.pageSize, (page + 1) * this.pageSize);

    const portfolioText = pagedTokenAccounts
      .map((tokenDetails, idx) => {
        const priceUsd = tokenPrices[tokenDetails.tokenAddress]?.priceUsd;
        const tokenName = tokenPrices[tokenDetails.tokenAddress]?.name;
        return priceUsd && tokenName ? this.formatTokenText(tokenDetails, page * this.pageSize + idx + 1, tokenPrices) : null;
      })
      .filter(tokenText => tokenText)
      .join('\n\n');

    return `${this.i18n.translate('i18n.position_menu')}\n\n${portfolioText}`;
  }


  private async buildButtons(ctx, validTokenAccounts: any[], tokenPrices: any): Promise<any[]> {
    const { page } = ctx.scene.state;
    const start = page * this.pageSize;
    const end = Math.min(start + this.pageSize, validTokenAccounts.length);
    const pagedTokenAccounts = validTokenAccounts.slice(start, end);

    const buttons = pagedTokenAccounts.map((token) => {
      return {
        text: tokenPrices[token.tokenAddress]?.name,
        callback_data: `trade_${token.tokenAddress}`,
      };
    });

    const navButtons = [
      ...(page > 0 ? [{ text: '⬅️', callback_data: 'prev_page' }] : []),
      { text: this.i18n.translate('i18n.buttons.close'), callback_data: 'close' },
      ...(end < validTokenAccounts.length ? [{ text: '➡️', callback_data: 'next_page' }] : []),
    ];
    const allButtons: any[] = buttons.length > 0 ? [buttons] : [];
    if (navButtons.length > 0) {
      allButtons.push(navButtons);
    }

    return allButtons;
  }

  private async sendPortfolioMessage(ctx) {
    const { messageId } = ctx.scene.state;
    const validTokenAccounts = ctx.scene.state.tokenAccounts;
    const tokenPrices = await this.getDexscreenerResponse(validTokenAccounts.map(token => token.tokenAddress)); // Ensure you get the token prices as well

    const portfolioTextText = await this.buildPortfolioText(ctx, validTokenAccounts, tokenPrices);
    const buttons = await this.buildButtons(ctx, validTokenAccounts, tokenPrices);

    await this.textService.updateMessage(ctx, portfolioTextText, buttons, ctx.chat.id, messageId);
  }
}
