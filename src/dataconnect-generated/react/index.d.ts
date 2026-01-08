import { AddNewLoanApplicationData, AddNewLoanApplicationVariables, GetLoanApplicationsForUserData, GetLoanApplicationsForUserVariables, UpdateLoanApplicationStatusData, UpdateLoanApplicationStatusVariables, ListLoanTypesData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useAddNewLoanApplication(options?: useDataConnectMutationOptions<AddNewLoanApplicationData, FirebaseError, AddNewLoanApplicationVariables>): UseDataConnectMutationResult<AddNewLoanApplicationData, AddNewLoanApplicationVariables>;
export function useAddNewLoanApplication(dc: DataConnect, options?: useDataConnectMutationOptions<AddNewLoanApplicationData, FirebaseError, AddNewLoanApplicationVariables>): UseDataConnectMutationResult<AddNewLoanApplicationData, AddNewLoanApplicationVariables>;

export function useGetLoanApplicationsForUser(vars: GetLoanApplicationsForUserVariables, options?: useDataConnectQueryOptions<GetLoanApplicationsForUserData>): UseDataConnectQueryResult<GetLoanApplicationsForUserData, GetLoanApplicationsForUserVariables>;
export function useGetLoanApplicationsForUser(dc: DataConnect, vars: GetLoanApplicationsForUserVariables, options?: useDataConnectQueryOptions<GetLoanApplicationsForUserData>): UseDataConnectQueryResult<GetLoanApplicationsForUserData, GetLoanApplicationsForUserVariables>;

export function useUpdateLoanApplicationStatus(options?: useDataConnectMutationOptions<UpdateLoanApplicationStatusData, FirebaseError, UpdateLoanApplicationStatusVariables>): UseDataConnectMutationResult<UpdateLoanApplicationStatusData, UpdateLoanApplicationStatusVariables>;
export function useUpdateLoanApplicationStatus(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateLoanApplicationStatusData, FirebaseError, UpdateLoanApplicationStatusVariables>): UseDataConnectMutationResult<UpdateLoanApplicationStatusData, UpdateLoanApplicationStatusVariables>;

export function useListLoanTypes(options?: useDataConnectQueryOptions<ListLoanTypesData>): UseDataConnectQueryResult<ListLoanTypesData, undefined>;
export function useListLoanTypes(dc: DataConnect, options?: useDataConnectQueryOptions<ListLoanTypesData>): UseDataConnectQueryResult<ListLoanTypesData, undefined>;
