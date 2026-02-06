import { e as escape_html } from "../../chunks/escaping.js";
import "clsx";
import { HttpAgent, Actor } from "@dfinity/agent";
import { b as building } from "../../chunks/environment.js";
const idlFactory = ({ IDL }) => {
  return IDL.Service({ "greet": IDL.Func([IDL.Text], [IDL.Text], ["query"]) });
};
const canisterId = "uxrrr-q7777-77774-qaaaq-cai";
const createActor = (canisterId2, options = {}) => {
  const agent = options.agent || new HttpAgent({ ...options.agentOptions });
  if (options.agent && options.agentOptions) {
    console.warn(
      "Detected both agent and agentOptions passed to createActor. Ignoring agentOptions and proceeding with the provided agent."
    );
  }
  {
    agent.fetchRootKey().catch((err) => {
      console.warn(
        "Unable to fetch root key. Check to ensure that your local replica is running"
      );
      console.error(err);
    });
  }
  return Actor.createActor(idlFactory, {
    agent,
    canisterId: canisterId2,
    ...options.actorOptions
  });
};
function dummyActor() {
  return new Proxy({}, { get() {
    throw new Error("Canister invoked while building");
  } });
}
const buildingOrTesting = building || process.env.NODE_ENV === "test";
buildingOrTesting ? dummyActor() : createActor(canisterId);
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let greeting = "";
    $$renderer2.push(`<main><img src="/logo2.svg" alt="DFINITY logo"/> <br/> <br/> <form action="#"><label for="name">Enter your name:  </label> <input id="name" alt="Name" type="text"/> <button type="submit">Click Me (HELLLOOOOOOOOOOOOOOO)!</button></form> <section id="greeting">${escape_html(greeting)}</section></main>`);
  });
}
export {
  _page as default
};
