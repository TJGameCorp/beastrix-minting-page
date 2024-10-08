import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplBubblegum } from "@metaplex-foundation/mpl-bubblegum";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import {
  mintToCollectionV1,
  parseLeafFromMintToCollectionV1Transaction,
  findLeafAssetIdPda,
} from "@metaplex-foundation/mpl-bubblegum";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import {
  publicKey,
  keypairIdentity,
  createSignerFromKeypair,
} from "@metaplex-foundation/umi";
import { sol } from "@metaplex-foundation/umi";
import {
  MERKLE_TREE_ADDRESS,
  COLLECTION_MINT_ADDRESS,
  ADMIN_PRIVATE_KEY,
} from "./constants";

// Add this function at the top of your file
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function initializeUmi(wallet) {
  const umi = createUmi("https://rpc.test.honeycombprotocol.com/")
    .use(mplBubblegum())
    .use(mplTokenMetadata())
    .use(walletAdapterIdentity(wallet));
  return umi;
}

export async function mintRandomBeast(umi, leafOwner) {
  console.log("Starting mintRandomBeast function");
  console.log("Leaf owner:", leafOwner.toString());

  // Check leafOwner balance
  const leafOwnerBalance = await umi.rpc.getBalance(leafOwner);
  console.log(
    "Leaf owner balance:",
    leafOwnerBalance.basisPoints.toString(),
    "lamports"
  );

  if (leafOwnerBalance.basisPoints.toString() === "0") {
    console.log("Leaf owner balance is zero. Requesting airdrop...");
    await umi.rpc.airdrop(leafOwner, sol(1));
    console.log(
      "Airdrop completed. New balance:",
      (await umi.rpc.getBalance(leafOwner)).basisPoints.toString(),
      "lamports"
    );

    // Add a delay after airdrop
    await sleep(5000); // Wait for 5 seconds
  } else {
    console.log("Leaf owner has sufficient balance.");
  }

  const adminKeypair = umi.eddsa.createKeypairFromSecretKey(
    new Uint8Array(ADMIN_PRIVATE_KEY)
  );
  const adminSigner = createSignerFromKeypair(umi, adminKeypair);

  // Check balance and airdrop if needed
  const balance = await umi.rpc.getBalance(adminKeypair.publicKey);
  console.log("Admin balance:", balance.basisPoints.toString(), "lamports");

  if (balance.basisPoints.toString() === "0") {
    console.log("Balance is zero. Requesting airdrop...");
    await umi.rpc.airdrop(adminKeypair.publicKey, sol(1));
    console.log(
      "Airdrop completed. New balance:",
      (await umi.rpc.getBalance(adminKeypair.publicKey)).basisPoints.toString(),
      "lamports"
    );
  } else {
    console.log("Sufficient balance. No airdrop needed.");
  }

  const randomBeastNumber = Math.floor(Math.random() * 10000) + 1;
  const beastUri = `https://beastrix.s3.amazonaws.com/beast-json/${randomBeastNumber
    .toString()
    .padStart(4, "0")}.json`;
  console.log("Random beast number:", randomBeastNumber);
  console.log("Beast URI:", beastUri);

  try {
    console.log("Attempting to mint beast...");
    const { signature } = await mintToCollectionV1(umi, {
      leafOwner,
      merkleTree: publicKey(MERKLE_TREE_ADDRESS),
      collectionMint: publicKey(COLLECTION_MINT_ADDRESS),
      collectionAuthority: adminSigner,
      metadata: {
        name: `Beast #${randomBeastNumber}`,
        uri: beastUri,
        sellerFeeBasisPoints: 500,
        collection: {
          key: publicKey(COLLECTION_MINT_ADDRESS),
          verified: false,
        },
        creators: [
          { address: adminKeypair.publicKey, verified: false, share: 100 },
        ],
      },
    }).sendAndConfirm(umi);
    console.log("Minting successful. Signature:", signature);

    console.log("Waiting for transaction to be confirmed...");
    let transaction = null;
    let retries = 5;
    while (retries > 0 && !transaction) {
      await sleep(3000); // Wait for 3 seconds
      console.log(`Fetching transaction... (${6 - retries}/5)`);
      transaction = await umi.rpc.getTransaction(signature);
      retries--;
    }

    if (transaction) {
      console.log("Transaction found:", transaction);
      console.log("Parsing leaf from transaction...");
      try {
        const leaf = await parseLeafFromMintToCollectionV1Transaction(
          umi,
          signature
        );
        console.log("Leaf parsed:", leaf);

        console.log("Finding asset ID...");
        const assetId = findLeafAssetIdPda(umi, {
          merkleTree: publicKey(MERKLE_TREE_ADDRESS),
          leafIndex: leaf.nonce,
        });
        console.log("Asset ID found:", assetId.toString());

        return { assetId, randomBeastNumber };
      } catch (parseError) {
        console.error("Error parsing leaf:", parseError);
        // Return partial information if leaf parsing fails
        return { signature, randomBeastNumber };
      }
    } else {
      console.error("Transaction not found after multiple attempts");
      return { signature, randomBeastNumber };
    }
  } catch (error) {
    console.error("Error minting beast:", error);
    if (error.logs) {
      console.error("Full error logs:", error.logs);
    }
    throw error;
  }
}

export async function fetchUserNFTs(umi, owner) {
  try {
    const rpcAssetList = await umi.rpc.getAssetsByOwner({ owner });

    // Fetch metadata for each NFT
    const nftsWithMetadata = await Promise.all(
      rpcAssetList.items.map(async (asset) => {
        const response = await fetch(asset.content.json_uri);
        const metadata = await response.json();
        return {
          ...asset,
          metadata,
        };
      })
    );

    return nftsWithMetadata;
  } catch (error) {
    console.error("Error fetching user NFTs:", error);
    throw error;
  }
}
