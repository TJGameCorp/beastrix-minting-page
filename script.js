// Import Solana Web3.js dependencies via the browser global namespace provided by the bundle script
// Make sure the <script> tag in HTML points to the latest Solana web3.js library:
// <script src="https://unpkg.com/@solana/web3.js@latest/lib/index.iife.min.js"></script>

// Variables to store wallet connection state
let walletConnection = null;
let connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet')); // Use devnet or testnet as needed

// Reference to the Connect Wallet button
const connectWalletButton = document.getElementById('connect-wallet-btn');

// Event listener for the Connect Wallet button
connectWalletButton.addEventListener('click', async () => {
    // Check if the Phantom wallet is installed
    if (window.solana && window.solana.isPhantom) {
        try {
            // Connect to Phantom wallet
            const response = await window.solana.connect();
            console.log('Wallet connected:', response.publicKey.toString());
            walletConnection = response.publicKey.toString();  // Store the wallet public key

            // Notify the user that the wallet is connected
            alert(`Connected to wallet: ${walletConnection}`);
        } catch (err) {
            console.error('Error connecting to wallet:', err);
        }
    } else {
        alert('Solana wallet not found! Please install Phantom Wallet.');
    }
});

// Mint button event listener
document.getElementById('mint-btn').addEventListener('click', async () => {
    // Check if the wallet is connected
    if (!walletConnection) {
        alert("Please connect your wallet first.");
        return;
    }

    // Minting logic (mocked for now)
    mintBeast();
});

// Mint Beast function
function mintBeast() {
    // Add a new minted beast to the inventory list
    const beastList = document.getElementById('beast-list');
    const newBeast = document.createElement('img');
    newBeast.src = 'images/minted_beast1.png';  // Placeholder beast image
    newBeast.alt = 'Minted Beast';
    beastList.appendChild(newBeast);

    alert('Beast minted successfully!');
}

// Example transaction: Create and send a basic Solana transaction
async function sendTransaction() {
    if (!walletConnection) {
        alert("Please connect your wallet first.");
        return;
    }

    try {
        // Generate a new keypair for the recipient
        let recipientKeypair = solanaWeb3.Keypair.generate();

        // Create a transaction to transfer 0.01 SOL from the connected wallet
        let transaction = new solanaWeb3.Transaction().add(
            solanaWeb3.SystemProgram.transfer({
                fromPubkey: walletConnection,  // Sender's public key
                toPubkey: recipientKeypair.publicKey,  // Recipient's public key
                lamports: solanaWeb3.LAMPORTS_PER_SOL * 0.01,  // 0.01 SOL
            })
        );

        // Sign the transaction using Phantom wallet
        let { signature } = await window.solana.signAndSendTransaction(transaction);

        // Confirm the transaction
        await connection.confirmTransaction(signature);

        alert('Transaction successful! Signature: ' + signature);
    } catch (error) {
        console.error('Transaction failed:', error);
        alert('Transaction failed!');
    }
}

// Solana Airdrop Example (Devnet only)
// Airdrops SOL to the connected wallet (only works on devnet)
async function requestAirdrop() {
    if (!walletConnection) {
        alert("Please connect your wallet first.");
        return;
    }

    try {
        // Request 1 SOL airdrop on devnet
        let airdropSignature = await connection.requestAirdrop(
            new solanaWeb3.PublicKey(walletConnection),
            solanaWeb3.LAMPORTS_PER_SOL
        );

        // Confirm the transaction
        await connection.confirmTransaction(airdropSignature);

        alert('Airdrop successful! 1 SOL credited.');
    } catch (error) {
        console.error('Airdrop failed:', error);
        alert('Airdrop failed!');
    }
}
