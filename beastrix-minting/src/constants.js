import createEdgeClient from "@honeycomb-protocol/edge-client";

const API_URL = "https://edge.test.honeycombprotocol.com/";

export const client = createEdgeClient(API_URL, true);

export const MERKLE_TREE_ADDRESS =
  "ERSoTa78hnqcok4BRYNdBowZPMmCkj1vjfLSdNSFX2dd";
export const COLLECTION_MINT_ADDRESS =
  "AMbfJcCd6urjjDKWtKU5fyKoVyxmPZ8p4L2t7SgK6VKc";
export const ADMIN_PRIVATE_KEY = import.meta.env.VITE_ADMIN_PRIVATE_KEY.split(
  ","
).map(Number);
