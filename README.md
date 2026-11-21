# Rota CNH

Plataforma web de estudo para a primeira habilitação, com foco em São Paulo. Reúne seis módulos de teoria, 42 questões autorais com explicações e um simulado geral de 30 questões. O treino de reforço prioriza temas com menor aproveitamento e questões já erradas.

## Rodar no VS Code

Abra a pasta do projeto no editor:

```powershell
code .
```

Abra o arquivo `index.html` no navegador. Para testar com servidor local, execute `py -m http.server 8000` no terminal e acesse <http://localhost:8000>.

## Publicar no GitHub Pages

Crie um repositório público vazio no GitHub. Em um clone ou pasta que ainda não esteja vinculada ao remoto, siga os passos aplicáveis:

```powershell
git init -b main
git add .
git commit -m "Cria a plataforma Rota CNH"
git remote add origin https://github.com/SEU-USUARIO/rota-cnh.git
git push -u origin main
```

No GitHub, abra **Settings → Pages**. Em **Build and deployment**, escolha **Deploy from a branch**, selecione **main** e **/(root)**, e clique em **Save**. O link da página aparece após o deploy. Os próximos pushes para `main` atualizam a publicação.

## Projeto

- `index.html` e `styles.css` estruturam a interface responsiva.
- `conteudo.js` reúne os módulos de estudo e o banco de questões.
- `app.js` controla simulados, cronômetro, correções, histórico e reforço.
- O progresso fica no armazenamento local do navegador e depende do endereço em que o site é aberto.

Os resumos seguem os grandes eixos da Portaria Senatran 923/2025. As questões são autorais. O simulado segue a quantidade e a referência de acertos da Resolução Contran 1.020/2025, com distribuição própria de temas. As referências completas estão na seção **Fontes oficiais** do site.
