/**
 * SafeMate Amplify Configuration
 * Updated for User Pool v3 with correct Client ID
 */

export const hederaConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'ap-southeast-2_a2rtp64JW',
      userPoolClientId: '4uccg6ujupphhovt1utv3i67a7',
      loginWith: {
        email: true,
        username: false,
        phone: false,
      },
      signUpVerificationMethod: 'code',
      userAttributes: {
        email: {
          required: true,
        },
        given_name: {
          required: true,
        },
        family_name: {
          required: true,
        },
      },
      allowGuestAccess: false,
    },
  },
  API: {
    REST: {
      hedera: {
        endpoint: 'https://uvk4xxwjyg.execute-api.ap-southeast-2.amazonaws.com/preprod',
        region: 'ap-southeast-2',
      },
    },
  },
  Storage: {
    S3: {
      bucket: 'preprod-safemate-static-hosting',
      region: 'ap-southeast-2',
    },
  },
};

export const hederaNetwork = 'testnet';
export const hederaMirrorNodeUrl = 'https://testnet.mirrornode.hedera.com';
export const hederaExplorerUrl = 'https://hashscan.io/testnet';
