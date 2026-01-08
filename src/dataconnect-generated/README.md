# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetLoanApplicationsForUser*](#getloanapplicationsforuser)
  - [*ListLoanTypes*](#listloantypes)
- [**Mutations**](#mutations)
  - [*AddNewLoanApplication*](#addnewloanapplication)
  - [*UpdateLoanApplicationStatus*](#updateloanapplicationstatus)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetLoanApplicationsForUser
You can execute the `GetLoanApplicationsForUser` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getLoanApplicationsForUser(vars: GetLoanApplicationsForUserVariables): QueryPromise<GetLoanApplicationsForUserData, GetLoanApplicationsForUserVariables>;

interface GetLoanApplicationsForUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetLoanApplicationsForUserVariables): QueryRef<GetLoanApplicationsForUserData, GetLoanApplicationsForUserVariables>;
}
export const getLoanApplicationsForUserRef: GetLoanApplicationsForUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getLoanApplicationsForUser(dc: DataConnect, vars: GetLoanApplicationsForUserVariables): QueryPromise<GetLoanApplicationsForUserData, GetLoanApplicationsForUserVariables>;

interface GetLoanApplicationsForUserRef {
  ...
  (dc: DataConnect, vars: GetLoanApplicationsForUserVariables): QueryRef<GetLoanApplicationsForUserData, GetLoanApplicationsForUserVariables>;
}
export const getLoanApplicationsForUserRef: GetLoanApplicationsForUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getLoanApplicationsForUserRef:
```typescript
const name = getLoanApplicationsForUserRef.operationName;
console.log(name);
```

### Variables
The `GetLoanApplicationsForUser` query requires an argument of type `GetLoanApplicationsForUserVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetLoanApplicationsForUserVariables {
  userId: UUIDString;
}
```
### Return Type
Recall that executing the `GetLoanApplicationsForUser` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetLoanApplicationsForUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetLoanApplicationsForUserData {
  loanApplications: ({
    id: UUIDString;
    applicationId: string;
    status: string;
    requestedAmount: number;
  } & LoanApplication_Key)[];
}
```
### Using `GetLoanApplicationsForUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getLoanApplicationsForUser, GetLoanApplicationsForUserVariables } from '@dataconnect/generated';

// The `GetLoanApplicationsForUser` query requires an argument of type `GetLoanApplicationsForUserVariables`:
const getLoanApplicationsForUserVars: GetLoanApplicationsForUserVariables = {
  userId: ..., 
};

// Call the `getLoanApplicationsForUser()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getLoanApplicationsForUser(getLoanApplicationsForUserVars);
// Variables can be defined inline as well.
const { data } = await getLoanApplicationsForUser({ userId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getLoanApplicationsForUser(dataConnect, getLoanApplicationsForUserVars);

console.log(data.loanApplications);

// Or, you can use the `Promise` API.
getLoanApplicationsForUser(getLoanApplicationsForUserVars).then((response) => {
  const data = response.data;
  console.log(data.loanApplications);
});
```

### Using `GetLoanApplicationsForUser`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getLoanApplicationsForUserRef, GetLoanApplicationsForUserVariables } from '@dataconnect/generated';

// The `GetLoanApplicationsForUser` query requires an argument of type `GetLoanApplicationsForUserVariables`:
const getLoanApplicationsForUserVars: GetLoanApplicationsForUserVariables = {
  userId: ..., 
};

// Call the `getLoanApplicationsForUserRef()` function to get a reference to the query.
const ref = getLoanApplicationsForUserRef(getLoanApplicationsForUserVars);
// Variables can be defined inline as well.
const ref = getLoanApplicationsForUserRef({ userId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getLoanApplicationsForUserRef(dataConnect, getLoanApplicationsForUserVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.loanApplications);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.loanApplications);
});
```

## ListLoanTypes
You can execute the `ListLoanTypes` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listLoanTypes(): QueryPromise<ListLoanTypesData, undefined>;

interface ListLoanTypesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListLoanTypesData, undefined>;
}
export const listLoanTypesRef: ListLoanTypesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listLoanTypes(dc: DataConnect): QueryPromise<ListLoanTypesData, undefined>;

interface ListLoanTypesRef {
  ...
  (dc: DataConnect): QueryRef<ListLoanTypesData, undefined>;
}
export const listLoanTypesRef: ListLoanTypesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listLoanTypesRef:
```typescript
const name = listLoanTypesRef.operationName;
console.log(name);
```

### Variables
The `ListLoanTypes` query has no variables.
### Return Type
Recall that executing the `ListLoanTypes` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListLoanTypesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListLoanTypesData {
  loanTypes: ({
    id: UUIDString;
    name: string;
    description: string;
    maxAmount?: number | null;
    interestRateRange?: string | null;
  } & LoanType_Key)[];
}
```
### Using `ListLoanTypes`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listLoanTypes } from '@dataconnect/generated';


// Call the `listLoanTypes()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listLoanTypes();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listLoanTypes(dataConnect);

console.log(data.loanTypes);

// Or, you can use the `Promise` API.
listLoanTypes().then((response) => {
  const data = response.data;
  console.log(data.loanTypes);
});
```

### Using `ListLoanTypes`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listLoanTypesRef } from '@dataconnect/generated';


// Call the `listLoanTypesRef()` function to get a reference to the query.
const ref = listLoanTypesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listLoanTypesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.loanTypes);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.loanTypes);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## AddNewLoanApplication
You can execute the `AddNewLoanApplication` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
addNewLoanApplication(vars: AddNewLoanApplicationVariables): MutationPromise<AddNewLoanApplicationData, AddNewLoanApplicationVariables>;

interface AddNewLoanApplicationRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddNewLoanApplicationVariables): MutationRef<AddNewLoanApplicationData, AddNewLoanApplicationVariables>;
}
export const addNewLoanApplicationRef: AddNewLoanApplicationRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
addNewLoanApplication(dc: DataConnect, vars: AddNewLoanApplicationVariables): MutationPromise<AddNewLoanApplicationData, AddNewLoanApplicationVariables>;

interface AddNewLoanApplicationRef {
  ...
  (dc: DataConnect, vars: AddNewLoanApplicationVariables): MutationRef<AddNewLoanApplicationData, AddNewLoanApplicationVariables>;
}
export const addNewLoanApplicationRef: AddNewLoanApplicationRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the addNewLoanApplicationRef:
```typescript
const name = addNewLoanApplicationRef.operationName;
console.log(name);
```

### Variables
The `AddNewLoanApplication` mutation requires an argument of type `AddNewLoanApplicationVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface AddNewLoanApplicationVariables {
  loanTypeId: UUIDString;
  userId: UUIDString;
  applicationDate: DateString;
  applicationId: string;
  requestedAmount: number;
  status: string;
}
```
### Return Type
Recall that executing the `AddNewLoanApplication` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `AddNewLoanApplicationData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface AddNewLoanApplicationData {
  loanApplication_insert: LoanApplication_Key;
}
```
### Using `AddNewLoanApplication`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, addNewLoanApplication, AddNewLoanApplicationVariables } from '@dataconnect/generated';

// The `AddNewLoanApplication` mutation requires an argument of type `AddNewLoanApplicationVariables`:
const addNewLoanApplicationVars: AddNewLoanApplicationVariables = {
  loanTypeId: ..., 
  userId: ..., 
  applicationDate: ..., 
  applicationId: ..., 
  requestedAmount: ..., 
  status: ..., 
};

// Call the `addNewLoanApplication()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await addNewLoanApplication(addNewLoanApplicationVars);
// Variables can be defined inline as well.
const { data } = await addNewLoanApplication({ loanTypeId: ..., userId: ..., applicationDate: ..., applicationId: ..., requestedAmount: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await addNewLoanApplication(dataConnect, addNewLoanApplicationVars);

console.log(data.loanApplication_insert);

// Or, you can use the `Promise` API.
addNewLoanApplication(addNewLoanApplicationVars).then((response) => {
  const data = response.data;
  console.log(data.loanApplication_insert);
});
```

### Using `AddNewLoanApplication`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, addNewLoanApplicationRef, AddNewLoanApplicationVariables } from '@dataconnect/generated';

// The `AddNewLoanApplication` mutation requires an argument of type `AddNewLoanApplicationVariables`:
const addNewLoanApplicationVars: AddNewLoanApplicationVariables = {
  loanTypeId: ..., 
  userId: ..., 
  applicationDate: ..., 
  applicationId: ..., 
  requestedAmount: ..., 
  status: ..., 
};

// Call the `addNewLoanApplicationRef()` function to get a reference to the mutation.
const ref = addNewLoanApplicationRef(addNewLoanApplicationVars);
// Variables can be defined inline as well.
const ref = addNewLoanApplicationRef({ loanTypeId: ..., userId: ..., applicationDate: ..., applicationId: ..., requestedAmount: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = addNewLoanApplicationRef(dataConnect, addNewLoanApplicationVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.loanApplication_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.loanApplication_insert);
});
```

## UpdateLoanApplicationStatus
You can execute the `UpdateLoanApplicationStatus` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateLoanApplicationStatus(vars: UpdateLoanApplicationStatusVariables): MutationPromise<UpdateLoanApplicationStatusData, UpdateLoanApplicationStatusVariables>;

interface UpdateLoanApplicationStatusRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateLoanApplicationStatusVariables): MutationRef<UpdateLoanApplicationStatusData, UpdateLoanApplicationStatusVariables>;
}
export const updateLoanApplicationStatusRef: UpdateLoanApplicationStatusRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateLoanApplicationStatus(dc: DataConnect, vars: UpdateLoanApplicationStatusVariables): MutationPromise<UpdateLoanApplicationStatusData, UpdateLoanApplicationStatusVariables>;

interface UpdateLoanApplicationStatusRef {
  ...
  (dc: DataConnect, vars: UpdateLoanApplicationStatusVariables): MutationRef<UpdateLoanApplicationStatusData, UpdateLoanApplicationStatusVariables>;
}
export const updateLoanApplicationStatusRef: UpdateLoanApplicationStatusRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateLoanApplicationStatusRef:
```typescript
const name = updateLoanApplicationStatusRef.operationName;
console.log(name);
```

### Variables
The `UpdateLoanApplicationStatus` mutation requires an argument of type `UpdateLoanApplicationStatusVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateLoanApplicationStatusVariables {
  id: UUIDString;
  status: string;
}
```
### Return Type
Recall that executing the `UpdateLoanApplicationStatus` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateLoanApplicationStatusData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateLoanApplicationStatusData {
  loanApplication_update?: LoanApplication_Key | null;
}
```
### Using `UpdateLoanApplicationStatus`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateLoanApplicationStatus, UpdateLoanApplicationStatusVariables } from '@dataconnect/generated';

// The `UpdateLoanApplicationStatus` mutation requires an argument of type `UpdateLoanApplicationStatusVariables`:
const updateLoanApplicationStatusVars: UpdateLoanApplicationStatusVariables = {
  id: ..., 
  status: ..., 
};

// Call the `updateLoanApplicationStatus()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateLoanApplicationStatus(updateLoanApplicationStatusVars);
// Variables can be defined inline as well.
const { data } = await updateLoanApplicationStatus({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateLoanApplicationStatus(dataConnect, updateLoanApplicationStatusVars);

console.log(data.loanApplication_update);

// Or, you can use the `Promise` API.
updateLoanApplicationStatus(updateLoanApplicationStatusVars).then((response) => {
  const data = response.data;
  console.log(data.loanApplication_update);
});
```

### Using `UpdateLoanApplicationStatus`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateLoanApplicationStatusRef, UpdateLoanApplicationStatusVariables } from '@dataconnect/generated';

// The `UpdateLoanApplicationStatus` mutation requires an argument of type `UpdateLoanApplicationStatusVariables`:
const updateLoanApplicationStatusVars: UpdateLoanApplicationStatusVariables = {
  id: ..., 
  status: ..., 
};

// Call the `updateLoanApplicationStatusRef()` function to get a reference to the mutation.
const ref = updateLoanApplicationStatusRef(updateLoanApplicationStatusVars);
// Variables can be defined inline as well.
const ref = updateLoanApplicationStatusRef({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateLoanApplicationStatusRef(dataConnect, updateLoanApplicationStatusVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.loanApplication_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.loanApplication_update);
});
```

