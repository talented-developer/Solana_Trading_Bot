import BN from 'bn.js';
export interface Metadata {
    model: string;
    updateAuthorityAddress: string;
    json: MetadataJson;
    jsonLoaded: boolean;
    name: string;
    symbol: string;
    uri: string;
    isMutable: boolean;
    primarySaleHappened: boolean;
    sellerFeeBasisPoints: number;
    editionNonce: number;
    creators: Creator[];
    tokenStandard: number;
    collection: Collection | null;
    collectionDetails: CollectionDetails | null;
    uses: Uses | null;
    programmableConfig: ProgrammableConfig | null;
    address: string;
    metadataAddress: string;
    mint: Mint;
    marketCap?: number;
    liquidity?: number;
    liquidityLock?: number;
    top10OwnershipPercentage?: number;
    numberOfHolders?: number;
    devWalletValue?: number;
    pricePerToken?: number;
    tokenAge?: string;
    priceChange?: string;
    creatorPercentage?: number;
}
export interface PublicKeyWrapper {
    _bn: BN;
}
export interface MetadataJson {
    name: string;
    symbol: string;
    description: string;
    image: string;
    showName: boolean;
    createdOn: string;
    twitter?: string;
    telegram?: string;
    website?: string;
}
export interface Creator {
    address: string;
    verified: boolean;
    share: number;
}
export interface Collection {
    verified: boolean;
    key: string;
}
export interface CollectionDetails {
    version: string;
    size: number;
}
export interface Uses {
    useMethod: string;
    remaining: number;
    total: number;
}
export interface ProgrammableConfig {
    ruleSet: string;
}
export interface PdaWrapper {
    _bn: BN;
    bump: number;
}
export interface Mint {
    model: string;
    address: string;
    mintAuthorityAddress: string | null;
    freezeAuthorityAddress: string | null;
    decimals: number;
    supply: Supply;
    isWrappedSol: boolean;
    currency: Currency;
}
export interface Supply {
    basisPoints: string;
    currency: Currency;
}
export interface Currency {
    symbol: string;
    decimals: number;
    namespace: string;
}
