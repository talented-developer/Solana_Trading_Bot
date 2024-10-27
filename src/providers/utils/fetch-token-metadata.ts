import { Metaplex } from '@metaplex-foundation/js';
import { ENV, TokenListProvider } from '@solana/spl-token-registry';
import { Connection, PublicKey } from '@solana/web3.js';
import { Metadata } from '@shared/types/metadata';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TokenMetadataService {
  private readonly logger = new Logger(this.constructor.name);
  private readonly connection: Connection;
  private readonly metaplex: Metaplex;

  constructor() {
    this.connection = new Connection('https://mainnet.helius-rpc.com/?api-key=3811576d-00d2-435a-8535-51c8b4aaeae3');
    this.metaplex = Metaplex.make(this.connection);
  }

  async fetchTokenMetadata(mintAddressPublicKeyStr: string): Promise<Metadata | null> {
    try {
      const mintAddress = new PublicKey(mintAddressPublicKeyStr);
      const metadataPda = this.metaplex.nfts().pdas().metadata({ mint: mintAddress });
      const metadataAccountInfo = await this.connection.getAccountInfo(metadataPda);

      if (metadataAccountInfo) {
        const tokenData = await this.metaplex.nfts().findByMint({ mintAddress });
        return this.processTokenData(tokenData, mintAddress, metadataPda, metadataAccountInfo);
      } else {
        const provider = await new TokenListProvider().resolve();
        const tokenList = provider.filterByChainId(ENV.MainnetBeta).getList();
        const tokenData = tokenList.find(item => item.address === mintAddress.toBase58());
        if (tokenData) {
          return this.processTokenData(tokenData, mintAddress, metadataPda, null);
        }
      }

      this.logger.warn(`No metadata found for mint address: ${mintAddressPublicKeyStr}`);
      return null;
    } catch (error) {
      this.logger.error(`Error fetching token metadata for ${mintAddressPublicKeyStr}: ${error.message}`);
    }
  }

  private processTokenData(
    tokenData: any,
    mintAddress: PublicKey,
    metadataPda: PublicKey,
    metadataAccountInfo: any,
  ): Metadata {
    const twitter = tokenData?.twitter ? `<a href="${tokenData.twitter}">Twitter</a>` : '';
    const telegram = tokenData?.telegram ? `<a href="${tokenData.telegram}">Telegram</a>` : '';
    const website = tokenData?.website ? `<a href="${tokenData.website}">Website</a>` : '';
    const image = tokenData?.uri || '#';
    const mintAuthorityAddress = tokenData?.mint?.mintAuthorityAddress
      ? this.validateAndCreatePublicKey(tokenData.mint.mintAuthorityAddress)
      : null;
    const freezeAuthorityAddress = tokenData?.mint?.freezeAuthorityAddress
      ? this.validateAndCreatePublicKey(tokenData.mint.freezeAuthorityAddress)
      : null;

    const supply = tokenData?.mint?.supply || {
      basisPoints: '0',
      currency: {
        symbol: '',
        decimals: 0,
        namespace: '',
      },
    };

    return {
      model: tokenData?.model || 'token',
      updateAuthorityAddress: metadataAccountInfo && metadataAccountInfo.data.length >= 33
        ? new PublicKey(metadataAccountInfo.data.slice(1, 33)).toBase58()
        : 'Not Found',
      json: {
        name: tokenData?.name || '',
        symbol: tokenData?.symbol || '',
        description: tokenData?.json?.description || 'Not Found',
        image,
        showName: tokenData?.json?.showName ?? true,
        createdOn: tokenData?.json?.createdOn || '',
        twitter,
        telegram,
        website,
      },
      jsonLoaded: !!tokenData?.json,
      name: tokenData?.name || '',
      symbol: tokenData?.symbol || '',
      uri: tokenData?.uri || '',
      isMutable: tokenData?.isMutable || false,
      primarySaleHappened: tokenData?.primarySaleHappened || false,
      sellerFeeBasisPoints: tokenData?.sellerFeeBasisPoints || 0,
      editionNonce: tokenData?.editionNonce || 255,
      creators: (tokenData?.creators || []).map(creator => ({
        address: new PublicKey(creator.address).toBase58(),
        verified: creator.verified,
        share: creator.share,
      })),
      tokenStandard: tokenData?.tokenStandard || 2,
      collection: tokenData?.collection || null,
      collectionDetails: tokenData?.collectionDetails || null,
      uses: tokenData?.uses || null,
      programmableConfig: tokenData?.programmableConfig || null,
      address: mintAddress.toBase58(),
      metadataAddress: metadataPda.toBase58(),
      mint: {
        model: tokenData?.mint?.model || 'mint',
        address: mintAddress.toBase58(),
        mintAuthorityAddress,
        freezeAuthorityAddress,
        decimals: tokenData?.mint?.decimals || 6,
        supply: {
          basisPoints: supply.basisPoints || '0',
          currency: {
            symbol: supply.currency?.symbol || '',
            decimals: supply.currency?.decimals || 0,
            namespace: supply.currency?.namespace || '',
          },
        },
        isWrappedSol: tokenData?.mint?.isWrappedSol || false,
        currency: {
          symbol: tokenData?.mint?.currency?.symbol || '',
          decimals: tokenData?.mint?.currency?.decimals || 0,
          namespace: tokenData?.mint?.currency?.namespace || '',
        },
      },
    };
  }

  private validateAndCreatePublicKey(key: any): string | null {
    try {
      const publicKey = new PublicKey(key);
      if (PublicKey.isOnCurve(publicKey.toBuffer())) {
        return publicKey.toBase58();
      }
    } catch (error) {
      this.logger.warn('Invalid PublicKey:', key);
    }
    return null;
  }
}