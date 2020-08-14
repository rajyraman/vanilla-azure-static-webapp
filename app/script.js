const orgBaseUrl = "https://dreamingincrm.crm6.dynamics.com";
const cdsScope = `${orgBaseUrl}/.default`;
const msalConfig = new msal.PublicClientApplication({
  auth: {
    clientId: "e605bea5-f749-4f51-8508-8c6891d9f8dc",
    authority:
      "https://login.microsoftonline.com/6698ac31-e602-4f64-ac1f-472ae585c006/",
    redirectUri: location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage", // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
});

async function sendFunctionRequest() {
  const path = location.pathname.split("/").slice(2);
  document.querySelector(".title").textContent = path[0].toUpperCase();
  if (path.length == 2) {
    const response = await (await fetch(`/api/${path[0]}/${path[1]}`)).json();
    new Vue({
      template: `<json-tree :raw="response"></json-tree>`,
      el: "#functionJSON",
      data: {
        response: JSON.stringify(response),
      },
    });
  }
}

async function sendCDSRequest() {
  const path = location.pathname.split("/").slice(2);
  const userName = (await (await fetch("/.auth/me")).json()).clientPrincipal
    .userDetails;

  const tokenResponse = await msalConfig.acquireTokenSilent({
    account: msalConfig.getAccountByUsername(userName),
    scopes: [cdsScope],
  });
  const headers = new Headers();
  const bearer = `Bearer ${tokenResponse.accessToken}`;

  headers.append("Authorization", bearer);

  const options = {
    method: "GET",
    headers: headers,
  };

  const response = await (
    await fetch(
      `${orgBaseUrl}/api/data/v9.1/${path[0]}?$select=${path[1]}`,
      options
    )
  ).json();
  new Vue({
    template: `<json-tree :raw="response"></json-tree>`,
    el: "#clientJSON",
    data: {
      response: JSON.stringify(response),
    },
  });
}

async function showUserDetails() {
  const clientPrincipal = (await (await fetch("/.auth/me")).json())
    .clientPrincipal;
  if (clientPrincipal) {
    document.querySelector(
      "#userName"
    ).textContent = `You are logged in as ${clientPrincipal.userDetails}`;
  }
}

async function login() {
  await msalConfig.loginPopup({
    scopes: [cdsScope],
  });
}
