import {
  CognitoUserPool,
  CognitoUser,
  CognitoUserAttribute,
  AuthenticationDetails,
  CognitoUserSession,
  type ISignUpResult
} from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || '',
  ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '',
  Region: import.meta.env.VITE_COGNITO_REGION || 'ap-southeast-2',
};

const userPool = new CognitoUserPool(poolData);

export interface AuthUser {
  username: string;
  email: string;
  token: string;
}

export class CognitoService {
  static signUp(email: string, password: string): Promise<ISignUpResult> {
    return new Promise((resolve, reject) => {
      const attributeList = [
        new CognitoUserAttribute({
          Name: 'email',
          Value: email,
        }),
      ];

      userPool.signUp(email, password, attributeList, [], (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result!);
      });
    });
  }

  static confirmSignUp(email: string, confirmationCode: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.confirmRegistration(confirmationCode, true, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result!);
      });
    });
  }

  static signIn(email: string, password: string): Promise<CognitoUserSession> {
    return new Promise((resolve, reject) => {
      const authenticationDetails = new AuthenticationDetails({
        Username: email,
        Password: password,
      });

      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (session: CognitoUserSession) => {
          resolve(session);
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  }

  static getCurrentUser(): CognitoUser | null {
    return userPool.getCurrentUser();
  }

  static getCurrentSession(): Promise<CognitoUserSession> {
    return new Promise((resolve, reject) => {
      const cognitoUser = this.getCurrentUser();
      if (!cognitoUser) {
        reject(new Error('No current user'));
        return;
      }

      cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
        if (err) {
          reject(err);
          return;
        }
        if (!session || !session.isValid()) {
          reject(new Error('Invalid session'));
          return;
        }
        resolve(session);
      });
    });
  }

  static signOut(): Promise<void> {
    return new Promise((resolve) => {
      const cognitoUser = this.getCurrentUser();
      if (cognitoUser) {
        cognitoUser.signOut(() => {
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  static async getAuthenticatedUser(): Promise<AuthUser | null> {
    try {
      const session = await this.getCurrentSession();
      const cognitoUser = this.getCurrentUser();
      
      if (!cognitoUser) {
        return null;
      }

      return {
        username: cognitoUser.getUsername(),
        email: session.getIdToken().payload.email || '',
        token: session.getIdToken().getJwtToken(),
      };
    } catch (error) {
      return null;
    }
  }

  static resendConfirmationCode(email: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.resendConfirmationCode((err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result!);
      });
    });
  }
} 