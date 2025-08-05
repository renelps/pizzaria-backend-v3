# 🍕 Sistema de Pedidos para Pizzaria - Backend com NestJS + Prisma

Este é um projeto backend completo para gerenciamento de pedidos de uma pizzaria, desenvolvido com NestJS, Prisma ORM e PostgreSQL. A API oferece autenticação robusta, controle de estoque, pedidos em tempo real, pagamentos com Stripe, documentação Swagger, integração com Google Maps para cálculo de distância e duração das entregas, e muito mais.

## 🚀 Tecnologias Utilizadas

- NestJS — Framework modular e escalável para Node.js  
- TypeScript — Tipagem estática para JavaScript  
- Prisma ORM — ORM moderno para Node.js  
- PostgreSQL — Banco de dados relacional  
- Stripe — Integração de pagamentos online  
- Swagger (nestjs/swagger) — Documentação automática da API  
- WebSockets — Comunicação em tempo real  
- JWT — Autenticação com tokens  
- Google Maps API — Cálculo de distância e duração para entregas
- Jest — Testes automatizados para a API (controle e services)

## 📁 Módulos e Funcionalidades

### 🔐 Autenticação
- Login com JWT e Refresh Token  
- Controle de acesso com roles (ADMIN, USER, etc.)  
- Decorators e Guards personalizados (@Roles, JwtAuthGuard, etc.)  

### 🍕 Pizzas
- CRUD de produtos (pizzas)  
- Filtros personalizados  
- Suporte a tradução de conteúdo  

### 🛒 Pedidos
- Criação e atualização de pedidos  
- Atualização de status (paid, etc.)  
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

## 🗂 Estrutura de Pastas

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

## 📌 Melhorias Futuras

- Dashboard para administrador  
- Upload de imagens (ex: Cloudinary)  
- Suporte a multi-idiomas  
- Logs e métricas avançadas
- Testes automatizados com biblioteca de testes (ex: Jest)
- Pipeline de CI/CD com GitHub Actions
- Containerização com Docker
- Deploy e serviços com AWS (S3, EC2, RDS)

## 👨‍💻 Autor

Desenvolvido por [**Renan Gabriel**](https://github.com/renelps) — Full Stack Developer.

## 📝 Licença

Este projeto está sob a licença **MIT**.

