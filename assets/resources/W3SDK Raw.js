import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";

function complete(appId, userToken, encryptionKey, challengeId) {
  const sdk = new W3SSdk();

  sdk.setAppSettings({ appId });
  sdk.setAuthentication({ userToken, encryptionKey });

  sdk.execute(challengeId, (error, result) => {
    if (error) {
      console.log(`${error?.code?.toString() || "Unknown code"}: ${error?.message ?? "Error!"}`);
      return;
    }

    console.log(`Challenge: ${result.type}`);
    console.log(`status: ${result.status}`);

    if (result.data) {
      console.log(`signature: ${result.data?.signature}`);
    }
  });
}

export { complete };
