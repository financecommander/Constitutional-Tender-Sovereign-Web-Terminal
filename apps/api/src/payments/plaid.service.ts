import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  Products,
  CountryCode,
} from 'plaid';
import { PaymentProcessingException } from './exceptions/payment-processing.exception';

export interface LinkTokenResult {
  linkToken: string;
  expiration: string;
  requestId: string;
}

export interface BankAccountInfo {
  accountId: string;
  name: string;
  mask: string;
  type: string;
  subtype: string | null;
}

export interface ExchangeTokenResult {
  accessToken: string;
  itemId: string;
  accounts: BankAccountInfo[];
}

@Injectable()
export class PlaidService {
  private readonly logger = new Logger(PlaidService.name);
  private readonly client: PlaidApi;

  constructor(private readonly config: ConfigService) {
    const clientId = this.config.get<string>('PLAID_CLIENT_ID');
    const secret = this.config.get<string>('PLAID_SECRET');
    const env = this.config.get<string>('PLAID_ENV') ?? 'sandbox';

    if (!clientId || !secret) {
      throw new Error(
        'PLAID_CLIENT_ID and PLAID_SECRET environment variables are required',
      );
    }

    const envUrl =
      PlaidEnvironments[env as keyof typeof PlaidEnvironments] ??
      PlaidEnvironments.sandbox;

    const configuration = new Configuration({
      basePath: envUrl,
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': clientId,
          'PLAID-SECRET': secret,
        },
      },
    });

    this.client = new PlaidApi(configuration);
  }

  async createLinkToken(userId: string): Promise<LinkTokenResult> {
    this.logger.log(`Creating Plaid link token for user ${userId}`);

    try {
      const response = await this.client.linkTokenCreate({
        user: { client_user_id: userId },
        client_name: 'Constitutional Tender',
        products: [Products.Auth],
        country_codes: [CountryCode.Us],
        language: 'en',
      });

      this.logger.log(`Link token created for user ${userId}`);
      return {
        linkToken: response.data.link_token,
        expiration: response.data.expiration,
        requestId: response.data.request_id,
      };
    } catch (error) {
      this.logger.error(
        `Failed to create link token: ${(error as Error).message}`,
      );
      throw new PaymentProcessingException(
        `Failed to create bank link: ${(error as Error).message}`,
      );
    }
  }

  async exchangePublicToken(
    publicToken: string,
    userId: string,
  ): Promise<ExchangeTokenResult> {
    this.logger.log(`Exchanging public token for user ${userId}`);

    try {
      const exchangeResponse = await this.client.itemPublicTokenExchange({
        public_token: publicToken,
      });

      const accessToken = exchangeResponse.data.access_token;
      const itemId = exchangeResponse.data.item_id;

      // Fetch account details
      const accountsResponse = await this.client.accountsGet({
        access_token: accessToken,
      });

      const accounts: BankAccountInfo[] = accountsResponse.data.accounts.map(
        (account) => ({
          accountId: account.account_id,
          name: account.name,
          mask: account.mask ?? '',
          type: account.type,
          subtype: account.subtype ?? null,
        }),
      );

      this.logger.log(
        `Token exchanged for user ${userId}, ${accounts.length} account(s) found`,
      );

      return { accessToken, itemId, accounts };
    } catch (error) {
      this.logger.error(
        `Failed to exchange public token: ${(error as Error).message}`,
      );
      throw new PaymentProcessingException(
        `Failed to link bank account: ${(error as Error).message}`,
      );
    }
  }

  async getBankAccounts(accessToken: string): Promise<BankAccountInfo[]> {
    this.logger.log('Fetching bank accounts');

    try {
      const response = await this.client.accountsGet({
        access_token: accessToken,
      });

      return response.data.accounts.map((account) => ({
        accountId: account.account_id,
        name: account.name,
        mask: account.mask ?? '',
        type: account.type,
        subtype: account.subtype ?? null,
      }));
    } catch (error) {
      this.logger.error(
        `Failed to fetch bank accounts: ${(error as Error).message}`,
      );
      throw new PaymentProcessingException(
        `Failed to retrieve bank accounts: ${(error as Error).message}`,
      );
    }
  }
}
