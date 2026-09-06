declare global {
  interface Document {
    modelContext?: {
      registerTool: (tool: Record<string, unknown>, options?: { signal?: AbortSignal }) => void | Promise<void>;
    };
  }
}

export function registerPageTool(tool: Record<string, unknown>): () => void {
  const controller = new AbortController();
  try {
    void Promise.resolve(document.modelContext?.registerTool(tool, { signal: controller.signal })).catch(() => undefined);
  } catch {}
  return () => controller.abort();
}
