import { Action, Command, Update } from 'nestjs-telegraf';
import { forwardRef, Inject, Logger } from '@nestjs/common';
import constants from '@shared/constants';
import { UtilsService } from '../utils/utils.service';
import { I18nService } from 'nestjs-i18n';
import { TokenFilterType } from '@shared/types/notification-alert';
import { mockNotification } from '../../../../non-bll-scipts/notification-mock';
import { AlertService } from '../alert/alert.service';
import { MarkupButtonsService } from '../buttons/button.service';
import { TextService } from '../text/text.service';
import { WhaleDetectionService } from '../whale-detection/whale-detection.service';
import { TokenDetailsService } from '../token-details/token-details.service';
import { ScoreManager } from '../../managers/score-manager';
import { RedisService } from '../../../db/services/redis.service';
import { thresholdValues } from '@shared/types/threshold';

@Update()
export class CommandsService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly utilsService: UtilsService,
    @Inject(forwardRef(() => AlertService))
    private readonly alertService: AlertService,
    private readonly i18n: I18nService,
    private readonly buttonsService: MarkupButtonsService,
    private readonly textService: TextService,
    private readonly whaleDetectionService: WhaleDetectionService,
    private readonly tokenService: TokenDetailsService,
    private readonly scoreManager: ScoreManager,
    private readonly redisCache: RedisService,
  ) {
  }


//@ts-ignore
  @Action(/trade_(.+)/)
  async onTrade(ctx) {
    const tokenAddress = ctx.match[1];

    await ctx.scene.enter('trade', { token: tokenAddress });
  }

//@ts-ignore
  @Command(constants.commands.trade)
  async tradeCommand(ctx) {
    ctx.scene.state.token = undefined;
    await this.handleCommand(ctx, constants.scenes.trade);
  }

//@ts-ignore
  @Command(constants.commands.alert)
  async alert(ctx) {
    let notificationTypeText = await this.i18n.translate('i18n.call_type.raydium_token_launch');
    const filtersToApply = [
      TokenFilterType.FreezeAuthority,
      TokenFilterType.IsMutable,
      TokenFilterType.MintFilter,
      TokenFilterType.NumberOfHolders,
    ];

    const tokenAddress = mockNotification.tokenAddress;
    const tokenDetails = await this.tokenService.getTokenDetails(tokenAddress);
    if (!tokenDetails) {
      this.logger.error(`Failed to retrieve valid token details for address: ${tokenAddress}`);
      return;
    }
    const whaleCount = await this.whaleDetectionService.getWhalesAddresses(tokenAddress);
    const tokenPnlAndWinrate = await this.tokenService.getTokenPnlAndWinRate(tokenAddress);
    this.logger.debug(`tokenPnlAndWinrate: ${JSON.stringify(tokenPnlAndWinrate)}`);

    const {
      score,
      scoreBreakdown,
    } = await this.scoreManager.calculateTokenScore(tokenDetails, tokenPnlAndWinrate, whaleCount, true);
    const differentialBreakdown = await this.redisCache.getDiffBreakdown(tokenAddress, tokenDetails);
    const tokenAgeInHours = tokenDetails.ageOfTokenInSeconds / 3600;
    if (tokenAgeInHours < thresholdValues.raydiumAgeOfToken) {
      notificationTypeText = await this.i18n.translate('i18n.call_type.raydium_token_launch');
      this.logger.debug('Notification type: RAYDIUM_TOKEN_LAUNCH');
    } else {
      notificationTypeText = await this.i18n.translate('i18n.call_type.new_call');
      this.logger.debug('Notification type: NEW_CALL');
    }
    await this.alertService.processTokenAlert(mockNotification, notificationTypeText, filtersToApply, whaleCount, score, tokenDetails, scoreBreakdown, differentialBreakdown, tokenPnlAndWinrate);
  }

  // async alert(ctx) {
  //   const tokenAddress = mockNotification.tokenAddress;
  //   const notificationTypeText = await this.i18n.translate('i18n.call_type.raydium_token_launch');
  //   const filtersToApply = [
  //     TokenFilterType.MinLiquidityFilter,
  //     TokenFilterType.FreezeAuthority,
  //     TokenFilterType.IsMutable,
  //     TokenFilterType.LiquidityLock,
  //     TokenFilterType.MintFilter,
  //     TokenFilterType.DevWalletValue,
  //     TokenFilterType.NumberOfHolders,
  //     TokenFilterType.ScoreFilter,
  //     // TokenFilterType.LiquidityRatioFilter,
  //   ];
  //   const { isValid, whaleCount, score, scoreBreakdown, tokenPnlAndWinrate } =
  //     await this.tokenFilterService.validateToken(tokenAddress, filtersToApply);
  //   if (!isValid) {
  //     return;
  //   }
  //
  //   await this.alertService.processTokenAlert(mockNotification, notificationTypeText, filtersToApply, whaleCount, score, scoreBreakdown, null, tokenPnlAndWinrate);
  // }


