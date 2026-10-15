"use client";
import { createContext, useContext, useMemo } from "react";
import { findAddon, findSuite, waLinkFor } from "./content-helpers";

const ContentContext = createContext(null);

// Hands the server-fetched content to client components
export function ContentProvider({ content, children }) {
  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const content = useContext(ContentContext);
  return useMemo(
    () => ({
      ...content,
      getSuite: (id) => findSuite(content, id),
      getAddon: (id) => findAddon(content, id),
      waLink: waLinkFor(content.contact),
    }),
    [content],
  );
}
