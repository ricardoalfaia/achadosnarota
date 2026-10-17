import { useId, useState } from "react";

import { Botao } from "../../Botao";
import { CampoDeTexto } from "../../CampoDeTexto";
import { Checkbox } from "../../Checkbox";
import { Dialogo } from "../../Dialogo";
import { Select } from "../../Select";
import type {
  CondicaoDeFiltro,
  JuncaoDeFiltro,
  OperadorDeNumero,
  OperadorDeTexto,
  TipoDeColuna,
} from "../tipos";
import { interpretarEdicao } from "../valores";
import {
  operadoresDe,
  operadorPadraoDe,
  type OperadorDeCondicao,
} from "./operadores";

/** Valor do Select da segunda condição quando ela não é usada. */
const NENHUMA = "nenhuma";

type Clausula = {
  operador: OperadorDeCondicao | typeof NENHUMA;
  termo: string;
};

/** Texto que o diálogo mostra para um termo guardado na condição. */
function termoComoTexto(termo: string | number): string {
  return typeof termo === "number" ? String(termo).replace(".", ",") : termo;
}

function clausulasDe(
  condicao: CondicaoDeFiltro | undefined,
  operadorInicial: OperadorDeCondicao
): { primeira: Clausula; juncao: JuncaoDeFiltro; segunda: Clausula } {
  const vazia: Clausula = { operador: NENHUMA, termo: "" };
  if (!condicao) {
    return {
      primeira: { operador: operadorInicial, termo: "" },
      juncao: "e",
      segunda: vazia,
    };
  }
  return {
    primeira: {
      operador: condicao.operador,
      termo: termoComoTexto(condicao.termo),
    },
    juncao: condicao.segunda?.juncao ?? "e",
    segunda: condicao.segunda
      ? {
          operador: condicao.segunda.operador,
          termo: termoComoTexto(condicao.segunda.termo),
        }
      : vazia,
  };
}

/**
 * Monta a condição a partir do que foi preenchido. `undefined` quando a
 * primeira cláusula não está completa ou um número não pôde ser lido.
 */
export function montarCondicao(
  tipo: TipoDeColuna,
  primeira: Clausula,
  juncao: JuncaoDeFiltro,
  segunda: Clausula,
  diferenciarCaixa: boolean
): CondicaoDeFiltro | undefined {
  if (primeira.operador === NENHUMA || primeira.termo.trim() === "") {
    return undefined;
  }
  const temSegunda =
    segunda.operador !== NENHUMA && segunda.termo.trim() !== "";

  if (tipo === "numero") {
    const termo = interpretarEdicao(primeira.termo, "numero");
    if (typeof termo !== "number") return undefined;
    const condicao: CondicaoDeFiltro = {
      tipo: "numero",
      operador: primeira.operador as OperadorDeNumero,
      termo,
    };
    if (!temSegunda) return condicao;
    const termoDaSegunda = interpretarEdicao(segunda.termo, "numero");
    if (typeof termoDaSegunda !== "number") return undefined;
    return {
      ...condicao,
      segunda: {
        juncao,
        operador: segunda.operador as OperadorDeNumero,
        termo: termoDaSegunda,
      },
    };
  }

  return {
    tipo: "texto",
    operador: primeira.operador as OperadorDeTexto,
    termo: primeira.termo,
    diferenciarCaixa: diferenciarCaixa || undefined,
    segunda: temSegunda
      ? {
          juncao,
          operador: segunda.operador as OperadorDeTexto,
          termo: segunda.termo,
        }
      : undefined,
  };
}

function CampoDeTermo({
  label,
  tipo,
  valor,
  aoMudar,
  focoInicial,
}: {
  label: string;
  tipo: TipoDeColuna;
  valor: string;
  aoMudar: (valor: string) => void;
  focoInicial?: boolean;
}) {
  return (
    <CampoDeTexto
      label={label}
      tamanho="md"
      valor={valor}
      aoMudar={aoMudar}
      placeholder="Digite o valor"
      modoDeEntrada={tipo === "numero" ? "decimal" : undefined}
      focoInicial={focoInicial}
    />
  );
}

/**
 * O "Filtro customizado" do Excel: mostrar as linhas onde a coluna satisfaz
 * uma condição e, opcionalmente, uma segunda, unidas por E ou OU.
 */
