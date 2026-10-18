"use client";

import { Alerta, Avatar, Botao, Dialogo } from "@achados/ui";
import { estiloDoBotao } from "@achados/ui/estilos";
import { Camera, ImageUp, Trash2 } from "lucide-react";

import { useFotoDoPerfil } from "../hooks/use-foto-do-perfil";
import { EditorDaFoto } from "./editor-da-foto";

/**
 * "Mudar foto" no menu do usuário do painel e a janela da foto: começa na
 * escolha (e na remoção, se já houver uma) e passa ao ajuste quando um
 * arquivo é escolhido. Mesmo fluxo da foto do app do assinante (ADR-0027).
 */
export function FotoDoPerfil({
  nome,
  fotoUrl,
}: {
  nome: string;
  fotoUrl?: string | undefined;
}) {
  const foto = useFotoDoPerfil();

  return (
    <>
      <button
        type="button"
        onClick={foto.abrir}
        className="flex w-full cursor-pointer items-center gap-2 rounded-control px-2 py-2 text-left text-sm font-semibold text-foreground outline-none hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-ring"
      >
        <Camera aria-hidden="true" className="size-4 text-brand" />
        {fotoUrl ? "Mudar a minha foto" : "Pôr uma foto"}
      </button>

      <Dialogo
        aberto={foto.aberta}
        aoFechar={foto.fechar}
        titulo="Foto do perfil"
        descricao={
          foto.arquivo
            ? "Arraste e use o zoom para a foto encaixar no círculo."
            : "Ela aparece no menu do painel e no seu perfil do app."
        }
        tamanho="sm"
        semFechar={foto.salvando || foto.removendo}
      >
        <div className="flex flex-col gap-4">
          {foto.aviso && <Alerta intencao="erro">{foto.aviso}</Alerta>}

          {foto.arquivo ? (
            <EditorDaFoto
              arquivo={foto.arquivo}
              aoSalvar={foto.salvar}
              aoTrocarArquivo={foto.trocarArquivo}
              salvando={foto.salvando}
            />
          ) : (
            <div className="flex flex-col items-center gap-5 py-2">
              <Avatar
                nome={nome}
                tamanho="2xl"
                anel
                {...(fotoUrl ? { fotoUrl } : {})}
              />
              <div className="flex w-full flex-col gap-2">
                <label className="relative">
                  <input
                    type="file"
                    accept={foto.tiposAceitos}
                    onChange={foto.aoEscolher}
                    disabled={foto.removendo}
                    className="peer sr-only"
                  />
                  <span
                    className={estiloDoBotao({
                      tamanho: "md",
                      className:
                        "w-full cursor-pointer peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring peer-disabled:opacity-60",
                    })}
                  >
                    <ImageUp aria-hidden="true" className="size-4" />
                    {fotoUrl ? "Escolher nova foto" : "Escolher foto"}
                  </span>
                </label>
                {fotoUrl && (
                  <Botao
                    variante="fantasma"
                    icone={<Trash2 />}
                    onClick={foto.remover}
                    carregando={foto.removendo}
                    className="text-danger"
                  >
                    Remover foto
                  </Botao>
                )}
              </div>
            </div>
          )}
        </div>
      </Dialogo>
    </>
  );
}
