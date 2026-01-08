import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

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

interface AddNewLoanApplicationRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddNewLoanApplicationVariables): MutationRef<AddNewLoanApplicationData, AddNewLoanApplicationVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AddNewLoanApplicationVariables): MutationRef<AddNewLoanApplicationData, AddNewLoanApplicationVariables>;
  operationName: string;
}
export const addNewLoanApplicationRef: AddNewLoanApplicationRef;

export function addNewLoanApplication(vars: AddNewLoanApplicationVariables): MutationPromise<AddNewLoanApplicationData, AddNewLoanApplicationVariables>;
export function addNewLoanApplication(dc: DataConnect, vars: AddNewLoanApplicationVariables): MutationPromise<AddNewLoanApplicationData, AddNewLoanApplicationVariables>;

interface GetLoanApplicationsForUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetLoanApplicationsForUserVariables): QueryRef<GetLoanApplicationsForUserData, GetLoanApplicationsForUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetLoanApplicationsForUserVariables): QueryRef<GetLoanApplicationsForUserData, GetLoanApplicationsForUserVariables>;
  operationName: string;
}
export const getLoanApplicationsForUserRef: GetLoanApplicationsForUserRef;

export function getLoanApplicationsForUser(vars: GetLoanApplicationsForUserVariables): QueryPromise<GetLoanApplicationsForUserData, GetLoanApplicationsForUserVariables>;
export function getLoanApplicationsForUser(dc: DataConnect, vars: GetLoanApplicationsForUserVariables): QueryPromise<GetLoanApplicationsForUserData, GetLoanApplicationsForUserVariables>;

interface UpdateLoanApplicationStatusRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateLoanApplicationStatusVariables): MutationRef<UpdateLoanApplicationStatusData, UpdateLoanApplicationStatusVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateLoanApplicationStatusVariables): MutationRef<UpdateLoanApplicationStatusData, UpdateLoanApplicationStatusVariables>;
  operationName: string;
}
export const updateLoanApplicationStatusRef: UpdateLoanApplicationStatusRef;

export function updateLoanApplicationStatus(vars: UpdateLoanApplicationStatusVariables): MutationPromise<UpdateLoanApplicationStatusData, UpdateLoanApplicationStatusVariables>;
export function updateLoanApplicationStatus(dc: DataConnect, vars: UpdateLoanApplicationStatusVariables): MutationPromise<UpdateLoanApplicationStatusData, UpdateLoanApplicationStatusVariables>;

interface ListLoanTypesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListLoanTypesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListLoanTypesData, undefined>;
  operationName: string;
}
export const listLoanTypesRef: ListLoanTypesRef;

export function listLoanTypes(): QueryPromise<ListLoanTypesData, undefined>;
export function listLoanTypes(dc: DataConnect): QueryPromise<ListLoanTypesData, undefined>;

