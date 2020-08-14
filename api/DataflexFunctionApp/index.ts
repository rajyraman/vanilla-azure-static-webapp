import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { EnvironmentCredential } from "@azure/identity";

import {
  retrieveMultiple,
  WebApiConfig,
  unboundFunction,
} from "xrm-webapi/dist/xrm-webapi-node";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.log("HTTP trigger function processed a request.");
  const clientUrl = process.env.CDSUrl;
  context.log(`Client Url: ${clientUrl}`);
  context.log(
    `Entity Name: ${context.bindingData.entityName}, Attributes: ${context.bindingData.attributes}`
  );

  try {
    let credential = new EnvironmentCredential();
    context.log(`Get Token`);
    const tokenResponse = await credential.getToken(`${clientUrl}/.default`);

    const config = new WebApiConfig("9.1", tokenResponse.token, clientUrl);

    const records = await retrieveMultiple(
      config,
      context.bindingData.entityName,
      `$select=${context.bindingData.attributes}`
    );
    context.res = {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(records),
    };
  } catch (e) {
    context.res = {
      headers: {
        "Content-Type": "application/json",
      },
      status: 500,
      body: JSON.stringify(e),
    };
  }
};

export default httpTrigger;
