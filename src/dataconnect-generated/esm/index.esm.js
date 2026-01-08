import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'tikcredit-pro',
  location: 'us-east4'
};

export const addNewLoanApplicationRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddNewLoanApplication', inputVars);
}
addNewLoanApplicationRef.operationName = 'AddNewLoanApplication';

export function addNewLoanApplication(dcOrVars, vars) {
  return executeMutation(addNewLoanApplicationRef(dcOrVars, vars));
}

export const getLoanApplicationsForUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetLoanApplicationsForUser', inputVars);
}
getLoanApplicationsForUserRef.operationName = 'GetLoanApplicationsForUser';

export function getLoanApplicationsForUser(dcOrVars, vars) {
  return executeQuery(getLoanApplicationsForUserRef(dcOrVars, vars));
}

export const updateLoanApplicationStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateLoanApplicationStatus', inputVars);
}
updateLoanApplicationStatusRef.operationName = 'UpdateLoanApplicationStatus';

export function updateLoanApplicationStatus(dcOrVars, vars) {
  return executeMutation(updateLoanApplicationStatusRef(dcOrVars, vars));
}

export const listLoanTypesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListLoanTypes');
}
listLoanTypesRef.operationName = 'ListLoanTypes';

export function listLoanTypes(dc) {
  return executeQuery(listLoanTypesRef(dc));
}

