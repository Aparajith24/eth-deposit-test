# Ethereum Deposit Tracker

## Objective

Develop a robust and efficient Ethereum Deposit Tracker to monitor and record ETH deposits on the Beacon Deposit Contract.

## Project Components

### Language/Framework

- Next.js
- MongoDB
- TypeScript
- Alchemy

### Deposit Tracking Logic

1. **Monitor Beacon Deposit Contract:**
   - Track deposits to address `0x00000000219ab540356cBB839Cbe05303d7705Fa`.

2. **Record Deposit Details:**
   - Store information such as amount, sender address, and timestamp.
   - Handle multiple deposits in a single transaction.
   - Runs every 15 second for live tracking.

### Error Handling and Logging

1. **Error Handling:**
   - Implement comprehensive error handling for API calls and RPC interactions.

2. **Logging:**
   - Add mechanisms to track errors and important events.

### Telegram Alerts

**Alerts:**
   - Send Telegram alerts for every deposit.
   - Alerts include amount, sender address, and timestamp.

## Setup and Usage

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/Aparajith24/eth-luga.git
   cd eth-deposit-tracker
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Environment Variables:**

   Create a `.env` file in the root directory and add the following environment variables:

   ```bash
   MONGODB_URI=<MongoDB URI>
   TELEGRAM_BOT_TOKEN=<Telegram Bot Token>
   BEACON_DEPOSIT_CONTRACT_ADDRESS=0x00000000219ab540356cBB839Cbe05303d7705Fa
   TELEGRAM_CHAT_ID=<Telegram Chat ID>
   ALCHEMY_API_KEY=<Alchemy API Key>
   ```

   - **MongoDB URI:** MongoDB connection string.
   - **Telegram Bot Token:** Telegram Bot token.
   - **Telegram Chat ID:** Telegram Chat ID.
   - **Alchemy API Key:** Alchemy API key.
   - **BEACON_DEPOSIT_CONTRACT_ADDRESS:** Address of the Beacon Deposit Contract.

3. **Run the Application:**

   ```bash
   npm run dev
   ```

   The application will run on port 3000.

## Docker

To Dockerize the application, use the following command:

```bash
docker build -t eth-deposit-tracker .
```

And to run it:

```bash
docker run -p 3000:3000 eth-deposit-tracker
```
