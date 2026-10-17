import { useId, useRef } from "react";
import { useFormStatus } from "react-dom";

import { useFecharAoSair } from "../../../hooks/use-fechar-ao-sair";
import { usePresenca } from "../../../hooks/use-presenca";
import {
  useSelect,
  type Opcao,
  type UseSelectOpcoes,
} from "../../../hooks/use-select";
import { cn } from "../../../lib/cn";
import {
  CaixaDoCampo,
  idDaMensagem,
  MensagemDoCampo,
  TEXTO_DO_CAMPO,
} from "../../CaixaDoCampo";
import { IconeSeta } from "../../Icones";
import type { PropsDeCampo } from "../../tipos";
import { ListaDeOpcoes } from "./lista";

type Props<T extends string> = UseSelectOpcoes<T> &
  PropsDeCampo & { placeholderDaBusca?: string; textoVazio?: string };

export function CampoSelect<T extends string>({
  label,
  id,
  name,
  erro,
  ajuda,
  desabilitado,
  tamanho = "lg",
  required,
  aoSair,
  lado,
  className,
  placeholderDaBusca = "Buscar",
  textoVazio = "Nada encontrado",
  ...opcoes
}: Props<T>) {
  const select = useSelect(opcoes);
  const { pending } = useFormStatus();
  const idGerado = useId();
  const idDoCampo = id ?? idGerado;
  const idDaLista = `${idDoCampo}-lista`;
  const raiz = useRef<HTMLDivElement>(null);
  const gatilho = useRef<HTMLButtonElement>(null);
  useFecharAoSair(raiz, select.aberto, select.fechar, gatilho);
  const lista = usePresenca(select.aberto);

  const bloqueado = desabilitado || pending;
  const flutuando = select.aberto || select.selecionada !== null;
  const pesquisavel = Boolean(opcoes.pesquisavel);

  function escolher(opcao: Opcao<T>) {
    select.escolher(opcao);
    gatilho.current?.focus();
  }

  return (
    <div ref={raiz} className={cn("relative", className)}>
      <CaixaDoCampo
        id={idDoCampo}
        label={label}
        tamanho={tamanho}
        flutuando={flutuando}
        ativo={select.aberto}
        invalido={Boolean(erro)}
        desabilitado={bloqueado}
        icone={
          <IconeSeta aberto={select.aberto} className="text-foreground-muted" />
        }
      >
        <button
          ref={gatilho}
          id={idDoCampo}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={select.aberto}
          aria-controls={select.aberto ? idDaLista : undefined}
          aria-activedescendant={
            !pesquisavel && select.aberto && select.ativo >= 0
              ? `${idDaLista}-${select.ativo}`
              : undefined
          }
          aria-labelledby={`${idDoCampo}-rotulo`}
          aria-invalid={erro ? true : undefined}
          aria-describedby={idDaMensagem(idDoCampo, erro, ajuda)}
          aria-required={required || undefined}
          disabled={bloqueado}
          onClick={select.alternar}
          onKeyDown={select.aoTeclar}
          onBlur={aoSair}
          className={cn(
            "w-full truncate text-left text-foreground outline-none disabled:cursor-not-allowed",
            TEXTO_DO_CAMPO[tamanho],
            !flutuando && "sr-only"
          )}
        >
          {select.selecionada?.label ?? ""}
        </button>
      </CaixaDoCampo>
      {name && <input type="hidden" name={name} value={select.valor ?? ""} />}
      <MensagemDoCampo id={`${idDoCampo}-mensagem`} erro={erro} ajuda={ajuda} />
      {lista.montado && (
        <ListaDeOpcoes
          saindo={lista.saindo}
          select={select}
          id={idDaLista}
          idDoRotulo={`${idDoCampo}-rotulo`}
          pesquisavel={pesquisavel}
          placeholderDaBusca={placeholderDaBusca}
          textoVazio={textoVazio}
          lado={lado}
          aoEscolher={escolher}
        />
      )}
    </div>
  );
}
