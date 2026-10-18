"use client";

import type { ReactNode } from "react";
import { Alerta, Avatar, Botao, Dialogo } from "@achados/ui";
import { estiloDoBotao } from "@achados/ui/estilos";
import { Camera, ImageUp, Trash2 } from "lucide-react";

import { useFotoDoPerfil } from "../hooks/use-foto-do-perfil";
import { EditorDaFoto } from "./editor-da-foto";

/**
 * O avatar em anel do topo do perfil com o botão de câmera. A janela começa
 * na escolha da foto (e na remoção, se já houver uma) e passa ao ajuste
 * quando um arquivo é escolhido. `selo` fica sobre o avatar (a coroa do
 * passaporte ativo).
 */
export function FotoDoPerfil({
  nome,
  fotoUrl,
  selo,
}: {
  nome: string;
  fotoUrl?: string | undefined;
  selo?: ReactNode;
}) {
  const foto = useFotoDoPerfil();

  return (
    <>
      <div className="relative">
        <Avatar
          nome={nome}
          tamanho="2xl"
          anel
          {...(fotoUrl ? { fotoUrl } : {})}
        />
        {selo}
        <button
          type="button"
          onClick={foto.abrir}
          aria-label={
            fotoUrl ? "Mudar a foto do perfil" : "Pôr uma foto no perfil"
          }
          className="absolute bottom-1 left-1 flex size-8 cursor-pointer items-center justify-center rounded-full border-[3px] border-[#0a1e2e] bg-white text-[#0a1e2e] shadow-md transition-transform outline-none hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <Camera aria-hidden="true" className="size-4" />
        </button>
      </div>

      <Dialogo
        aberto={foto.aberta}
        aoFechar={foto.fechar}
        titulo="Foto do perfil"
        descricao={
          foto.arquivo
            ? "Arraste e use o zoom para a foto encaixar no círculo."
            : "Ela aparece no seu perfil e no topo do app."
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
