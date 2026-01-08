import { ConnectorConfig, DataConnect, OperationOptions, ExecuteOperationResponse } from 'firebase-admin/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;


export interface AddNewLoanApplicationData {
  loanApplication_insert: LoanApplication_Key;
}

export interface AddNewLoanApplicationVariables {
  loanTypeId: UUIDString;
  userId: UUIDString;
  applicationDate: DateString;
  applicationId: string;
  requestedAmount: number;
  status: string;
}

export interface Document_Key {
  id: UUIDString;
  __typename?: 'Document_Key';
}

export interface FinancialInfo_Key {
  id: UUIDString;
  __typename?: 'FinancialInfo_Key';
}

export interface GetLoanApplicationsForUserData {
  loanApplications: ({
    id: UUIDString;
    applicationId: string;
    status: string;
    requestedAmount: number;
  } & LoanApplication_Key)[];
}

export interface GetLoanApplicationsForUserVariables {
  userId: UUIDString;
}

export interface ListLoanTypesData {
  loanTypes: ({
    id: UUIDString;
    name: string;
    description: string;
    maxAmount?: number | null;
    interestRateRange?: string | null;
  } & LoanType_Key)[];
}

export interface LoanApplication_Key {
  id: UUIDString;
  __typename?: 'LoanApplication_Key';
}

export interface LoanType_Key {
  id: UUIDString;
  __typename?: 'LoanType_Key';
}

export interface UpdateLoanApplicationStatusData {
  loanApplication_update?: LoanApplication_Key | null;
}

export interface UpdateLoanApplicationStatusVariables {
  id: UUIDString;
  status: string;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

/** Generated Node Admin SDK operation action function for the 'AddNewLoanApplication' Mutation. Allow users to execute without passing in DataConnect. */
export function addNewLoanApplication(dc: DataConnect, vars: AddNewLoanApplicationVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<AddNewLoanApplicationData>>;
/** Generated Node Admin SDK operation action function for the 'AddNewLoanApplication' Mutation. Allow users to pass in custom DataConnect instances. */
export function addNewLoanApplication(vars: AddNewLoanApplicationVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<AddNewLoanApplicationData>>;

/** Generated Node Admin SDK operation action function for the 'GetLoanApplicationsForUser' Query. Allow users to execute without passing in DataConnect. */
export function getLoanApplicationsForUser(dc: DataConnect, vars: GetLoanApplicationsForUserVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetLoanApplicationsForUserData>>;
/** Generated Node Admin SDK operation action function for the 'GetLoanApplicationsForUser' Query. Allow users to pass in custom DataConnect instances. */
export function getLoanApplicationsForUser(vars: GetLoanApplicationsForUserVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetLoanApplicationsForUserData>>;

/** Generated Node Admin SDK operation action function for the 'UpdateLoanApplicationStatus' Mutation. Allow users to execute without passing in DataConnect. */
export function updateLoanApplicationStatus(dc: DataConnect, vars: UpdateLoanApplicationStatusVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateLoanApplicationStatusData>>;
/** Generated Node Admin SDK operation action function for the 'UpdateLoanApplicationStatus' Mutation. Allow users to pass in custom DataConnect instances. */
export function updateLoanApplicationStatus(vars: UpdateLoanApplicationStatusVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateLoanApplicationStatusData>>;

/** Generated Node Admin SDK operation action function for the 'ListLoanTypes' Query. Allow users to execute without passing in DataConnect. */
export function listLoanTypes(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListLoanTypesData>>;
/** Generated Node Admin SDK operation action function for the 'ListLoanTypes' Query. Allow users to pass in custom DataConnect instances. */
export function listLoanTypes(options?: OperationOptions): Promise<ExecuteOperationResponse<ListLoanTypesData>>;

