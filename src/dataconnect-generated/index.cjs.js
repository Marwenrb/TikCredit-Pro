const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'tikcredit-pro',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const addNewLoanApplicationRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddNewLoanApplication', inputVars);
}
addNewLoanApplicationRef.operationName = 'AddNewLoanApplication';
exports.addNewLoanApplicationRef = addNewLoanApplicationRef;

exports.addNewLoanApplication = function addNewLoanApplication(dcOrVars, vars) {
  return executeMutation(addNewLoanApplicationRef(dcOrVars, vars));
};

const getLoanApplicationsForUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetLoanApplicationsForUser', inputVars);
}
getLoanApplicationsForUserRef.operationName = 'GetLoanApplicationsForUser';
exports.getLoanApplicationsForUserRef = getLoanApplicationsForUserRef;

exports.getLoanApplicationsForUser = function getLoanApplicationsForUser(dcOrVars, vars) {
  return executeQuery(getLoanApplicationsForUserRef(dcOrVars, vars));
};

const updateLoanApplicationStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateLoanApplicationStatus', inputVars);
}
updateLoanApplicationStatusRef.operationName = 'UpdateLoanApplicationStatus';
exports.updateLoanApplicationStatusRef = updateLoanApplicationStatusRef;

exports.updateLoanApplicationStatus = function updateLoanApplicationStatus(dcOrVars, vars) {
  return executeMutation(updateLoanApplicationStatusRef(dcOrVars, vars));
};

const listLoanTypesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListLoanTypes');
}
listLoanTypesRef.operationName = 'ListLoanTypes';
exports.listLoanTypesRef = listLoanTypesRef;

exports.listLoanTypes = function listLoanTypes(dc) {
  return executeQuery(listLoanTypesRef(dc));
};
