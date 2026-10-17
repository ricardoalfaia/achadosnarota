// @vitest-environment jsdom
import {
  QueryClient,
  QueryClientProvider,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DataBoundary } from "./data-boundary";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("DataBoundary", () => {
  it("não monta a região quando canFetch é false", () => {
    const child = vi.fn(() => <p>Conteúdo</p>);
    const Child = child;
    render(
      <DataBoundary fallback={<p>Aguarde</p>} canFetch={false}>
        <Child />
      </DataBoundary>
    );
    expect(child).not.toHaveBeenCalled();
    expect(screen.queryByText("Aguarde")).toBeNull();
  });
  it("retry padrão reinicia Query e limpa o erro da classe", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const queryFn = vi
      .fn()
      .mockRejectedValueOnce(new Error("Falha inicial"))
      .mockResolvedValue("Conteúdo recuperado");
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    function Content() {
      const { data } = useSuspenseQuery({ queryKey: ["retry"], queryFn });
      return <p>{data}</p>;
    }
    render(
      <QueryClientProvider client={client}>
        <DataBoundary fallback={<p>Aguarde</p>}>
          <Content />
        </DataBoundary>
      </QueryClientProvider>
    );
    expect(screen.getByText("Aguarde")).toBeDefined();
    fireEvent.click(
      await screen.findByRole("button", { name: "Tentar novamente" })
    );
    expect(await screen.findByText("Conteúdo recuperado")).toBeDefined();
    expect(queryFn).toHaveBeenCalledTimes(2);
    client.clear();
  });
  it("o fallback personalizado recebe a recuperação completa", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    let failed = true;
    function Content() {
      if (failed) throw new Error("Falha inicial");
      return <p>Recuperado</p>;
    }
    render(
      <DataBoundary
        fallback={<p>Aguarde</p>}
        errorFallback={(_, reset) => (
          <button
            onClick={() => {
              failed = false;
              reset();
            }}
          >
            Recuperar região
          </button>
        )}
      >
        <Content />
      </DataBoundary>
    );
    fireEvent.click(screen.getByRole("button", { name: "Recuperar região" }));
    expect(await screen.findByText("Recuperado")).toBeDefined();
  });
});
