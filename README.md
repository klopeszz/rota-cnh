# Rota CNH

Plataforma web de estudo para a primeira habilitação, com foco em São Paulo. Reúne seis módulos de teoria, 42 questões autorais com explicações e um simulado geral de 30 questões. O treino de reforço prioriza temas com menor aproveitamento e questões já erradas.

## Rodar no VS Code

Abra a pasta do projeto no editor:

```powershell
code .
```

Abra `index.html` com a extensão **Live Server** no VS Code e clique em **Go Live**. O endereço local funciona apenas no computador onde o servidor foi iniciado.

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
- Após entrar ou confirmar o cadastro, a pessoa vai para a página inicial; a conta continua acessível pelo menu.
- Sem login, o progresso fica no armazenamento local deste navegador.
- Com login ativo, o progresso e os simulados são sincronizados por conta, usando Supabase Auth e a tabela `study_progress` com políticas RLS.

## Ativar login e sincronização

1. Crie um projeto no Supabase e, no **SQL Editor**, execute o conteúdo de `supabase-schema.sql`.
2. No painel do projeto, em **Authentication → URL Configuration**, defina como URL do site `https://klopeszz.github.io/rota-cnh/` e permita o redirecionamento `https://klopeszz.github.io/rota-cnh/**`. Para testes locais, permita também `http://127.0.0.1:5500/**` e `http://localhost:5500/**`.
3. Em **Project Settings → API**, copie a **Project URL** e a chave **publishable** (ou a chave pública `anon`, se o projeto ainda mostrar esse nome) para `supabase-config.js`, nos campos `url` e `publishableKey`.
4. Publique os arquivos atualizados no repositório GitHub Pages. A configuração publishable/anon é pública; nunca coloque `service_role` ou `secret` em arquivos do site.

O primeiro login combina o progresso local existente com o histórico da conta. Os dados de cada conta são protegidos pelas políticas de Row Level Security incluídas no SQL. A autenticação por e-mail pode exigir confirmação conforme a configuração do projeto Supabase.

Os resumos seguem os grandes eixos da Portaria Senatran 923/2025. As questões são autorais. O simulado segue a quantidade e a referência de acertos da Resolução Contran 1.020/2025, com distribuição própria de temas. As referências completas estão na seção **Fontes oficiais** do site.
