"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { AppError } from "@achados/core";
import { useMutation } from "@tanstack/react-query";

import { executarAcao } from "@/shared/consultas/acao";
import { ROTA_DE_ENTRADA } from "@/shared/rotas";
import { removerFoto, trocarFoto } from "../actions";
import { mensagemDaFalha, SESSAO_NECESSARIA } from "../domain/erros";
import { FOTO } from "../domain/foto";

/**
 * A troca da foto do perfil, do botão da câmera até a gravação: abre a
 * janela, guarda o arquivo escolhido enquanto a pessoa ajusta e chama as
 * Actions. O servidor confere tudo de novo; a tela só reflete o resultado
 * (a Action revalida o layout, e o avatar do cabeçalho muda junto).
 */
export function useFotoDoPerfil() {
  const router = useRouter();
  const [aberta, setAberta] = useState(false);
  const [arquivo, setArquivo] = useState<File>();
  const [aviso, setAviso] = useState<string>();

  const fechar = () => {
    setAberta(false);
    setArquivo(undefined);
    setAviso(undefined);
  };

  const aoFalhar = (erro: Error) => {
    if (erro instanceof AppError && erro.code === SESSAO_NECESSARIA) {
      router.push(ROTA_DE_ENTRADA);
      return;
    }
    setAviso(mensagemDaFalha(erro instanceof AppError ? erro.code : undefined));
  };

  const troca = useMutation({
    mutationFn: (foto: Blob) => {
      const dados = new FormData();
      dados.set("foto", foto);
      return executarAcao(trocarFoto(dados));
    },
    onSuccess: fechar,
    onError: aoFalhar,
  });

  const remocao = useMutation({
    mutationFn: () => executarAcao(removerFoto()),
    onSuccess: fechar,
    onError: aoFalhar,
  });

  const aoEscolher = (evento: ChangeEvent<HTMLInputElement>) => {
    const escolhido = evento.target.files?.[0];
    // Permite escolher o mesmo arquivo de novo depois de cancelar.
    evento.target.value = "";
    if (!escolhido) return;
    if (!escolhido.type.startsWith("image/")) {
      setAviso(mensagemDaFalha("FOTO_INVALIDA"));
      return;
    }
    setAviso(undefined);
    setArquivo(escolhido);
  };

  return {
    aberta,
    abrir: () => setAberta(true),
    fechar,
    arquivo,
    /** Volta para a escolha, descartando o arquivo em ajuste. */
    trocarArquivo: () => setArquivo(undefined),
    aoEscolher,
    /** Tipos que o seletor de arquivos sugere. HEIC e outros o navegador converte ou recusa. */
    tiposAceitos: [...FOTO.tiposAceitos, "image/*"].join(","),
    salvar: (foto: Blob) => troca.mutate(foto),
    remover: () => remocao.mutate(),
    salvando: troca.isPending,
    removendo: remocao.isPending,
    aviso,
  };
}
