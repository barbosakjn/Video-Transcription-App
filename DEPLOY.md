# Guia de Deploy - Video Transcription App

Este guia vai te ajudar a fazer deploy da aplicação no Render.com (gratuito).

## Pré-requisitos

- ✅ Código no GitHub (já feito!)
- ✅ Conta no [Render.com](https://render.com) (criar se não tiver)
- ✅ OpenAI API Key ([obter aqui](https://platform.openai.com/api-keys))

## Passo a Passo

### 1. Criar conta no Render

1. Acesse: https://render.com
2. Clique em "Get Started" ou "Sign Up"
3. Faça login com sua conta do GitHub
4. Autorize o Render a acessar seus repositórios

### 2. Deploy usando Blueprint (Recomendado - Mais Fácil!)

1. No Render Dashboard, clique em **"New +"** → **"Blueprint"**
2. Conecte seu repositório: `barbosakjn/Video-Transcription-App`
3. O Render vai detectar automaticamente o arquivo `render.yaml`
4. Clique em **"Apply"**
5. **IMPORTANTE:** Quando pedir, adicione sua **OPENAI_API_KEY** nas variáveis de ambiente

### 3. Configurar Variáveis de Ambiente

Após o deploy, você precisa configurar algumas variáveis:

#### Backend API e Worker:
- `OPENAI_API_KEY` - Sua chave da OpenAI (**obrigatório**)
- `CORS_ORIGIN` - URL do frontend (Render vai preencher automaticamente)
- `API_URL` - URL do backend (Render vai preencher automaticamente)
- `FRONTEND_URL` - URL do frontend (Render vai preencher automaticamente)

#### Frontend:
- `VITE_API_URL` - URL da API backend (preencher com a URL do serviço backend)

### 4. Aguardar Deploy

O Render vai:
1. ✅ Criar Redis (banco de dados)
2. ✅ Fazer build e deploy do Backend API
3. ✅ Fazer build e deploy do Worker
4. ✅ Fazer build e deploy do Frontend

Isso pode levar 5-10 minutos na primeira vez.

### 5. Testar a Aplicação

Quando tudo estiver verde (✅), acesse a URL do frontend que o Render forneceu!

## URLs dos Serviços

Após o deploy, você terá:
- **Frontend:** `https://video-transcription-frontend.onrender.com`
- **Backend API:** `https://video-transcription-api.onrender.com`
- **Worker:** Rodando em background (sem URL pública)
- **Redis:** Interno (conectado automaticamente)

## Troubleshooting

### Backend não inicia?
- Verifique se a `OPENAI_API_KEY` está configurada
- Verifique os logs no Render Dashboard

### Worker não processa vídeos?
- Verifique se o Redis está rodando
- Verifique os logs do Worker

### Frontend não conecta ao Backend?
- Verifique se `VITE_API_URL` está configurada corretamente
- Verifique se CORS está permitindo o frontend (`CORS_ORIGIN`)

## Limitações do Plano Gratuito

⚠️ **Importante:**
- Serviços ficam inativos após 15 minutos sem uso
- Primeira requisição pode demorar ~1 minuto (cold start)
- Uploads maiores que 100MB podem ter timeout
- Apenas 750 horas/mês de uso gratuito

## Upgrade para Plano Pago

Se precisar de melhor performance:
- Sem cold starts
- Mais RAM e CPU
- Uploads maiores
- A partir de $7/mês por serviço

---

🎉 **Pronto! Sua aplicação está online!**
