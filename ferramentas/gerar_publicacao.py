"""
Monta a pasta `publicacao/` com SOMENTE os arquivos que devem ir para o servidor.

Fica de fora tudo o que não é do site: README, esta pasta de ferramentas, a página
de teste actioncall/, anotações, histórico do git e as imagens originais pesadas.
Das imagens, só vão as que o site realmente usa (procuradas no HTML, CSS e JS).

    python ferramentas/gerar_publicacao.py

Resultado (espelha a raiz do servidor):

    publicacao/
    ├── .htaccess      -> vai para a RAIZ do servidor (substitui o do WordPress)
    └── WEBSITE/       -> vai para a raiz como pasta WEBSITE (o site inteiro)

Leia antes o aviso no topo do arquivo .htaccess.
"""
import pathlib
import re
import shutil

RAIZ = pathlib.Path(__file__).resolve().parent.parent
DESTINO = RAIZ / "publicacao"
PASTA_SITE = "WEBSITE"  # mesmo nome usado no .htaccess

# Arquivos do site, copiados para publicacao/WEBSITE/ (tudo o mais fica de fora)
ARQUIVOS = [
    "index.html",
    "404.html",
    "robots.txt",
    "sitemap.xml",
    "hidro/index.html",
    "assets/css/style.css",
    "assets/js/config.js",
    "assets/js/data.js",
    "assets/js/site.js",
    "assets/js/simulacao.js",
]
# Imagens usadas fora do HTML/CSS/JS (metadados de compartilhamento)
IMAGENS_EXTRAS = ["og-radcom.jpg", "logo.jpeg", "favicon.png"]


def imagens_usadas():
    usadas = set(IMAGENS_EXTRAS)
    for rel in ARQUIVOS:
        if rel.endswith((".html", ".css", ".js")):
            texto = (RAIZ / rel).read_text(encoding="utf-8")
            usadas.update(re.findall(r"img_radcom/([A-Za-z0-9_.-]+\.(?:webp|jpe?g|png|svg))", texto))
    return sorted(usadas)


def main():
    if DESTINO.exists():
        shutil.rmtree(DESTINO)
    DESTINO.mkdir()
    # .htaccess vai para a raiz do servidor, fora da pasta do site
    shutil.copy2(RAIZ / ".htaccess", DESTINO / ".htaccess")
    print("  .htaccess  (raiz do servidor)")

    total = 0
    faltando = []
    copiar = list(ARQUIVOS) + [f"img_radcom/{n}" for n in imagens_usadas()]
    for rel in copiar:
        origem = RAIZ / rel
        if not origem.exists():
            faltando.append(rel)
            continue
        alvo = DESTINO / PASTA_SITE / rel
        alvo.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(origem, alvo)
        total += origem.stat().st_size
        print(f"  {PASTA_SITE}/{rel}")
    print(f"\n{len(copiar) - len(faltando)} arquivos do site, {total / 1024 / 1024:.1f} MB em {DESTINO / PASTA_SITE}")
    if faltando:
        print("\nAVISO: referenciados mas não encontrados (confira se são só comentários):")
        for rel in faltando:
            print(f"  {rel}")


if __name__ == "__main__":
    main()
