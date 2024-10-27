import { Injectable, Logger } from '@nestjs/common';
import { createCanvas, loadImage } from 'canvas';
import { join } from 'path';
import { Buffer } from 'buffer';

@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);

  async createTradeImage(data: {
    name: string,
    investedAmountUSD: number,
    investedAmountSOL: number,
    multiplier: number,
    profitUSD: number,
    profitSOL: number,
  }): Promise<Buffer> {
    const canvas = createCanvas(1280, 1280);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.logger.log('Canvas initialized and cleared');
    const backgroundPath = join(__dirname, '..', 'assets', 'pnl_template.jpg');
    this.logger.log('Loading background image from:', backgroundPath);

    const backgroundImage = await loadImage(backgroundPath);
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    this.setupTextStyles(ctx, data);

    return new Promise((resolve, reject) => {
      canvas.toBuffer((err, buffer) => {
        if (err) {
          this.logger.error('Failed to generate buffer from canvas:', err);
          reject(err);
        } else {
          resolve(buffer);
        }
      });
    });
  }

  private setupTextStyles(ctx, data) {
    ctx.textAlign = 'left';

    // Name at the top
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '48px monospace';
    ctx.fillText(data.name, 150, 200);

    // INVESTED Section
    ctx.fillStyle = '#00FF00';
    ctx.font = 'bold 36px monospace';
    ctx.fillText('INVESTED', 150, 300);

    // Invested Amount USD
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '48px monospace';
    ctx.fillText(`$${data.investedAmountUSD.toFixed(2)}`, 150, 450);

    // Invested Amount SOL
    ctx.fillStyle = '#FFD700';
    ctx.font = '36px monospace';
    ctx.fillText(`\u20BF ${data.investedAmountSOL.toFixed(4)} SOL`, 150, 500);

    // Multiplier
    ctx.fillStyle = data.profitUSD >= 0 ? '#FFD700' : '#FF0000';
    ctx.font = 'bold 96px monospace';
    ctx.fillText(`${data.multiplier.toFixed(2)}x`, 150, 650);

    // PROFIT Section
    ctx.fillStyle = '#00FF00';
    ctx.font = 'bold 36px monospace';
    ctx.fillText('PROFIT', 750, 300);

    // Profit Amount USD
    ctx.fillStyle = data.profitUSD >= 0 ? '#FFFFFF' : '#FF0000';
    ctx.font = '48px monospace';
    ctx.fillText(`$${data.profitUSD.toFixed(2)}`, 750, 450);

    // Profit Amount SOL
    ctx.fillStyle = data.profitUSD >= 0 ? '#FFD700' : '#FF0000';
    ctx.font = '36px monospace';
    ctx.fillText(`\u20BF ${data.profitSOL.toFixed(4)} SOL`, 750, 500);
  }
}