import { ConfirmedSignatureInfo, Connection, PublicKey } from '@solana/web3.js';
import { Network, ShyftSdk, TransactionHistory } from '@shyft-to/js';
import { SwapDetailsDTO } from '../../../shared/types/swap-details';
import dotenv from 'dotenv';
import moment from 'moment';


dotenv.config();
const { SHYFT_API_KEY } = process.env;
const connection = new Connection('https://api.mainnet-beta.solana.com', { commitment: 'confirmed' });
const shyftSdk = new ShyftSdk({ apiKey: SHYFT_API_KEY, network: Network.Mainnet });

export const paginateSignaturesTillTime = async (address: PublicKey, until: number, sigLimit: number = 10000): Promise<ConfirmedSignatureInfo[]> => {
  let sigLimitForRequest = 1000;

  if (sigLimit < 1000) {
    sigLimitForRequest = sigLimit;
  }
  const initialSignatures = await getSignaturesForAddress(address, sigLimitForRequest);
  let signaturesToReturn = [];
  if (initialSignatures && initialSignatures.length > 0) {
    let oldestTime = initialSignatures[initialSignatures.length - 1].blockTime;
    signaturesToReturn = initialSignatures.filter((sig) => sig.blockTime > until);
    await displaySignatures(signaturesToReturn);
    let count = 0;

    while (oldestTime > until) {
      const newSignatures = await getSignaturesForAddress(address);
      console.log('requesting for more pages.... count: ', ++count, ' length: ', signaturesToReturn.length, 'latest timestamp: ', formatUnixBlockTime(newSignatures[newSignatures.length - 1].blockTime));
      if (newSignatures.length === 0 || signaturesToReturn.length >= sigLimit) break;
      signaturesToReturn = signaturesToReturn.concat(newSignatures);
    }

    return signaturesToReturn;
  } else {
    console.log('No signatures found.');
    return signaturesToReturn;
  }
};
const displaySignatures = async (signatures: ConfirmedSignatureInfo[], limit = 3) => {

  if (signatures.length === 0) {
    console.log('No signatures found.');
    return;
  }

  // Filter out undefined entries
  const filteredSignatures = signatures.filter((tx) => tx !== undefined);

  // Map the filtered entries to the desired format
  const txHistory = filteredSignatures.map((tx) => ({
    time: moment.unix(tx.blockTime).format('YYYY-MM-DD HH:mm:ss'),
    signature: tx.signature,
    confirmationStatus: tx.confirmationStatus,
  }));

  // Log the transaction history
  console.log('Transaction History first 10:', txHistory.slice(0, limit));

  // Get the oldest and newest transaction times or handle empty arrays gracefully
  const oldest = txHistory.length > 0 ? txHistory[txHistory.length - 1].time : undefined;
  const newest = txHistory.length > 0 ? txHistory[0].time : undefined;

  console.log('oldest:', oldest);
  console.log('newest:', newest);
};
export const getSignaturesForAddress = async (walletAddress, limit = 1000, before?, until?) => {
  const pubkey = new PublicKey(walletAddress);
  const options = before && until ? { before, until } : { limit };
  const transactionHistory = await connection.getSignaturesForAddress(pubkey, options);
  return transactionHistory;
};
const parseSwapDetailsFromActions = async (actions, swapDetails): Promise<SwapDetailsDTO> => {
  actions.forEach((action) => {
    if (action.type === 'SWAP' && action.info.tokens_swapped) {

      const { swaps } = action.info;
      swapDetails.sellToken = {
        tokenAddress: swaps[0].in.token_address,
        amount: swaps[0].in.amount_raw,
        symbol: swaps[0].in.symbol,
      };
      swapDetails.buyToken = {
        tokenAddress: swaps[0].out.token_address,
        amount: swaps[0].out.amount_raw,
        symbol: swaps[0].out.symbol,
      };
    }
  });

  return swapDetails;
};
const outputActionDetails = (actions: string[]) => {
  const actionCounts = actions.reduce((acc, action) => {
    acc[action] = (acc[action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('Action types with counts:', actionCounts);
};
const outputTimeFromSwapDetails = (swapDetails: SwapDetailsDTO[]) => {
  const times = swapDetails.map((swap) => swap.timestamp);
  const oldest = times.length > 0 ? times[times.length - 1] : undefined;
  const newest = times.length > 0 ? times[0] : undefined;
  console.log('oldest:', oldest);
  console.log('newest:', newest);
  const timeCounts = times.reduce((acc, time) => {
    acc[time] = (acc[time] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);
  console.log('Time counts:', timeCounts);
};
const formatUnixBlockTime = (time) => {
  return moment.unix(time).format('YYYY-MM-DD HH:mm:ss');
};
const getSwapDetailsStartAndEndSignatures = async (sigStart: string, sigEnd: string, account: string): Promise<SwapDetailsDTO[]> => {
  let swapDetailsArr: SwapDetailsDTO[] = [];
  const transactions: TransactionHistory = await shyftSdk.transaction.history({
    account: account,
    beforeTxSignature: sigStart,
    untilTxSignature: sigEnd,
    enableRaw: false,
    enableEvents: false,
  });
  console.log('Transactions length:', transactions.length);
  let actions = [];
  await Promise.all(
    transactions.map(async (transaction) => {
      let swapDetails: SwapDetailsDTO = {
        signatures: transaction.signatures,
        signers: transaction.signers,
        timestamp: Number(transaction.timestamp),
      };
      swapDetails = await parseSwapDetailsFromActions(transaction.actions, swapDetails);
      actions.concat(transaction.actions.map((action) => action.type));
      swapDetails.buyToken && swapDetails.sellToken && swapDetailsArr.push(swapDetails);
    }),
  );
  outputActionDetails(actions);
  console.log('Swap Details array: ', swapDetailsArr);

  return swapDetailsArr;
};
const paginateSwapDetailsFromSignatures = async (signatures: string[]) => {
  let swapDetailsArr: SwapDetailsDTO[] = [];
  let actions = [];
  // paginate every 100 signatures
  for (let i = 0; i < signatures.length; i += 100) {
    const sigs = signatures.slice(i, i + 100);
    const swapDetails = await getSwapDetailsFromSignatures(sigs, actions);
    swapDetailsArr = swapDetailsArr.concat(swapDetails);
  }

  outputActionDetails(actions);

  return swapDetailsArr;
};
function convertIsoToUnix(dateString: string): number {
  const date = new Date(dateString);
  const unixEpoch = date.getTime() / 1000;
  return unixEpoch;
}
const getSwapDetailsFromSignatures = async (signatures: string[], actions: string[] = []): Promise<SwapDetailsDTO[]> => {
  let swapDetailsArr: SwapDetailsDTO[] = [];
  const transactions = await shyftSdk.transaction.parseSelected({ transactionSignatues: signatures });

  await Promise.all(
    transactions.map(async (transaction) => {
      let swapDetails: SwapDetailsDTO = {
        signatures: transaction.signatures,
        signers: transaction.signers,
        timestamp: convertIsoToUnix(transaction.timestamp),
        timestampISO: transaction.timestamp,
      };
      swapDetails = await parseSwapDetailsFromActions(transaction.actions, swapDetails);
      swapDetails.buyToken && swapDetails.sellToken && swapDetailsArr.push(swapDetails);
      actions.push(...transaction.actions.map((action) => action.type));
    }),
  );

  // console.log('Swap Details array: ', swapDetailsArr);
  return swapDetailsArr;
};
export const getSwapDetailsWithLimit = async (publicKey, limit = 10) => {
  const signatures = (await getSignaturesForAddress(publicKey, limit)).map((sig) => sig.signature);
  console.log('Signatures: ', signatures.length);
  const swapDetails: SwapDetailsDTO [] = await getSwapDetailsFromSignatures(signatures);
  console.log('swapDetails: ', swapDetails.length);
  return swapDetails;
};
export const getSwapDetailsUntilTime = async (address: PublicKey, until: number, sigLimit: number = 10000) => {
  const signatures = (await paginateSignaturesTillTime(address, until, sigLimit)).map((sig) => sig.signature);
  console.log('Signatures: ', signatures.length);
  const swapDetails: SwapDetailsDTO [] = await paginateSwapDetailsFromSignatures(signatures);
  console.log('swapDetails: ', swapDetails.length);
  // outputTimeFromSwapDetails(swapDetails);

  return swapDetails;
};
export const getSwapDetailsFromOneMinute = async (address: PublicKey, sigLimit: number = 10000) => {
  const until = parseInt((Date.now() / 1000 - 60).toPrecision(10));
  return getSwapDetailsUntilTime(address, until, sigLimit);
};
export const getSwapDetailsFromFiveMinutes = async (address: PublicKey, sigLimit: number = 10000) => {
  const until = parseInt((Date.now() / 1000 - 300).toPrecision(10));
  return getSwapDetailsUntilTime(address, until, sigLimit);
};
export const getSwapDetailsFromOneHour = async (address: PublicKey, sigLimit: number = 10000) => {
  const until = parseInt((Date.now() / 1000 - 3600).toPrecision(10));
  return getSwapDetailsUntilTime(address, until, sigLimit);
};
export const getSwapDetailsFromSixHours = async (address: PublicKey, sigLimit: number = 10000) => {
  const until = parseInt((Date.now() / 1000 - 21600).toPrecision(10));
  return getSwapDetailsUntilTime(address, until, sigLimit);
};
export const getSwapDetailsFromTwelveHours = async (address: PublicKey, sigLimit: number = 10000) => {
  const until = parseInt((Date.now() / 1000 - 43200).toPrecision(10));
  return getSwapDetailsUntilTime(address, until, sigLimit);
};
export const getSwapDetailsFromOneDay = async (address: PublicKey, sigLimit: number = 10000) => {
  const until = parseInt((Date.now() / 1000 - 86400).toPrecision(10));
  return getSwapDetailsUntilTime(address, until, sigLimit);
};
export const getSwapDetailsBetweenSignatures = async (account: string) => {
  const signatures = await getSignaturesForAddress(account, 3);
  console.log('Signatures: ', signatures.length);
  const startSig = signatures[signatures.length - 1].signature;
  const endSig = signatures[0].signature;
  const swapDetails = await getSwapDetailsStartAndEndSignatures(startSig, endSig, account);
  console.log('swapDetails: ', swapDetails.length);

  return swapDetails;
};

// const startTime = new Date('2024-07-31T00:00:00Z').getTime() / 1000; // Start time in seconds
// const endTime = new Date('2024-08-1T23:59:59Z').getTime() / 1000; // End time in seconds

// const DOG_WIF_HAT='EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm';
// const BILLY='3B5wuUrMEi5yATD7on46hKfej3pfmd7t1RKgrsN3pump';
// const DOG_WIF_HAT_HODDLER='Fd48hVrg4QQznwi8eCJjCfNsbnSxb1ty5rJ5xvSMCXXr';
// const customWallet= '4qWht7gPqJSZtXkKFPG2F1SiU3rF9mLyGGkBpc65x89A';

// const publicKey = new PublicKey(customWallet);

// paginateTill 5mins from now
// const until = parseInt((Date.now() / 1000 - (3600 * 10)).toPrecision(10));

//================================================================================
// const until = moment().subtract(1, 'day').unix();
// const until = moment(untilTimestamp, "YYYY-MM-DD HH:mm:ss").unix();
// console.log('Until:', until, moment.unix(until).format("YYYY-MM-DD HH:mm:ss"), 'now: ', moment().format("YYYY-MM-DD HH:mm:ss"));
// paginateSignaturesTillTime(publicKey, until);
// getSwapDetailsUntilTime(publicKey,until,100);

//================================================================================
// const signatures = getSignaturesForAddress(publicKey, 1000);
// console.log('Signatures:', signatures);
// const swapDetails = getSwapDetails(publicKey, 20);
// fetchSignaturesBetweenTimespan(publicKey, startTime, endTime)
//   .then(signatures => {
//     console.log('Signatures between timespan:', signatures);
//   })
//   .catch(error => {
//     console.error('Error fetching signatures:', error);
//   });