import { CreateFetchClient } from "@/lib/support/fetch";

const api = new CreateFetchClient({
  baseUrl: "https://example.com/",
  options: {
    credentials: "include",
    headers: {
      "Accept": "application/json",
      "Content-type": "application/json",
    },
  },
}).create();

export { api };
