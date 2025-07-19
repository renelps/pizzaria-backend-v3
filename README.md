# 🍕 Sistema de Pedidos para Pizzaria - Backend com NestJS + Prisma

Este é um projeto backend completo para gerenciamento de pedidos de uma pizzaria, desenvolvido com **NestJS**, **Prisma ORM** e **PostgreSQL**.  
A API oferece autenticação robusta, controle de estoque, pedidos em tempo real, pagamentos com Stripe, documentação Swagger, integração com Google Maps para cálculo de distância e duração das entregas, e muito mais.

---

## 🚀 Tecnologias Utilizadas

- [NestJS](https://nestjs.com/) — Framework modular e escalável para Node.js  
- [TypeScript](https://www.typescriptlang.org/) — Tipagem estática para JavaScript  
- [Prisma ORM](https://www.prisma.io/) — ORM moderno para Node.js  
- [PostgreSQL](https://www.postgresql.org/) — Banco de dados relacional  
- [Stripe](https://stripe.com/) — Integração de pagamentos online  
- [Swagger (nestjs/swagger)](https://docs.nestjs.com/openapi/introduction) — Documentação automática da API  
- WebSockets — Comunicação em tempo real  
- JWT — Autenticação com tokens  
- **Google Maps API** — Cálculo de distância e duração para entregas  

---

## 📁 Módulos e Funcionalidades

### 🔐 Autenticação
- Login com JWT e Refresh Token  
- Controle de acesso com roles (`ADMIN`, `USER`, etc.)  
- Decorators e Guards personalizados (`@Roles`, `JwtAuthGuard`, etc.)  

### 🍕 Pizzas
- CRUD de produtos (pizzas)  
- Filtros personalizados  
- Suporte a tradução de conteúdo  

### 🛒 Pedidos
- Criação e atualização de pedidos  
- Atualização de status (`paid`, etc.)  
- WebSocket para comunicação em tempo real  

### 🛵 Entregas
- Cadastro e atualização de endereços  
- Gerenciamento do fluxo de entrega  
- Integração com Google Maps para cálculo automático de distância e duração  

### 💳 Pagamentos
- Integração com Stripe  
- Serviço dedicado para processar pagamentos  

### ⭐ Avaliações
- Cadastro e edição de avaliações pelos clientes  

### 📦 Controle de Estoque
- Registro de movimentações  
- Suporte a entradas e saídas de produtos  

### 📘 Documentação Swagger
- Documentação interativa via Swagger UI  
- Endereço: `http://localhost:3000/api`  

---

## 🗂 Estrutura de Pastas

```
src/
├── auth/             # Login, guards e estratégias JWT
├── delivery/         # Entregas, endereços e Google Maps
├── orders/           # Pedidos + WebSocket
├── payments/         # Pagamentos com Stripe
├── pizza/            # CRUD de pizzas com filtros
├── reviews/          # Sistema de avaliações
├── stockMovements/   # Movimentações de estoque
├── prisma/           # Serviço do Prisma
├── app.module.ts     # Módulo principal
└── main.ts           # Entrypoint da aplicação
```

---

## ⚙️ Como Executar o Projeto

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/seu-repo.git
cd nome-da-pasta
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o ambiente

Crie um arquivo `.env` na raiz com o seguinte conteúdo:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/nome_do_banco"
JWT_SECRET="sua_chave_jwt"
JWT_REFRESH_SECRET="chave_refresh_token"
STRIPE_SECRET_KEY="chave_secreta_do_stripe"
GOOGLE_MAPS_API_KEY="sua_chave_api_google_maps"
```

### 4. Rode as migrations

```bash
npx prisma migrate dev
```

### 5. Inicie o servidor

```bash
npm run start:dev
```

Acesse a documentação Swagger:  
📄 [http://localhost:3333/api](http://localhost:3333/api)

---

## 📌 Melhorias Futuras

- Dashboard para administrador  
- Upload de imagens (ex: Cloudinary)  
- Suporte a multi-idiomas  
- Logs e métricas avançadas  

---

## 👨‍💻 Autor

Desenvolvido por [**Renan Gabriel**](https://www.linkedin.com/in/renangabrieldev/) — Full Stack Developer.

---

## 📝 Licença

Este projeto está sob a licença [MIT](LICENSE).
