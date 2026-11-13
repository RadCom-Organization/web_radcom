"""
Grava no HTML o conteúdo que o JavaScript monta a partir de assets/js/data.js
(cartões das linhas no Início e vitrine de produtos da Hidro).

Por quê: o Google lê melhor o texto que já vem escrito no HTML. Sem isso, nomes e
descrições dos produtos só existiriam depois que o JavaScript rodasse.
O site continua funcionando igual: o site.js remonta as listas ao carregar a página.

Quando rodar: sempre que editar assets/js/data.js.

    python ferramentas/prerender.py

Requer: pip install playwright  &&  python -m playwright install chromium
"""
import pathlib
import re
import sys

from playwright.sync_api import sync_playwright

RAIZ = pathlib.Path(__file__).resolve().parent.parent

# página -> ids das listas geradas por JS
ALVOS = {
    "index.html": ["lines-list"],
    "hidro/index.html": ["products-list"],
}


def main():
    with sync_playwright() as p:
        nav = p.chromium.launch()
        pagina = nav.new_page()
        for arquivo, ids in ALVOS.items():
            caminho = RAIZ / arquivo
            pagina.goto(caminho.as_uri())
            pagina.wait_for_load_state("load")
            texto = caminho.read_text(encoding="utf-8")
            for alvo in ids:
                html = pagina.eval_on_selector(f"#{alvo}", "el => el.innerHTML").strip()
                if not html:
                    sys.exit(f"ERRO: #{alvo} ficou vazio em {arquivo}")
                padrao = re.compile(
                    rf"(<!-- PRERENDER:{re.escape(alvo)} -->).*?(<!-- /PRERENDER -->)", re.S
                )
                if not padrao.search(texto):
                    sys.exit(f"ERRO: marcador PRERENDER:{alvo} não encontrado em {arquivo}")
                texto = padrao.sub(lambda m: f"{m.group(1)}\n{html}\n{m.group(2)}", texto, count=1)
                print(f"{arquivo}: #{alvo} gravado ({len(html)} caracteres)")
            caminho.write_text(texto, encoding="utf-8", newline="")
        nav.close()


if __name__ == "__main__":
    main()
