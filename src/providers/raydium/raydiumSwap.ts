import { Connection, Keypair, PublicKey, Transaction, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import {
  jsonInfo2PoolKeys,
  Liquidity,
  LiquidityPoolJsonInfo,
  LiquidityPoolKeys,
  Percent,
  SPL_ACCOUNT_LAYOUT,
  Token,
  TOKEN_PROGRAM_ID,
  TokenAccount,
  TokenAmount,
} from '@raydium-io/raydium-sdk';
import { Wallet } from '@coral-xyz/anchor';
import * as bs58 from 'bs58';

class RaydiumSwap {
  allPoolKeysJson: LiquidityPoolJsonInfo[];
  connection: Connection;
  wallet: Wallet;

  constructor(HELIUS_RPC_URL: string, WALLET_PRIVATE_KEY: string) {
    this.connection = new Connection(HELIUS_RPC_URL, { commitment: 'confirmed' });
    const secretKeyBuffer = bs58.decode(WALLET_PRIVATE_KEY);
    const secretKeyUint8Array = new Uint8Array([...secretKeyBuffer]);
    this.wallet = new Wallet(Keypair.fromSecretKey(secretKeyUint8Array));
  }


  findPoolInfoForTokens(mintA: string, mintB: string) {
    const poolData = this.allPoolKeysJson.find(
      (i) => (i.baseMint === mintA && i.quoteMint === mintB) || (i.baseMint === mintB && i.quoteMint === mintA),
    );

    if (!poolData) return null;

    return jsonInfo2PoolKeys(poolData) as LiquidityPoolKeys;
  }

  async getOwnerTokenAccounts() {
    const walletTokenAccount = await this.connection.getTokenAccountsByOwner(this.wallet.publicKey, {
      programId: TOKEN_PROGRAM_ID,
    });

    return walletTokenAccount.value.map((i) => ({
      pubkey: i.pubkey,
      programId: i.account.owner,
      accountInfo: SPL_ACCOUNT_LAYOUT.decode(i.account.data),
    }));
  }

  async getSwapTransaction(
    toToken: string,
    amount: number,
    poolKeys: LiquidityPoolKeys,
    maxLamports: number = 100000,
    useVersionedTransaction = true,
    fixedSide: 'in' | 'out' = 'in',
  ): Promise<Transaction | VersionedTransaction> {
    const directionIn = poolKeys.quoteMint.toString() == toToken;
    const { minAmountOut, amountIn } = await this.calcAmountOut(poolKeys, amount, directionIn);
    console.log({ minAmountOut, amountIn });
    const userTokenAccounts = await this.getOwnerTokenAccounts();
    const swapTransaction = await Liquidity.makeSwapInstructionSimple({
      connection: this.connection,
      makeTxVersion: useVersionedTransaction ? 0 : 1,
      poolKeys: {
        ...poolKeys,
      },
      userKeys: {
        tokenAccounts: userTokenAccounts,
        owner: this.wallet.publicKey,
      },
      amountIn: amountIn,
      amountOut: minAmountOut,
      fixedSide: fixedSide,
      config: {
        bypassAssociatedCheck: false,
      },
      computeBudgetConfig: {
        microLamports: maxLamports,
      },
    });

    const recentBlockhashForSwap = await this.connection.getLatestBlockhash();
    const instructions = swapTransaction.innerTransactions[0].instructions.filter(Boolean);

    if (useVersionedTransaction) {
      const versionedTransaction = new VersionedTransaction(
        new TransactionMessage({
          payerKey: this.wallet.publicKey,
          recentBlockhash: recentBlockhashForSwap.blockhash,
          instructions: instructions,
        }).compileToV0Message(),
      );

      versionedTransaction.sign([this.wallet.payer]);

      return versionedTransaction;
    }

    const legacyTransaction = new Transaction({
      blockhash: recentBlockhashForSwap.blockhash,
      lastValidBlockHeight: recentBlockhashForSwap.lastValidBlockHeight,
      feePayer: this.wallet.publicKey,
    });

    legacyTransaction.add(...instructions);

    return legacyTransaction;
  }

  async sendLegacyTransaction(tx: Transaction, maxRetries?: number) {
    return await this.connection.sendTransaction(tx, [this.wallet.payer], {
      skipPreflight: true,
      maxRetries: maxRetries,
    });
  }

  async sendVersionedTransaction(tx: VersionedTransaction, maxRetries?: number) {
    return await this.connection.sendTransaction(tx, {
      skipPreflight: true,
      maxRetries: maxRetries,
    });
  }

  async simulateLegacyTransaction(tx: Transaction) {
    return await this.connection.simulateTransaction(tx, [this.wallet.payer]);
  }

  async simulateVersionedTransaction(tx: VersionedTransaction) {
    return await this.connection.simulateTransaction(tx);
  }

  getTokenAccountByOwnerAndMint(mint: PublicKey) {
    return {
      programId: TOKEN_PROGRAM_ID,
      pubkey: PublicKey.default,
      accountInfo: {
        mint: mint,
        amount: 0,
      },
    } as unknown as TokenAccount;
  }

  async calcAmountOut(poolKeys: LiquidityPoolKeys, rawAmountIn: number, swapInDirection: boolean) {
    const poolInfo = await Liquidity.fetchInfo({ connection: this.connection, poolKeys });

    let currencyInMint = poolKeys.baseMint;
    let currencyInDecimals = poolInfo.baseDecimals;
    let currencyOutMint = poolKeys.quoteMint;
    let currencyOutDecimals = poolInfo.quoteDecimals;

    if (!swapInDirection) {
      currencyInMint = poolKeys.quoteMint;
      currencyInDecimals = poolInfo.quoteDecimals;
      currencyOutMint = poolKeys.baseMint;
      currencyOutDecimals = poolInfo.baseDecimals;
    }

    const currencyIn = new Token(TOKEN_PROGRAM_ID, currencyInMint, currencyInDecimals);
    const amountIn = new TokenAmount(currencyIn, rawAmountIn, false);
    const currencyOut = new Token(TOKEN_PROGRAM_ID, currencyOutMint, currencyOutDecimals);
    const slippage = new Percent(5, 100); // 5% slippage

    const { amountOut, minAmountOut, currentPrice, executionPrice, priceImpact, fee } = Liquidity.computeAmountOut({
      poolKeys,
      poolInfo,
      amountIn,
      currencyOut,
      slippage,
    });

    return {
      amountIn,
      amountOut,
      minAmountOut,
      currentPrice,
      executionPrice,
      priceImpact,
      fee,
    };
  }
}

export default RaydiumSwap;