//@ts-ignore
  @Command('start')
  async start(ctx) {
    const args = ctx.message.text.split(' ')[1];
    if (args) {
      this.logger.log(`Received start command with argument: ${args}`);
      if (this.utilsService.validateSolanaWalletAddress(args)) {
        const token = args;
        ctx.scene.state.token = token;
        this.logger.debug(`Token saved in scene state: ${ctx.scene.state.token}`);

        await ctx.scene.enter('trade', { token });
      } else {
        this.logger.error('Invalid Solana wallet address provided.');
        await ctx.reply('The provided address is not a valid Solana wallet address.');
      }
    } else {
      // If no arguments are provided, handle the start scene
      const currentScene = ctx.scene.current?.id;
      if (!currentScene || currentScene === 'start') {
        this.logger.debug('No arguments provided, entering start scene');
        await this.handleCommand(ctx, constants.scenes.start);
      } else {
        this.logger.log(`Already in a scene: ${currentScene}. No need to enter start.`);
      }
    }
  }


//SCENES
  //@ts-ignore
  @Command(constants.commands.broadcast)
  async broadcast(ctx) {
    await this.handleCommand(ctx, constants.scenes.broadcast);
  }

  //@ts-ignore
  @Command(constants.commands.message)
  async message(ctx) {
    await this.handleCommand(ctx, constants.scenes.message);
  }

//@ts-ignore
  @Command(constants.commands.trade)
  async trade(ctx) {
//    this.cacheService.del()
    ctx.scene.state = {};

    await this.handleCommand(ctx, constants.scenes.trade);
  }


//@ts-ignore
  @Command(constants.commands.help)
  async help(ctx) {
    await this.handleCommand(ctx, constants.scenes.help);
  }

//@ts-ignore
  @Command(constants.commands.referral)
  async referral(ctx) {
    await this.handleCommand(ctx, constants.scenes.referral);
  }

//@ts-ignore // TODO: uncomment once production
//   @Command(constants.commands.plan)
//   async plan(ctx) {
//     await this.handleCommand(ctx, constants.scenes.plan);
//   }

//@ts-ignore
  @Command(constants.commands.wallet)
  async wallet(ctx) {
    await this.handleCommand(ctx, constants.scenes.wallet);
  }

//@ts-ignore
  @Command(constants.commands.settings)
  async settings(ctx) {
    await this.handleCommand(ctx, constants.scenes.settings);
  }


//@ts-ignore
  @Command(constants.commands.portfolio)
  async portfolio(ctx) {
    await this.handleCommand(ctx, constants.scenes.portfolio);
  }

  private async handleCommand(ctx, sceneName: string) {
    this.logCurrentScene(ctx);
    await ctx.scene.enter(sceneName);
  }

  private logCurrentScene(ctx) {
    const currentScene = ctx.scene.current?.id || 'none';
    this.logger.debug(`Current scene: ${currentScene}`);
  }

}