export function FiltroCustomizado({
  titulo,
  tipo,
  condicao,
  operadorInicial,
  aoAplicar,
  aoCancelar,
}: {
  titulo: string;
  tipo: TipoDeColuna;
  /** A condição em vigor na coluna, para editar. */
  condicao: CondicaoDeFiltro | undefined;
  /** Operador escolhido no submenu ("Contém..."); sem ele, vale o da condição ou o padrão. */
  operadorInicial?: OperadorDeCondicao;
  aoAplicar: (condicao: CondicaoDeFiltro) => void;
  aoCancelar: () => void;
}) {
  const inicial = clausulasDe(
    condicao,
    operadorInicial ?? operadorPadraoDe(tipo)
  );
  const [primeira, setPrimeira] = useState<Clausula>(() =>
    operadorInicial && condicao
      ? { ...inicial.primeira, operador: operadorInicial }
      : inicial.primeira
  );
  const [juncao, setJuncao] = useState<JuncaoDeFiltro>(inicial.juncao);
  const [segunda, setSegunda] = useState<Clausula>(inicial.segunda);
  const [diferenciarCaixa, setDiferenciarCaixa] = useState(
    condicao?.tipo === "texto" && Boolean(condicao.diferenciarCaixa)
  );
  const id = useId();

  const operadores = operadoresDe(tipo);
  const operadoresDaSegunda: readonly {
    valor: Clausula["operador"];
    label: string;
  }[] = [{ valor: NENHUMA, label: "Nenhuma" }, ...operadores];
  const pronta = montarCondicao(
    tipo,
    primeira,
    juncao,
    segunda,
    diferenciarCaixa
  );

  return (
    <Dialogo
      aberto
      aoFechar={aoCancelar}
      titulo="Filtro customizado"
      descricao={`Mostrar as linhas onde ${titulo}:`}
      tamanho="md"
      semRolagem
      semVeu
      rodape={
        <>
          <Botao variante="fantasma" onClick={aoCancelar}>
            Cancelar
          </Botao>
          <Botao type="submit" form={`${id}-form`} desabilitado={!pronta}>
            OK
          </Botao>
        </>
      }
    >
      <form
        id={`${id}-form`}
        className="flex flex-col gap-4 pt-1"
        onSubmit={(evento) => {
          evento.preventDefault();
          if (pronta) aoAplicar(pronta);
        }}
      >
        <div className="grid grid-cols-[minmax(0,13rem)_minmax(0,1fr)] gap-3">
          <Select
            label="Condição"
            tamanho="md"
            opcoes={operadores}
            valor={primeira.operador}
            aoMudar={(operador) => setPrimeira({ ...primeira, operador })}
          />
          <CampoDeTermo
            label="Valor"
            tipo={tipo}
            valor={primeira.termo}
            aoMudar={(termo) => setPrimeira({ ...primeira, termo })}
            focoInicial
          />
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <fieldset className="flex items-center gap-4">
            <legend className="sr-only">Combinar as condições com</legend>
            {(["e", "ou"] as const).map((opcao) => (
              <label
                key={opcao}
                className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-foreground"
              >
                <input
                  type="radio"
                  name={`${id}-juncao`}
                  value={opcao}
                  checked={juncao === opcao}
                  onChange={() => setJuncao(opcao)}
                  className="size-4 cursor-pointer accent-primary"
                />
                {opcao === "e" ? "E" : "OU"}
              </label>
            ))}
          </fieldset>
          {tipo === "texto" && (
            <Checkbox
              label="Diferenciar maiúsculas e minúsculas"
              marcado={diferenciarCaixa}
              aoMudar={setDiferenciarCaixa}
            />
          )}
        </div>

        <div className="grid grid-cols-[minmax(0,13rem)_minmax(0,1fr)] gap-3">
          <Select
            label="Segunda condição"
            tamanho="md"
            lado="cima"
            opcoes={operadoresDaSegunda}
            valor={segunda.operador}
            aoMudar={(operador) => setSegunda({ ...segunda, operador })}
          />
          <CampoDeTermo
            label="Segundo valor"
            tipo={tipo}
            valor={segunda.termo}
            aoMudar={(termo) => setSegunda({ ...segunda, termo })}
          />
        </div>
      </form>
    </Dialogo>
  );
}
