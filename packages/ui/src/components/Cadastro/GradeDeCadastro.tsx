"use client";

import type { ReactNode } from "react";

import { cn } from "../../lib/cn";
import { BotaoDeIcone, type BotaoDeIconeProps } from "../Botao";
import { IconeBusca, IconeLateral } from "../Icones";

// A grade de listagem dos cadastros, como no protótipo: barra com busca,
// chips de estado e ações; o corpo (a Tabela, para volumes grandes); e o
// rodapé com a paginação. Cada parte é explícita; a grade só dá a moldura.

/** A moldura: barra em cima, corpo que rola, rodapé embaixo. */
export function GradeDeCadastro({
  barra,
  rodape,
  className,
  children,
}: {
  barra?: ReactNode;
  rodape?: ReactNode;
  className?: string;
  /** O corpo: normalmente a `Tabela`, que ocupa o espaço que sobra. */
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden rounded-card border border-border bg-surface",
        className
      )}
    >
      {barra}
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      {rodape}
    </div>
  );
}

/** A barra da grade: busca à esquerda, chips no meio, ações à direita. */
export function BarraDaGrade({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-4 border-b border-border bg-surface-hover px-6 py-4",
        className
      )}
    >
      {children}
    </div>
  );
}

/** A caixa de busca da grade; filtra as linhas conforme a pessoa digita. */
export function BuscaDaGrade({
  valor,
  aoMudar,
  placeholder = "Buscar...",
  rotulo = "Buscar na listagem",
  className,
}: {
  valor: string;
  aoMudar: (valor: string) => void;
  placeholder?: string;
  /** Nome acessível do campo. */
  rotulo?: string;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "flex h-control-sm w-85 items-center gap-2.5 rounded-[10px] border border-border bg-surface px-3.5 text-foreground-muted transition-all duration-240 ease-smooth focus-within:border-ring focus-within:shadow-ring-glow",
        className
      )}
    >
      <IconeBusca />
      <input
        type="search"
        value={valor}
        onChange={(evento) => aoMudar(evento.target.value)}
        placeholder={placeholder}
        aria-label={rotulo}
        className="w-full border-0 bg-transparent text-base text-foreground outline-none placeholder:text-foreground-subtle"
      />
    </label>
  );
}

/** O grupo de chips de estado ("Todos (6)", "Ativos (5)"). Um fica marcado. */
export function ChipsDeFiltro({
  rotulo,
  className,
  children,
}: {
  /** Nome acessível do grupo. */
  rotulo: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      role="group"
      aria-label={rotulo}
      className={cn("flex items-center gap-1.5", className)}
    >
      {children}
    </div>
  );
}

export function ChipDeFiltro({
  ativo = false,
  aoEscolher,
  children,
}: {
  ativo?: boolean;
  aoEscolher: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      onClick={aoEscolher}
      className={cn(
        "cursor-pointer rounded-2xl border border-border bg-surface px-3 py-1.25 text-[11.5px] font-bold text-foreground-muted transition-all duration-240 ease-smooth outline-none hover:border-ring hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        ativo &&
          "border-primary-solid-border bg-primary-solid text-primary-solid-foreground hover:border-primary-solid-border hover:text-primary-solid-foreground"
      )}
    >
      {children}
    </button>
  );
}

/** As ações da barra (exportar, novo cadastro), alinhadas à direita. */
export function AcoesDaGrade({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>{children}</div>
  );
}

/**
 * O rodapé: "Mostrando 1 a 6 de 6 registros", a página e as setas. Os textos
 * vêm de quem usa, para a aplicação traduzir.
 */
