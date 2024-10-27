import { NotificationDto, NotificationType } from '../shared/types/notification-alert';

export const mockNotification: NotificationDto = {
  timestamp: 1725019979,
  tokenAddress: 'HeJUFDxfJSzYFUuHLxkMqCgytU31G6mjP4wKviwqpump',
  tokenSymbol: 'TOKEN1',
  tokenPair: {
    coin: 'COIN1',
    pc: 'PC1',
    pairAddress: 'PAIR1',
  },
  type: NotificationType.RAYDIUM_TOKEN_LAUNCH,
  body: {
    volume: 1500,
    launchDate: '2024-08-29T00:00:00Z',
    initialPrice: 5.0,
    currentPrice: 7.5,
    changePercentage: 50.0,
  },
};