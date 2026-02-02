# PartnerSync Landing Page

Landing page de alta conversão focada em B2C com integração automática ao CRM PartnerSync.

## 🚀 Início Rápido

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 📋 Características

- ✅ Design premium com gradientes e animações
- ✅ Formulário progressivo em 3 etapas
- ✅ Integração automática com Firebase/CRM
- ✅ Responsivo (mobile-first)
- ✅ Otimizado para conversão B2C

## 🔧 Configuração

### Firebase

As credenciais do Firebase já estão configuradas em `src/firebaseConfig.ts`.

### Company ID

Para alterar o ID da empresa que receberá os leads, edite `src/components/LeadForm.tsx`:

```typescript
const LANDING_PAGE_COMPANY_ID = 'SEU_COMPANY_ID';
```

## 📦 Estrutura

```
src/
├── components/          # Componentes da landing page
│   ├── Hero.tsx        # Seção hero com CTA
│   ├── Features.tsx    # Funcionalidades
│   ├── SocialProof.tsx # Depoimentos e stats
│   ├── LeadForm.tsx    # Formulário de captura
│   ├── Footer.tsx      # Rodapé
│   └── Success.tsx     # Página de sucesso
├── firebaseConfig.ts   # Configuração Firebase
├── types.ts            # TypeScript types
└── index.css           # Design system
```

## 🎨 Customização

### Cores

Edite as variáveis CSS em `src/index.css`:

```css
:root {
  --primary: #6366f1;
  --secondary: #ec4899;
  --accent: #14b8a6;
}
```

### Textos

- Hero: `src/components/Hero.tsx`
- Features: `src/components/Features.tsx`
- Depoimentos: `src/components/SocialProof.tsx`

## 🚀 Deploy

### Vercel (Recomendado)

```bash
npm install -g vercel
vercel
```

### Netlify

1. Conecte o repositório
2. Build command: `npm run build`
3. Publish directory: `dist`

### Firebase Hosting

```bash
firebase init hosting
firebase deploy --only hosting
```

## 📊 Integração CRM

Quando um lead preenche o formulário, 3 ações automáticas ocorrem:

1. **Client** criado no Firestore
2. **Deal** criado no pipeline (estágio "lead")
3. **Interaction** registrada no histórico

Todos os dados ficam disponíveis no CRM PartnerSync.

## 📝 Licença

Propriedade de PartnerSync © 2026