export function RodapeDaGrade({
  resumo,
  pagina,
  aoAnterior,
  aoProxima,
  rotuloDeAnterior = "Página anterior",
  rotuloDeProxima = "Próxima página",
  className,
}: {
  /** "Mostrando 1 a 6 de 6 registros cadastrados". */
  resumo: ReactNode;
  /** "Página 1 de 1". */
  pagina?: ReactNode;
  /** Ausente: a seta fica desabilitada. */
  aoAnterior?: () => void;
  aoProxima?: () => void;
  rotuloDeAnterior?: string;
  rotuloDeProxima?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-t border-border bg-surface px-6 py-3 text-sm text-foreground-muted",
        className
      )}
    >
      <div>{resumo}</div>
      <div className="flex items-center gap-2">
        {pagina && <span className="text-[11.5px]">{pagina}</span>}
        <div className="flex gap-1">
          <SetaDaPagina
            rotulo={rotuloDeAnterior}
            direcao="anterior"
            onClick={aoAnterior}
          />
          <SetaDaPagina
            rotulo={rotuloDeProxima}
            direcao="proximo"
            onClick={aoProxima}
          />
        </div>
      </div>
    </div>
  );
}

function SetaDaPagina({
  rotulo,
  direcao,
  onClick,
}: {
  rotulo: string;
  direcao: "anterior" | "proximo";
  onClick?: () => void;
}) {
  return (
    <BotaoDeIcone
      rotulo={rotulo}
      tamanho="xs"
      icone={<IconeLateral direcao={direcao} />}
      desabilitado={!onClick}
      onClick={onClick}
      className="size-7 rounded-lg bg-surface-hover text-foreground-muted"
    />
  );
}

/** O botão quadrado de 30px no fim da linha: editar, abrir, excluir. */
export function BotaoDeAcaoDaLinha({ className, ...props }: BotaoDeIconeProps) {
  return (
    <BotaoDeIcone
      tamanho="xs"
      {...props}
      className={cn(
        "size-7.5 rounded-md text-foreground-muted hover:border-primary-solid-border hover:bg-primary-solid hover:text-primary-solid-foreground [&_svg]:size-3.5",
        className
      )}
    />
  );
}

/** Nome em destaque com uma linha menor embaixo ("Procuração" / "Cliente Exemplo Ltda."). */
export function TextoDaLinha({
  principal,
  secundario,
  destaque = true,
}: {
  principal: ReactNode;
  secundario?: ReactNode;
  /** O principal na cor da marca, como o nome do registro; `false` deixa em negrito comum. */
  destaque?: boolean;
}) {
  return (
    <span className="flex min-w-0 flex-col leading-[normal]">
      <span
        className={cn(
          "truncate font-bold",
          destaque ? "text-primary" : "text-foreground"
        )}
      >
        {principal}
      </span>
      {secundario && (
        <span className="mt-0.5 truncate text-xs text-foreground-muted">
          {secundario}
        </span>
      )}
    </span>
  );
}

/**
 * `sucesso` (Assinado, Ativo), `primario` (Em andamento), `destaque` (roxo:
 * Em revisão), `atencao` (Aguardando), `perigo` (Recusado) e `neutro` (Rascunho).
 */
export type IntencaoDoSeloDeStatus =
  "sucesso" | "primario" | "destaque" | "atencao" | "perigo" | "neutro";

const STATUS: Record<IntencaoDoSeloDeStatus, string> = {
  sucesso: "border-success-border bg-success-subtle text-success",
  primario: "border-info-border bg-primary-subtle text-primary",
  destaque: "border-highlight-border bg-highlight-subtle text-highlight",
  atencao: "border-warning-border bg-warning-subtle text-warning",
  perigo: "border-danger-border bg-danger-subtle text-danger",
  neutro: "border-border bg-surface-hover text-foreground-muted",
};

/**
 * O chip de estado de um registro, com o ponto da cor antes do texto
 * ("● ATIVO", "● Assinado"). `maiusculas={false}` deixa o texto como veio,
 * como nos status de documento do painel.
 */
export function SeloDeStatus({
  intencao = "neutro",
  maiusculas = true,
  className,
  children,
}: {
  intencao?: IntencaoDoSeloDeStatus;
  /** Padrão: `true` (rótulo em maiúsculas, como nas grades de cadastro). */
  maiusculas?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.25 rounded-xl border px-2 py-0.75 text-xs font-bold whitespace-nowrap",
        maiusculas ? "tracking-[0.3px] uppercase" : "font-semibold",
        STATUS[intencao],
        className
      )}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
